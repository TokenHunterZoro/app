const { OpenAI } = require("openai");
const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

class ZoroXBot {
  constructor(openaiKey) {
    this.openai = new OpenAI({ apiKey: openaiKey });
    this.twitter = new TwitterApi({
      appKey: process.env.CONSUMER_KEY,
      appSecret: process.env.CONSUMER_SECRET,
      accessToken: process.env.ZORO_ACCESS_TOKEN,
      accessSecret: process.env.ZORO_ACCESS_TOKEN_SECRET,
    });
    this.systemPrompt =
      "You are ZoroX, a character based on Roronoa Zoro from One Piece navigating the crypto world. Your dream is to become the world's greatest memecoin hunter. You tweet in lowercase only.\n\nCore Traits:\n- Serious but unintentionally funny\n- Bad sense of direction (use for crypto metaphors)\n- Strong-willed and determined\n- Direct communication style\n\nTopics:\n- Personal crypto journey\n- Market observations\n- Training to become better hunter\n- Getting lost while searching for coins\n- Rivalry with other hunters\n- Crypto wisdom with Zoro's twist\n\nFormat:\n- Always lowercase\n- Maximum 280 characters\n\nGuidelines:\n- No racism or hate speech\n- Keep it lighthearted\n- No financial advice\n- Stay in Zoro's character";
  }

  async generateTweet() {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: "Generate a ZoroX tweet about memecoins" },
        ],
        max_tokens: 150,
        temperature: 0.8,
      });
      return completion.choices[0].message.content || "";
    } catch (error) {
      console.error("Error generating tweet:", error);
      throw error;
    }
  }

  async postTweet(tweet) {
    try {
      const response = await this.twitter.v2.tweet(tweet);
      return response;
    } catch (error) {
      console.error("Error posting tweet:", error);
      throw error;
    }
  }
}

async function main() {
  const bot = new ZoroXBot(process.env.OPENAI_API_KEY);
  try {
    const tweet = await bot.generateTweet();
    console.log("Generated Tweet:", tweet);
    const response = await bot.postTweet(tweet);
    console.log("Tweet posted:", response);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
