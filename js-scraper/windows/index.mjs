// Place these at the very top of the file, before any other imports
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { extractComments, VideoScraper } from "../scraper.mjs";
import { addTiktoks } from "../supabase.mjs";
dotenv.config();

// Configure logging
const logger = {
  info: (...args) => console.log(new Date().toISOString(), "INFO:", ...args),
  error: (...args) =>
    console.error(new Date().toISOString(), "ERROR:", ...args),
};

const processedUrls = new Set();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
const supabase = createClient(url, key);

const setupBrowser = async () => {
  try {
    puppeteer.use(StealthPlugin());

    const options = {
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
      ],
      executablePath: process.env.EXECUTABLE_PATH,
      userDataDir: process.env.USER_DATA_DIR,
    };

    const browser = await puppeteer.launch(options);
    return browser;
  } catch (e) {
    logger.error(`Failed to create browser: ${e}`);
    return null;
  }
};

const verifyPageLoaded = async (page, url, timeout = 60000) => {
  try {
    logger.info(`Loading ${url}...`);
    await page.goto(url, { waitUntil: "networkidle0", timeout });
    await page.waitForSelector("body");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    logger.info(`Successfully loaded ${url}`);
    return true;
  } catch (e) {
    logger.error(`Error loading page: ${e}`);
    return false;
  }
};

const extractVideoData = async (element) => {
  try {
    const videoData = await VideoScraper.extractVideoData(element);
    console.log(videoData);
    return videoData;
  } catch (e) {
    return null;
  }
};

const processSearchTerm = async (page, keyword, maxResults = 50) => {
  const searchUrl = `https://www.tiktok.com/search?q=${keyword}`;
  const results = [];
  const scrollPauseTime = 2000;

  try {
    console.log(`\nProcessing search term: ${keyword}`);
    console.log(`Navigating to: ${searchUrl}`);

    if (await verifyPageLoaded(page, searchUrl)) {
      console.log("\nWaiting for video feed...");

      while (results.length < maxResults) {
        // const videoElements = await page.$$('div[class*="DivItemContainerV2"]');
        const videoElements = await page.$$(
          'div[class*="DivItemContainerForSearch"]'
        );

        if (!videoElements.length) {
          console.log("No video elements found. Waiting...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        console.log(videoElements.length);

        for (const element of videoElements) {
          if (results.length >= maxResults) break;

          const videoData = await extractVideoData(element);
          if (
            videoData &&
            videoData?.video_url &&
            !processedUrls.has(videoData.video_url)
          ) {
            console.log(
              `Found video ${results.length}/${maxResults}: ${videoData.video_url}`
            );

            const postId = videoData.video_url.split("/").pop();
            videoData.comments = await extractComments(postId);
            console.log(`Found ${videoData.comments.count} comments`);

            processedUrls.add(videoData.video_url);
            results.push(videoData);
          }
        }

        if (results.length >= maxResults) {
          console.log(`\nReached target number of videos for '${keyword}'`);
          break;
        }

        const previousHeight = await page.evaluate(
          "document.documentElement.scrollHeight"
        );
        await page.evaluate(
          "window.scrollTo(0, document.documentElement.scrollHeight)"
        );
        await new Promise((resolve) => setTimeout(resolve, scrollPauseTime));
        const newHeight = await page.evaluate(
          "document.documentElement.scrollHeight"
        );
        if (newHeight === previousHeight) {
          console.log(`\nReached end of feed for '${keyword}'`);
          break;
        }
      }
    }

    return results;
  } catch (e) {
    console.error(`\nError processing search term '${keyword}': ${e}`);
    return results;
  }
};

const processHashtagTerm = async (page, keyword, maxResults = 50) => {
  const hashtagUrl = `https://www.tiktok.com/tag/${keyword}`;
  const results = [];
  const scrollPauseTime = 2000;

  try {
    console.log(`\nProcessing hashtag term: ${keyword}`);
    console.log(`Navigating to: ${hashtagUrl}`);

    if (await verifyPageLoaded(page, hashtagUrl)) {
      console.log("\nWaiting for video feed...");

      while (results.length < maxResults) {
        const videoElements = await page.$$('div[class*="DivItemContainerV2"]');

        if (!videoElements.length) {
          console.log("No video elements found. Waiting...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        for (const element of videoElements) {
          if (results.length >= maxResults) break;

          const videoData = await extractVideoData(element);
          if (videoData?.video_url && !processedUrls.has(videoData.video_url)) {
            console.log(
              `Found video ${results.length}/${maxResults}: ${videoData.video_url}`
            );

            const postId = videoData.video_url.split("/").pop();
            videoData.comments = await extractComments(postId);
            console.log(`Found ${videoData.comments.count} comments`);

            processedUrls.add(videoData.video_url);
            results.push(videoData);
          }
        }

        if (results.length >= maxResults) {
          console.log(`\nReached target number of videos for '${keyword}'`);
          break;
        }

        const previousHeight = await page.evaluate(
          "document.documentElement.scrollHeight"
        );
        await page.evaluate(
          "window.scrollTo(0, document.documentElement.scrollHeight)"
        );
        await new Promise((resolve) => setTimeout(resolve, scrollPauseTime));

        const newHeight = await page.evaluate(
          "document.documentElement.scrollHeight"
        );
        if (newHeight === previousHeight) {
          console.log(`\nReached end of feed for '${keyword}'`);
          break;
        }
      }
    }

    return results;
  } catch (e) {
    console.error(`\nError processing hashtag term '${keyword}': ${e}`);
    return results;
  }
};

const saveCombinedResults = (results) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `combined_results_${timestamp}.json`;
    fs.writeFileSync(
      filename,
      JSON.stringify(
        {
          extraction_time: new Date().toISOString(),
          total_searches: results.length,
          results: results,
        },
        null,
        2
      )
    );
    return filename;
  } catch (e) {
    console.error("Error saving results:", e);
    return null;
  }
};

const main = async () => {
  const searchTerms = ["memecoin", "solana", "crypto", "pumpfun"];

  const hashtagTerms = ["memecoin", "solana", "crypto", "pumpfun"];

  const selectedProfile = "Profile 3";
  logger.info(`Using Chrome profile: ${selectedProfile}`);

  try {
    logger.info("Starting Chrome with profile...");
    const browser = await setupBrowser(true, selectedProfile);

    if (!browser) {
      logger.error("Failed to create Chrome browser");
      return;
    }

    const page = await browser.newPage();
    logger.info("Chrome started successfully");

    const allResults = [];

    for (const search of searchTerms) {
      const results = await processSearchTerm(page, search, 100);
      if (results.length) {
        allResults.push({
          search,
          total_videos: results.length,
          videos: results,
        });
        console.log(
          `Successfully processed ${results.length} videos for '${search}'`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log("\nAll search terms processed!");

    for (const hashtag of hashtagTerms) {
      const results = await processHashtagTerm(page, hashtag, 200);
      if (results.length) {
        allResults.push({
          search: "#" + hashtag,
          total_videos: results.length,
          videos: results,
        });
        console.log(
          `Successfully processed ${results.length} videos for '#${hashtag}'`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // if (allResults.length) {
    //   const savedPath = saveCombinedResults(allResults);
    //   if (savedPath) {
    //     console.log("\nSuccessfully saved all results!");
    //   }
    //   await addTiktoks(supabase, {
    //     extraction_time: new Date().toISOString(),
    //     total_searches: allResults.length,
    //     results: allResults,
    //   });
    // }

    console.log("\nAll hashtag terms processed!");
    console.log("Press Enter to close browser...");
    await new Promise((resolve) => process.stdin.once("data", resolve));
  } catch (e) {
    logger.error(`Unexpected error: ${e}`);
  } finally {
    try {
      if (browser) {
        await browser.close();
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
};

main();
