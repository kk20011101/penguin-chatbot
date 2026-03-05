import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 起動時に環境変数が読み込めているかチェック
console.log("--- サーバー起動チェック ---");
console.log("PORT:", process.env.PORT);
console.log("APIキー(頭5文字):", process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.slice(0, 5) : "設定されていません！");

const siteText = "東京確率論セミナー2025年度の概要情報";

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
          { role: "system", content: `あなたはアシスタントです。参考情報: ${siteText}` },
          { role: "user", content: req.body.message }
        ]
      })
    });

    // ここで一回だけ定義します
    const data = await response.json();
    console.log("OpenRouterからの生レスポンス:", JSON.stringify(data));

    // dataの中身を安全に取り出す
    const reply = data?.choices?.[0]?.message?.content || "AIからの返答が空でした。";
    
    // もしエラーメッセージが含まれていたらそれもログに出す
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