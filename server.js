// server.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // public フォルダ配下を静的配信

console.log("APIキー:", process.env.OPENROUTER_API_KEY?.slice(0,5) + "…");

// 簡単なテキストでテスト用
const siteText = "東京確率論セミナー2025年度の概要情報";

// /chat エンドポイント
app.post("/chat", async (req, res) => {
  try {
    // ユーザーからのメッセージ
    const userMessage = req.body.message;

    // OpenRouter へのリクエスト
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "stepfun/step-3.5-flash",
        messages: [
          {
            role: "system",
            content: `あなたは東京確率セミナー2025年度の情報に基づいて質問に答えるアシスタントです。参考情報: ${siteText}`
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // 応答テキストを取り出す
    const reply = data?.choices?.[0]?.message?.content || "すみません、回答できませんでした。";

    res.json({ reply: reply + " 🐧" });

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "API error" });
  }
});

// サーバー起動
app.listen(3000, () => console.log("Server running on port 3000"));