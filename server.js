import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from 'fs';

// 1. 最初は空で宣言（let を使う）
let siteText = "";

try {
  // UTF-8形式でファイルを読み込む
  siteText = fs.readFileSync('./data.txt', 'utf-8');
  console.log("--- ファイルから情報を読み込みました ---");
} catch (err) {
  console.log("--- data.txtが見つからないため、初期値を使用します ---");
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

// 2. 【修正箇所】 const を取って、既存の変数に代入する形にします
// もし「ファイルの内容」ではなく「この固定文字」を優先したい場合はこのままでOKです
siteText = "東京確率論セミナー2025年度の概要情報"; 

app.post("/chat", async (req, res) => {
  console.log("ユーザーからメッセージを受信:", req.body.message);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://render.com",
        "X-Title": "Penguin Chatbot"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001", 
        messages: [
          { role: "system", content: `あなたはアシスタントのピーちゃんです。参考情報: ${siteText}` },
          { role: "user", content: req.body.message }
        ]
      })
    });

    const data = await response.json();
    console.log("OpenRouterからの生レスポンス:", JSON.stringify(data));

    const reply = data?.choices?.[0]?.message?.content || "AIからの返答が空でした。";
    
    if (data.error) {
      console.error("OpenRouter側でエラーが発生しています:", data.error.message);
    }

    res.json({ reply: reply + " 🐧" });

  } catch (error) {
    console.error("重大なエラーが発生しました:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`サーバーがポート ${PORT} で稼働中`));