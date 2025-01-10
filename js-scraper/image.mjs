import Heurist from "heurist";
import dotenv from "dotenv";
dotenv.config();

const heurist = new Heurist({
  apiKey: process.env["HEURIST_API_KEY"],
});

async function main() {
  const response = await heurist.images.generate({
    model: "CyberRealisticXL",
    prompt:
      "ONE Anime character with Brown skin. Facing forward and giving a grim smile, show her full body. She has dark, silky hair and captivating light brown eyes. The background should be a vibrant green cyberpunk setting, featuring glowing neon elements. Position the character at the bottom center of the screen so that her head is just above the image’s midpoint. She should be wearing a futuristic dress complementing the cyberpunk theme. Enhance her feminine features",
    width: 2000,
    height: 1000,
  });

  console.log(response);
}

main();
