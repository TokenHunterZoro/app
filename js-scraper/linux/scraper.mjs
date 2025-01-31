export class VideoScraper {
  static async extractVideoData(videoElement) {
    try {
      const data = {};

      // Extract posted time
      const timeData = await VideoScraper._extractPostedTime(videoElement);
      if (!timeData) {
        console.log("Time info not present. Skipping...");
        return null;
      }

      const currentTimestamp = Date.now() / 1000;
      const videoTimestamp = timeData.posted_timestamp;

      const timeDiff = currentTimestamp - videoTimestamp;
      if (timeDiff > 48 * 3600) {
        // 24 hours in seconds
        console.log("Video older than 2 days. Skipping...");
        return null;
      }

      Object.assign(data, timeData);

      // Extract other video data
      Object.assign(data, await VideoScraper._extractVideoUrl(videoElement));
      Object.assign(data, await VideoScraper._extractThumbnail(videoElement));
      Object.assign(data, await VideoScraper._extractHashtags(videoElement));
      Object.assign(data, await VideoScraper._extractAuthor(videoElement));
      Object.assign(data, await VideoScraper._extractViews(videoElement));

      data.extracted_time = new Date().toISOString();
      console.log("Extracted Video Data...")
      console.log(data)
      return data;
    } catch (e) {
      console.log(`Error extracting video data: ${e}`);
      return null;
    }
  }

  static async _extractPostedTime(videoElement) {
    try {
      const timeSelectors = ["div[class*='DivTimeTag']"];

      let postedTime = "";
      let postedDatetime = new Date(0);

      for (const selector of timeSelectors) {
        try {
          const timeElement = await videoElement.$eval(selector, (el) =>
            el.textContent.trim()
          );
          if (timeElement) {
            postedTime = timeElement;
            postedDatetime = VideoScraper._parseTikTokTime(postedTime);
            break;
          }
        } catch {
          continue;
        }
      }

      if (!postedTime) {
        postedTime = "1s";
      }
      if (postedDatetime.getTime() === 0) {
        postedDatetime = new Date(Date.now() - 1000);
      }

      return {
        posted_time: postedTime,
        posted_timestamp: postedDatetime.getTime() / 1000,
      };
    } catch (e) {
      console.log(`Error getting posted time: ${e}`);
      return null;
    }
  }

  static async _extractVideoUrl(videoElement) {
    try {
      const linkSelectors = [
        "a.css-1g95xhm-AVideoContainer",
        "a[href*='/video/']",
        "a[class*='AVideoContainer']",
      ];
      for (const selector of linkSelectors) {
        try {
          const url = await videoElement.$eval(selector, (el) => el.href);
          if (url && url.includes("/video/")) {
            return { video_url: url };
          }
        } catch {
          continue;
        }
      }
    } catch (e) {
      console.log(`Error getting video URL: ${e}`);
    }
    return { video_url: "" };
  }

  static async _extractThumbnail(videoElement) {
    try {
      const thumbnailSelectors = [
        "img[alt][src*='tiktokcdn']",
        "img[src*='tiktokcdn']",
        "img[class*='poster']",
      ];
      for (const selector of thumbnailSelectors) {
        try {
          const thumbUrl = await videoElement.$eval(selector, (el) => el.src);
          if (thumbUrl) {
            return { thumbnail_url: thumbUrl };
          }
        } catch {
          continue;
        }
      }
    } catch (e) {
      console.log(`Error getting thumbnail: ${e}`);
    }
    return { thumbnail_url: "" };
  }

  static async _extractHashtags(videoElement) {
    try {
      const hashtagsSelectors = ["a.css-4rbku5-A", "a[href*='/tag/']"];
      const hashtags = [];
      for (const selector of hashtagsSelectors) {
        try {
          const hashtagElements = await videoElement.$$eval(
            selector,
            (elements) =>
              elements
                .map((el) => el.textContent.trim())
                .filter((text) => text && text.startsWith("#"))
          );
          hashtags.push(...hashtagElements);
        } catch {
          continue;
        }
      }
      return { hashtags };
    } catch (e) {
      console.log(`Error getting hashtags: ${e}`);
    }
    return { hashtags: [] };
  }

  static async _extractAuthor(videoElement) {
    try {
      const authorSelectors = [
        "p[class*='PUniqueId']",
        "p[class*='PUserName']",
      ];
      for (const selector of authorSelectors) {
        try {
          const author = await videoElement.$eval(selector, (el) =>
            el.textContent.trim()
          );
          if (author) {
            return { author };
          }
        } catch {
          continue;
        }
      }
    } catch (e) {
      console.log(`Error getting author: ${e}`);
    }
    return { author: "" };
  }

  static async _extractViews(videoElement) {
    try {
      const viewsSelectors = ["strong[class*='StrongVideoCount']"];
      for (const selector of viewsSelectors) {
        try {
          const views = await videoElement.$eval(selector, (el) =>
            el.textContent.trim()
          );
          if (views) {
            return { views };
          }
        } catch {
          continue;
        }
      }
    } catch (e) {
      console.log(`Error getting views: ${e}`);
    }
    return { views: "" };
  }

  static _parseTikTokTime(timeStr) {
    const now = new Date();
    const value = parseInt(timeStr);

    if (timeStr.includes("s")) {
      return new Date(now - value * 1000);
    } else if (timeStr.includes("m")) {
      return new Date(now - value * 60 * 1000);
    } else if (timeStr.includes("h")) {
      return new Date(now - value * 60 * 60 * 1000);
    } else if (timeStr.includes("d")) {
      return new Date(now - value * 24 * 60 * 60 * 1000);
    }

    return now;
  }
}

export async function extractComments(postId) {
  const comments = [];
  const seenComments = new Set(); // Track unique user-comment combinations
  let cursor = 0;
  const mentions = {}


  const findCryptoTickers = (responseData) => {
    const { data: text, timestamp } = responseData

    // Split text into words
    const words = text.split(/[\s,]+/).map(word => word.trim());

    const ignoreWords = ['solana', '#solana', '#nft', 'pump', 'dev', 'tokens', 'token', 'every', 'this', 'their', 'WTTTTFFFFF', 'released', 'payment', 'new', 'just', 'trades', 'nfa', 'dyor', 'big', 'of', 'month', 'doing', 'burning', 'ai', 'nft', 'crypto', 'hold', 'hodl', 'btc', 'eth', 'xrp', 'xrpl', 'sol', 'doge', 'pepe', 'go', 'ui', 'coin', 'to', 'fix', 'guys', 'in', 'its', 'too', 'late', 'sui', 'account', 'join', 'official', 'ca', 'you', 'page', 'telegram', 'calls', 'the', 'best', 'is', 'okx', 'a', 'omg', 'market', 'cap', 'low', 'high', 'usd', 'dm', 'easy', 'made', 'crazy', 'going', 'asap', 'come', 'on', 'been', 'today', 'usdc', 'usdt', 'no', 'period', 'math', 'will', 'moon', 'lfg', 'cto', 'tg', 'my', 'last', 'free', 'buy', 'sell', 'but', 'bitcoin', 'ethereum', 'and', 'what', 'think', 'about', 'not', 'trade', 'mev', 'cyber', 'support', 'lmao', 'lol', 'many', 'now']

    for (const word of words) {
      if (ignoreWords.includes(word.toLowerCase())) continue;
      if (
        /0x[a-fA-F0-9]{40}/i.test(word) ||
        /[1-9A-HJ-NP-Za-km-z]{32,44}/.test(word)
      ) {
        mentions[word] = { count: (mentions[word]?.count || 0) + 1, isTicker: false, timestamp };
        continue;
      }

      if (
        /^\$[A-Za-z][A-Za-z0-9]{1,9}$/i.test(word) ||  // Cashtags
        /^#[A-Za-z][A-Za-z0-9]{1,9}$/i.test(word) ||   // Hashtags
        /^[A-Z][A-Z0-9]{1,9}$/.test(word)              // UPPERCASE words
      ) {
        console.log(word)
        const ticker = word.startsWith('$') || word.startsWith('#')
          ? word.substring(1)
          : word;
        mentions[ticker] = { count: (mentions[ticker]?.count || 0) + 1, isTicker: true, timestamp };
      }
    }
  };

  const makeRequest = async (cursor) => {
    const url = `https://www.tiktok.com/api/comment/list/?WebIdLastTime=1729273214&aid=1988&app_language=en&app_name=tiktok_web&aweme_id=${postId}&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F129.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&count=20&cursor=${cursor}&data_collection_enabled=false&device_id=7427171842932786693&device_platform=web_pc&focus_state=true&from_page=video&history_len=6&is_fullscreen=false&is_page_visible=true&odinId=7427171704705188869&os=windows&priority_region=&referer=&region=CA&screen_height=1080&screen_width=1920&tz_name=Asia%2FTehran&user_is_login=false&webcast_language=en&msToken=U488DBL2ELMV88PxvXu7bOKQJVxuv7LnhKNHsWaOT2uQhpGyj5M-7EmUsXBIS9HbQ_bQ35u3Za-f_hVhHMMYsH-4mxWPeJoUeMhgOHOvQ-IaKb5lr3DlgBIYJXCUc9MCexCHXig1u4a98hVjnec74fs=&X-Bogus=DFSzswVYtfhANH-ltQ2xJbJ92U6T&_signature=_02B4Z6wo000017DRplgAAIDBt3uT.9qT9Zew0aLAAIsv87`;
    const response = await fetch(url);

    return await response.json();
  };

  while (true) {
    try {
      const rawData = await makeRequest(cursor);
      const commentData = rawData.comments;
      if (!commentData) break;
      for (const cm of commentData) {
        const responseData = {};
        const userId = cm.user.uid;
        responseData.timestamp = cm.create_time;

        responseData.data =
          cm.text || cm.share_info.desc.split("'s comment:")[1];
        const commentIdentifier = `${userId}:${responseData.data}`;

        if (seenComments.has(commentIdentifier)) {
          continue;
        }

        seenComments.add(commentIdentifier);
        comments.push(responseData);

        findCryptoTickers(responseData);

      }

      if (rawData.has_more === 1) {
        console.log("more comments available");
        cursor += 20;
        console.log("Cursor at ", cursor);

      } else {
        console.log("no more comments available");
        break;
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      break;
    }
  }

  console.log("\nFetched all comments!");

  return {
    count: comments.length,
    mentions,
  };
}


