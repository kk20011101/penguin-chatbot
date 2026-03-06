import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrape() {
  try {
    // 取得したいHPのURLをここに書く
    const url = "https://あなたのHPのURL"; 
    console.log(`${url} から情報を取得中...`);

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // 不要な要素（ナビゲーションやフッター）を除外してテキストを抽出
    $('nav, footer, script, style').remove();
    
    // 主要なテキスト要素を抜き出す
    let text = "";
    $('h1, h2, h3, p, li').each((i, el) => {
      const content = $(el).text().trim();
      if (content) {
        text += content + "\n";
      }
    });

    // data.txt という名前で保存
    fs.writeFileSync('data.txt', text);
    console.log("✅ 最新のHP情報を data.txt に保存しました！");

  } catch (error) {
    console.error("❌ スクレイピング中にエラーが発生しました:", error.message);
    process.exit(1);
  }
}

scrape();
