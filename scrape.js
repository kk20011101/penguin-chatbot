import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrape() {
  try {
    // ターゲットのURL
    const url = "https://sites.google.com/view/tokyo-probability-seminar23/"; 
    console.log(`${url} からセミナー情報を取得中...`);

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);

    // Googleサイトの本文が入っているエリアを指定して抽出
    // 全体のテキストを取得し、余分な空白を整理
    let text = "【東京確率論セミナー 概要情報】\n\n";
    
    // メインコンテンツが含まれる要素（Googleサイト特有の構成）から抽出
    $('section').each((i, el) => {
      const sectionText = $(el).text().replace(/\s+/g, ' ').trim();
      if (sectionText.length > 10) { // 短すぎるゴミデータを除外
        text += sectionText + "\n\n";
      }
    });

    // 保存
    fs.writeFileSync('data.txt', text);
    console.log("✅ セミナー情報を data.txt に保存完了！");
    console.log("内容プレビュー:", text.substring(0, 100) + "...");

  } catch (error) {
    console.error("❌ エラーが発生しました:", error.message);
    process.exit(1);
  }
}

scrape();
