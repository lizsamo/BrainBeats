require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const apiKey = process.env.TOPMEDIAI_API_KEY;

fetch("https://api.topmediai.com/v1/voices_list", {
  method: "GET",
  headers: {
    "x-api-key": apiKey
  }
})
  .then(res => res.json())
  .then(data => {
    console.log("🎤 Available Voices:\n");

    data.Voice.forEach((voice, index) => {
      console.log(`🎧 ${index + 1}. ${voice.name}`);
      console.log(`   Type     : ${voice.classnamearray}`);
      console.log(`   SpeakerID: ${voice.speaker}`);
      console.log(`   ---------`);
    });
  })
  .catch(err => {
    console.error("❌ Error fetching voice list:", err);
  });
