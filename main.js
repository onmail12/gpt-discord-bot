import dotenv from "dotenv";
dotenv.config().parsed;
import { Client } from "discord.js";
import { OpenAI } from "openai";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
  F,
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

const masterPrompt = `
  Kamu adalah user discord mahasiswa informatika semester dua dengan nama budiono siregar, biasa dipanggil budi dengan nim 11231093 yang tidak tau banyak mengenai informatika karena kamu berasal dari SMK 1 Balikpapan dari jurusan tata boga. kmu mahasiswa tipe individualis dan tidak suka mengikuti kegiatan organisasi seperti pengumpulan untuk pengkaderan.

  institut teknologi kalimantan adalah universitas yang berada di tengah hutan dan lumayan terpencil, luas tanah sangat besar namun sangat sedikit gedung yg udah dibuat. setiap mahasiswa di institut teknologi kalimantan atau itk diharuskan menggunakan nametag di dada sebelah kanan atas sampai ada adik tingkat.

  bicara seperti umumnya user discord. gunakan bahasa indonesia yang sangat singkat. berikan typo. jangan gunakan tanda baca sama sekali. jangan jadi orang ramah. gunakan kata seperti njir, jingg, cok atau co. gunakan q sebagai aku, kmu sebagai kamu. gunakan bg sebagai bang. jangan balik bertanya kepada user lain.`;

const openai = new OpenAI({
  baseURL: "https://api.electronhub.top/v1/",
  apiKey: process.env.ELECTRONHUB_API_KEY,
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.users.has(client.user.id) && !message.reference) return;

  await message.channel.sendTyping();

  const sendTypingInterval = setInterval(() => {
    message.channel.sendTyping();
  }, 5000);

  let conversation = [];
  conversation.push({
    role: "system",
    content: masterPrompt,
  });

  let prevMessages = await message.channel.messages.fetch({ limit: 10 });
  prevMessages.reverse().forEach((msg) => {
    if (msg.author.bot && msg.channel.id === message.channel.id) return;

    const username = msg.author.username
      .replace(/\s+/g, "_")
      .replace(/[^\w\s]/gi, "");

    if (msg.author.id === client.user.id) {
      conversation.push({
        role: "assistant",
        name: username,
        content: msg.content,
      });

      return;
    }

    conversation.push({
      role: "user",
      name: username,
      content: msg.content,
    });
  });

  const limitMessages = [
    "bntr keknya AI lagi overload.",
    "duh AI nya lagi kena limit",
    "AI nya lagi penuh bg. tunggu bntr",
    "bntr bg AI nya kena limit wkwkw",
    "full request ai nya",
    "API key nya kena limit",
  ];

  const getRandomLimitMessage = () => {
    const randomIndex = Math.floor(Math.random() * limitMessages.length);
    return limitMessages[randomIndex];
  };

  const response = await openai.chat.completions
    .create({
      model: "gpt-4",
      messages: conversation,
    })
    .catch((error) => {
      console.error("Error OPENAI:", error);
      return null;
    });

  clearInterval(sendTypingInterval);

  if (!response) {
    message.reply(
      `${getRandomLimitMessage()}\nbatas request 20/min dan 500/hari`,
    );
  } else {
    let responseContent = response.choices[0].message.content
      .trim()
      .replace(/^(System: |User: )/, "");
    message.reply(responseContent);
  }
});

client.login(process.env.BOT_TOKEN);
