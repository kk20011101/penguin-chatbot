import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const TARGET_PAGES = [
  {
    label: '2027年度',
    url: 'https://sites.google.com/view/tokyo-probability-seminar23'
  }
];

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function scrapePage({ label, url }) {
  console.log(`${label}: ${url} から情報を取得中...`);

  const { data } = await axios.get(url, {
    headers: REQUEST_HEADERS
  });

  const $ = cheerio.load(data);
  const sections = [];

  $('section').each((_, el) => {
    const sectionText = $(el).text().replace(/\s+/g, ' ').trim();
    if (sectionText.length > 10) {
      sections.push(sectionText);
    }
  });

  if (sections.length === 0) {
    throw new Error(`${label} から本文を抽出できませんでした`);
  }

  return `【${label}】\n\n${sections.join('\n\n')}`;
}

async function scrape() {
  const results = [];
  const failures = [];

  for (const page of TARGET_PAGES) {
    try {
      const pageText = await scrapePage(page);
      results.push(pageText);
    } catch (error) {
      failures.push(`- ${page.label}: ${error.message}`);
      console.error(`❌ ${page.label} の取得に失敗しました:`, error.message);
    }
  }

  if (results.length === 0) {
    console.error('❌ すべてのページのスクレイプに失敗しました。');
    process.exit(1);
  }

  const text = [
    '【東京確率論セミナー スクレイプ結果】',
    '',
    ...results,
  ].join('\n\n');

  fs.writeFileSync('data.txt', text);
  console.log('✅ セミナー情報を data.txt に保存完了！');
  console.log('内容プレビュー:', text.substring(0, 200) + '...');

  if (failures.length > 0) {
    console.log('⚠️ 一部のページ取得に失敗しました:');
    console.log(failures.join('\n'));
  }
}

scrape();
