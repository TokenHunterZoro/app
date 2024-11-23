import requests
import json

hashtag = "funny"  # Replace with your desired hashtag
headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'referer': f'https://www.tiktok.com/tag/{hashtag}',
    'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
}

posts = []
curs = 0  # Starting cursor

def fetch_hashtag_posts(hashtag, cursor):
    url = f"https://www.tiktok.com/api/hashtag/item_list/?aid=1988&count=20&cursor={cursor}&hashtag={hashtag}"
    response = requests.get(url, headers=headers)
    raw_data = response.json()
    return raw_data

def parse_posts(data):
    items = data.get('itemList', [])
    for item in items:
        post_info = {
            "id": item.get("id"),
            "desc": item.get("desc"),
            "author": item.get("author", {}).get("nickname"),
            "video_url": item.get("video", {}).get("downloadAddr"),
        }
        print(post_info)
        posts.append(post_info)
    return data.get('hasMore', False)

while True:
    try:
        raw_data = fetch_hashtag_posts(hashtag, curs)
        print("Raw data")
        print(raw_data)
        if not raw_data:
            print("No data received. Check your headers or parameters.")
            break

        has_more = parse_posts(raw_data)
        if has_more:
            curs += 20  # Update cursor for next page
            print(f"Moving to cursor: {curs}")
        else:
            print("No more posts available.")
            break
    except Exception as e:
        print(f"An error occurred: {e}")
        break

# Save results
with open('hashtag_posts.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, ensure_ascii=False, indent=4)

print("Data saved successfully!")
