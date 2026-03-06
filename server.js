import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 最初は空で宣言（let を使う）
let siteText = "";

const dataFilePath = path.join(__dirname, 'data.txt');

try {
  if (!fs.existsSync(dataFilePath)) {
    throw new Error('データファイルが存在しません');
  }

  // UTF-8形式でファイルを読み込む
  siteText = fs.readFileSync(dataFilePath, 'utf-8');
  console.log(`--- ファイルから情報を読み込みました: ${path.basename(dataFilePath)} ---`);
} catch (err) {
  console.log("--- データファイルが見つからないため、初期値を使用します ---");
  // ファイルがない場合のデフォルト値
  siteText = "セミナーの詳細はWebサイトを確認してください。";
}

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 起動時に環境変数が読み込めているかチェック
console.log("--- サーバー起動チェック ---");
console.log("PORT:", process.env.PORT);
console.log("APIキー(頭5文字):", process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.slice(0, 5) : "設定されていません！");

app.post("/chat", async (req, res) => {
  console.log("ユーザーからメッセージを受信:", req.body.message);

  try {
    const now = new Date();
    const nowJst = now.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        // 修正ポイント1: 実際のアプリのURL、または空でない適切なURLを入れる
        "HTTP-Referer": "https://penguin-chatbot.onrender.com", 
        "X-Title": "Penguin Chatbot"
      },
      body: JSON.stringify({
        // 修正ポイント2: モデル名が正しいか再確認。もしダメなら下記を試す
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `あなたはアシスタントのピーちゃんです。現在日時（日本時間/JST）は ${nowJst} です。参考情報: ${siteText}`
          },
          { role: "user", content: req.body.message }
        ],
        // 修正ポイント3: 無料モデルでタイムアウトを防ぐための安全策
        timeout: 30000 
      })
    });

    const data = await response.json();
    console.log("OpenRouterからの生レスポンス:", JSON.stringify(data));

    if (!response.ok) {
      const errorMessage = data?.error?.message || `OpenRouter API error: ${response.status}`;
      console.error("OpenRouter側でエラーが発生しています:", errorMessage);
      return res.status(response.status).json({ error: errorMessage });
    }

    const reply = data?.choices?.[0]?.message?.content || "AIからの返答が空でした。";

    res.json({ reply: reply + " 🐧" });

  } catch (error) {
    console.error("重大なエラーが発生しました:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`サーバーがポート ${PORT} で稼働中`));