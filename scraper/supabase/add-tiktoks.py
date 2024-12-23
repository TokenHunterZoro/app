from datetime import datetime
import asyncio
import re
from dotenv import load_dotenv
import os
from supabase import create_client, Client
import json

load_dotenv()

async def add_tiktoks(supabase, tiktoks):
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
                    "created_at": datetime.fromtimestamp(videos['posted_timestamp']).isoformat(),
                    "fetched_at": fetched_at,
                    "views":  format_views(videos['views'] if len(videos['views']) > 0 else "0"),
                    "comments": videos['comments']['count']
                }
                mentions_data.append({
                    "tiktok_id": tiktok_id,
                    "views": update_data['views'],
                    "data": videos['comments']['tickers'],
                })
                add_tiktok_data.append(update_data)
            
        insert_response = supabase.table("tiktoks").insert(add_tiktok_data).execute()
        if hasattr(insert_response, "error"):
            raise Exception(insert_response.error.message)

        for m in mentions_data:
            try:
                for symbol, mentions in m['data'].items():
                    # Fetch the current record for the symbol (case-insensitive)
                    response = supabase.table("tokens").select("*").ilike("symbol", symbol).order("id", desc=False).execute()
                    if hasattr(response, "error"):
                        print("Error when fetching token data")
                        raise Exception(response.error.message)
                    if len(response.data) == 0:
                        print("Coin not found. Skipping...")
                        continue
                
                    current_data = response.data
                
                    if current_data:
                        add_mentions_data=[]
                        # If a record exists, add the mentions to the existing value
                        for data in current_data:
                            current_mentions = data['mentions']
                            new_mentions = current_mentions + mentions
                            new_views = data['views'] + m['views']
                            print(new_mentions)
                            print(new_views)
                            print(data['id'])
                            print(data['symbol'])

                            update_response = supabase.table("tokens").update({"mentions": new_mentions, 'views': new_views}).eq("id", data['id']).execute()
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

with open('results/data.json', 'r') as file:
  data = json.load(file)

  add_tiktok_response = asyncio.run(add_tiktoks(supabase, data))
  print(add_tiktok_response)

