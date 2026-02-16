import requests
from bs4 import BeautifulSoup
import os

# --- 設定 ---
TARGET_URL = "https://sites.google.com/view/tokyo-probability-seminar23/2025年度" 
OUTPUT_FILE = "website_data.txt"

# 1. User-Agentを設定し、ブラウザからのアクセスに見せかける
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# --- 関数定義 ---
def scrape_website_text(url):
    """
    指定されたURLからHTMLを取得し、テキストコンテンツを抽出する関数
    """
    try:
        # 2. 修正: headers=HEADERS を追加してアクセス
        response = requests.get(url, headers=HEADERS)
        
        # デバッグ: ステータスコードをターミナルに表示
        print(f"DEBUG: HTTP Status Code: {response.status_code}")
        
        # 接続エラーやステータスコード（4xx, 5xx）を確認
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Google Sitesは構造が特殊なため、一旦絞り込みを解除（コメントアウト）し、
        # ページ全体のテキストを取得する方が確実な場合があります。
        target_soup = soup
        # main_content_div = soup.find('div', id='main-content')
        # if main_content_div:
        #     target_soup = main_content_div
        # else:
        #     target_soup = soup
            
        # 一般的に不要なタグを除去
        for script_or_style in target_soup(['script', 'style', 'header', 'footer', 'nav']):
            script_or_style.decompose()

        text = target_soup.get_text()

        # 不要な改行やスペースを整理
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # デバッグ: 抽出されたデータサイズを表示
        print(f"DEBUG: Extracted Text Length: {len(cleaned_text)} characters")

        return cleaned_text

    except requests.exceptions.RequestException as e:
        print(f"ウェブサイトへのアクセス中にエラーが発生しました: {e}")
        return None

# --- 実行部分 ---
print(f"--- {TARGET_URL} から情報を取得中 ---")
scraped_data = scrape_website_text(TARGET_URL)

if scraped_data:
    # 取得したデータを website_data.txt に上書き保存
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(scraped_data)
    
    print(f"✅ スクレイピングが完了し、{OUTPUT_FILE}を更新しました。")
    print(f"データサイズ: {len(scraped_data)} 文字")
else:
    print("❌ スクレイピングに失敗しました。")