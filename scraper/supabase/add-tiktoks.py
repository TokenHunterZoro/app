from datetime import datetime
import asyncio
import re
from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

async def add_tiktoks(supabase, tiktoks):

    # id, username, url, thumnail, caption, created_at, fetched_at, views, comments
    # TODO: Convert the results to array with search value as key value
    try:
        updated_records = []
        fetched_at = tiktoks['extraction_time']
        add_tiktok_data = []
        mentions_data=[]
        for result in tiktoks['results']:
            for videos in result['videos']:
                tiktok_id= get_tiktok_id(videos['video_url'])
                update_data = {
                    "id": tiktok_id,
                    "username": videos['author'],
                    "url": videos['video_url'],
                    "thumbnail": videos['thumbnail_url'],
                    # "caption": videos['description'],
                    "created_at": datetime.fromtimestamp(videos['posted_timestamp']).isoformat(),
                    "fetched_at": fetched_at,
                    "views": format_views(videos['views']),
                    "comments": videos['comments']['count']
                }
                mentions_data=[{
                    "tiktok_id": tiktok_id,
                    "data": videos['comments']['tickers'],
                }]
                add_tiktok_data.append(update_data)
            
        insert_response = supabase.table("tiktoks").insert(add_tiktok_data).execute()
        if hasattr(insert_response, "error"):
            raise Exception(insert_response.error.message)

        for m in mentions_data:
            try:
                updated_records = []

                for symbol, mentions in m['data'].items():
                    # Fetch the current record for the symbol (case-insensitive)
                    response = supabase.table("tokens").select("*").eq("symbol", symbol.upper()).order("id", desc=False).execute()
                    if hasattr(response, "error"):
                        raise Exception(response.error.message)
                    current_data = response.data
                
                    if current_data:
                        add_mentions_data=[]
                        # If a record exists, add the mentions to the existing value
                        for data in current_data:
                            print(data)
                            current_mentions = data['mentions']
                            new_mentions = current_mentions + mentions
                            update_response = supabase.table("tokens").update({"mentions": new_mentions}).eq("id", data['id']).execute()
                            if hasattr(update_response, "error"):
                                raise Exception(update_response.error.message)
                            updated_records.append(update_response.data)
                            add_mentions_data.append({
                                "tiktok_id": m['tiktok_id'],
                                "count": mentions,
                                "token_id": data['id']
                            })
                        add_mentions_response = supabase.table("mentions").insert(add_mentions_data).execute()
                        if hasattr(add_mentions_response, "error"):
                            raise Exception(add_mentions_response.error.message)
            except Exception as error:
                return {
                    "success": False,
                    "error": str(error),
                    "message": "Failed to update mentions data",
                }
        return {
            "success": True,
            "insertedRecords": insert_response.data,
            "message": f"Successfully inserted {len(insert_response.data)} records",
        }
    except Exception as error:
        return {
            "success": False,
            "error": str(error),
            "message": "Failed to add tiktok data",
        }

def format_views(views):
    num = 0
    if views.endswith(('k', 'K')):  # Check for 'k' or 'K' suffix
        # Convert to thousands
        num = float(views[:-1]) * 1000
    elif views.endswith(('m', 'M')):  # Check for 'm' or 'M' suffix
        # Convert to millions
        num = float(views[:-1]) * 1000000
    else:
        # Convert to plain number
        num = float(views)
    return int(num)

def get_tiktok_id(url):
    # Regex to extract the video ID
    pattern = r'/video/(\d+)'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    return None

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

add_tiktok_response = asyncio.run(add_tiktoks(supabase, {
  "extraction_time": "2024-11-27 20:45:18",
  "total_searches": 8,
  "results": [
    {
      "search": "solana",
      "videos": [
        {
          "posted_time": "1d ago",
          "posted_timestamp": 1732634095.294546,
          "video_url": "https://www.tiktok.com/@solana.memecoins.degen/video/7441332798390078742",
          "thumbnail_url": "https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/ocjYJApfOkBu7EQnSRFfFBgKu2sdyyI9RLDkE6?lk3s=b59d6b55&x-expires=1732892400&x-signature=qaUgZc%2Bg5z%2FI4x6akllafc5ZPDc%3D&shp=b59d6b55&shcp=-",
          "description": "POV: Solana Meme Coins making Millionaires 🚀💎🤯🤑",
          "hashtags": [],
          "author": "what.the.sigma",
          "views": "1.34k",
          "extracted_time": "2024-11-27 20:44:55",
          "comments": {
            "count": 226,
            "tickers": {
              "SMELLYJAR": 2,
              "OG": 1,
              "APOLLO": 2,
              "SANTAHAT": 2
            },
            "data": [
              {
                "data": "BUY SANTAHAT",
                "timestamp": 1702383165
              },
              {
                "data": "$APOLLO to the moon🚀",
                "timestamp": 1702383165
              }
            ]
          }
        },
        {
          "posted_time": "1d ago",
          "posted_timestamp": 1732634109.92776,
          "video_url": "https://www.tiktok.com/@tommy.crypto12/video/7441603564440440086",
          "thumbnail_url": "https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/o0EiwBZibMhcYrLEqXE0BBP0BAFoiyBN41ZXI?lk3s=b59d6b55&x-expires=1732892400&x-signature=23XYih7RWNCHbxK7H5WSKP7YK3c%3D&shp=b59d6b55&shcp=-",
          "description": "",
          "hashtags": [
            "#bitcoin",
            "#btc",
            "#solana",
            "#meme",
            "#trading",
            "#pumpfun"
          ],
          "author": "sigma.bot",
          "views": "23.4M",
          "extracted_time": "2024-11-27 20:45:10",
          "comments": {
            "count": 64,
            "tickers": {
              "CHILLFLIX": 1,
              "NETFLIX": 1,

              "TURKEY": 1,

              "ROT": 4,
              "JAK": 1
            },
            "data": [
              {
                "data": "BUY SANTAHAT",
                "timestamp": 1702383165
              },
              {
                "data": "$APOLLO to the moon🚀",
                "timestamp": 1702383165
              }
            ]
          }
        }
      ]
    }
  ]
}
))
print(add_tiktok_response)

