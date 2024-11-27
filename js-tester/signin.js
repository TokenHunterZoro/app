const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");

// Store processed videos
let processedVideos = new Set();

// Stealth configurations
const STEALTH_CONFIG = {
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-infobars",
    "--window-position=0,0",
    "--ignore-certifcate-errors",
    "--ignore-certifcate-errors-spki-list",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  ],
  ignoreHTTPSErrors: true,
  defaultViewport: null,
  headless: false,
};

async function initBrowser() {
  const browser = await puppeteer.launch(STEALTH_CONFIG);
  const page = await browser.newPage();

  // Add additional headers
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
  });

  // Enable JavaScript
  await page.setJavaScriptEnabled(true);

  return { browser, page };
}

async function loginToTikTok(page, username, password) {
  try {
    console.log("Starting login process...");

    // Navigate to login page
    await page.goto("https://www.tiktok.com/login/phone-or-email/email", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for login form
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    // Type credentials with random delays
    await typeWithRandomDelay(page, 'input[type="text"]', username);
    await typeWithRandomDelay(page, 'input[type="password"]', password);

    // Click login button
    const loginButton = await page.waitForSelector('button[type="submit"]');
    await randomDelay(1000, 2000);
    await loginButton.click();

    // Wait for potential CAPTCHA or verification
    console.log("Waiting for manual CAPTCHA/verification if needed...");

    // Wait for either the profile icon (success) or CAPTCHA
    await page.waitForFunction(
      () => {
        const profileIcon = document.querySelector('[data-e2e="profile-icon"]');
        const captcha = document.querySelector('iframe[title*="CAPTCHA"]');
        return profileIcon || captcha;
      },
      { timeout: 30000 }
    );

    // Check if CAPTCHA is present
    const hasCaptcha = await page.evaluate(() => {
      return !!document.querySelector('iframe[title*="CAPTCHA"]');
    });

    if (hasCaptcha) {
      console.log("CAPTCHA detected! Please solve it manually...");
      // Wait for manual CAPTCHA solution and successful login
      await page.waitForSelector('[data-e2e="profile-icon"]', {
        timeout: 120000,
      });
    }

    console.log("Login successful!");

    // Save cookies for future sessions
    const cookies = await page.cookies();
    await fs.writeFile("tiktok_cookies.json", JSON.stringify(cookies, null, 2));

    return true;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
}

async function searchTikTok(page, keyword) {
  try {
    const searchUrl = `https://www.tiktok.com/search/video?q=${encodeURIComponent(
      keyword
    )}`;
    console.log(`Searching: ${searchUrl}`);

    await page.goto(searchUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for videos to load
    await page.waitForSelector('[data-e2e="search-card-container"]', {
      timeout: 10000,
    });

    // Scroll to load more content
    await autoScroll(page);

    // Extract video information
    const videos = await page.evaluate(() => {
      const videoCards = document.querySelectorAll(
        '[data-e2e="search-card-container"]'
      );
      return Array.from(videoCards).map((card) => {
        const link = card.querySelector("a");
        const desc = card.querySelector('[data-e2e="search-card-desc"]');
        const stats = Array.from(
          card.querySelectorAll('[data-e2e="search-card-stats"] strong')
        );

        return {
          url: link?.href || "",
          videoId: link?.href?.split("/").pop() || "",
          description: desc?.textContent || "",
          likes: stats[0]?.textContent || "0",
          comments: stats[1]?.textContent || "0",
          shares: stats[2]?.textContent || "0",
          timestamp: new Date().toISOString(),
        };
      });
    });

    console.log(`Found ${videos.length} videos for keyword "${keyword}"`);
    return videos;
  } catch (error) {
    console.error(`Error searching for ${keyword}:`, error);
    return [];
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

async function typeWithRandomDelay(page, selector, text) {
  for (let char of text) {
    await page.type(selector, char);
    await randomDelay(50, 150);
  }
}

async function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min) + min);
  await new Promise((resolve) => setTimeout(resolve, delay));
}

async function monitorKeywords(
  username,
  password,
  keywords,
  interval = 3600000
) {
  let browser;
  let page;

  try {
    const browserInit = await initBrowser();
    browser = browserInit.browser;
    page = browserInit.page;

    // Try to load saved cookies
    try {
      const cookiesString = await fs.readFile("tiktok_cookies.json");
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    } catch (e) {
      console.log("No saved cookies found, proceeding with login...");
    }

    // Test if cookies are valid
    await page.goto("https://www.tiktok.com/foryou");
    const isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('[data-e2e="profile-icon"]');
    });

    if (!isLoggedIn) {
      console.log("Need to login...");
      const loginSuccess = await loginToTikTok(page, username, password);
      if (!loginSuccess) {
        throw new Error("Login failed");
      }
    }

    while (true) {
      console.log(
        "\nStarting new search cycle at:",
        new Date().toLocaleString()
      );

      for (const keyword of keywords) {
        const videos = await searchTikTok(page, keyword);

        // Filter and save new videos
        const newVideos = videos.filter((v) => !processedVideos.has(v.videoId));
        if (newVideos.length > 0) {
          const fileName = `tiktok_${keyword}_${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.json`;
          await fs.mkdir("data", { recursive: true });
          await fs.writeFile(
            path.join("data", fileName),
            JSON.stringify(newVideos, null, 2)
          );
          newVideos.forEach((v) => processedVideos.add(v.videoId));
          console.log(`Saved ${newVideos.length} new videos for "${keyword}"`);
        }

        await randomDelay(5000, 10000);
      }

      console.log(
        `Waiting ${interval / 1000 / 60} minutes until next cycle...`
      );
      await randomDelay(interval, interval + 5000);
    }
  } catch (error) {
    console.error("Monitor error:", error);
    if (browser) await browser.close();

    console.log("Restarting in 5 minutes...");
    setTimeout(
      () => monitorKeywords(username, password, keywords, interval),
      300000
    );
  }
}

// Usage
const KEYWORDS = ["memecoin", "solana", "pumpfun"];
const USERNAME = "loganfernando69@gmail.com";
const PASSWORD = "WhatTheSigma@69";

monitorKeywords(USERNAME, PASSWORD, KEYWORDS);
