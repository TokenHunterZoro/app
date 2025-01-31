import { readFileSync } from 'fs';
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv"
dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
const data = JSON.parse(readFileSync('./linux/result.json'));

function convertToNumber(value) {
    const units = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
    const regex = /^(\d+\.?\d*)([KMBT])$/i;

    const match = value.match(regex);
    if (match) {
        const number = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        return number * units[unit];
    }

    const parsedNumber = parseInt(value)
    return !isNaN(parsedNumber) ? parsedNumber : NaN; // Return NaN if the value doesn't match the pattern
}

const upsertTiktoks = async (tiktokEntries) => {
    try {
        console.log(`Upserting ${tiktokEntries.length} tiktok entries...`);
        const { data, error } = await supabase
            .rpc('upsert_tiktok', {
                tiktok_entries: tiktokEntries
            });

        if (error) throw error;
        console.log('Successfully upserted tiktok entries.');
        return data;
    } catch (error) {
        console.error('Error upserting tiktoks:', error);
        throw error;
    }
};

const upsertMentions = async (mentions) => {
    try {
        console.log(`Upserting ${mentions.length} mention entries...`);
        const { data, error } = await supabase
            .rpc('upsert_mentions', {
                mention_entries: mentions
            });

        if (error) throw error;
        console.log('Successfully upserted mention entries.');
        return data;
    } catch (error) {
        console.error('Error upserting mentions:', error);
        throw error;
    }
};

const upsertMentionsInChunks = async (mentions) => {
    const chunkSize = 1500;
    console.log(`Upserting mentions in chunks of ${chunkSize}...`);
    for (let i = 0; i < mentions.length; i += chunkSize) {
        const chunk = mentions.slice(i, i + chunkSize);
        console.log(`Upserting chunk ${i / chunkSize + 1}...`);
        await upsertMentions(chunk);
    }
    console.log('Successfully upserted all mention chunks.');
};

function normalizeObject(data) {
    const result = { ...data };
    for (const mention in data) {
        if (mention.startsWith("https://")) {
            const address = mention.split('/').pop();

            if (result[address]) result[address].count += data[mention].count;
            else result[address] = { ...data[mention] };

            delete result[mention];
        }
    }
    return result;
}

async function main() {
    console.log('Starting data processing...');
    const tiktoksInputData = [];
    const mentionsInputData = [];
    const snapshot_timestamp = new Date();
    for (const search of data.results) {
        for (const video of search.videos) {
            const { thumbnail_url, video_url, views, posted_timestamp, posted_time, extracted_time, comments, hashtags, author } = video;
            const tiktok_id = video.video_url.split('/').pop();
            tiktoksInputData.push({
                id: tiktok_id,
                tiktok_id,
                url: video_url,
                thumbnail_url,
                creator: author,
                hashtags,
                createdAt: posted_time == '1s' ? new Date(0) : new Date(posted_timestamp * 1000),
                extracted_time: snapshot_timestamp,
                likes: views ? convertToNumber(views) : 0,
            });
            const mentions = normalizeObject(comments.mentions);
            for (const [mention, value] of Object.entries(mentions)) {
                const { count, isTicker } = value;
                mentionsInputData.push({
                    mention: mention.startsWith('https://') ? mention.split('/').pop() : mention,
                    tiktok_id,
                    is_ticker: isTicker,
                    count,
                    snapshot_timestamp
                });
            }
        }
    }
    console.log(`Prepared ${tiktoksInputData.length} tiktok entries and ${mentionsInputData.length} mention entries.`);
    await upsertTiktoks(tiktoksInputData);
    console.log(mentionsInputData[0])
    await upsertMentionsInChunks(mentionsInputData);
    console.log('Data processing completed.');
}

main();
