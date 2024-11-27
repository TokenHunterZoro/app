const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.tiktok.com/login", {
    waitUntil: "networkidle2",
  });

  // Enter username and password
  await page.type("input[name='username']", "loganfernando69", { delay: 100 });
  await page.type("input[name='password']", "WhatTheSigma@69", { delay: 100 });

  // Click the login button
  await page.click("button[type='submit']");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log("Logged in!");

  // Navigate to the TikTok user page or hashtag page
  await page.goto("https://www.tiktok.com/@equa.lcan", {
    waitUntil: "networkidle2",
  });

  // Scroll to load more posts
  let previousHeight = 0;
  let currentHeight = 0;

  do {
    console.log("Scrolling...");
    previousHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    currentHeight = await page.evaluate(() => document.body.scrollHeight);
  } while (currentHeight > previousHeight);

  // Scrape post data
  const posts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".post-class")).map((post) => ({
      title: post.querySelector(".title-class")?.innerText,
      views: post.querySelector(".views-class")?.innerText,
      link: post.querySelector("a")?.href,
    }));
  });

  console.log(posts);
  await browser.close();
})();
