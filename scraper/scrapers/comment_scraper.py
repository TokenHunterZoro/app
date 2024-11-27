import requests
import json
import re
from collections import defaultdict
from utils.chrome import DEFAULT_HEADERS

def req(post_id, curs):
    url = f'https://www.tiktok.com/api/comment/list/?WebIdLastTime=1729273214&aid=1988&app_language=en&app_name=tiktok_web&aweme_id={post_id}&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F129.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&count=20&cursor={curs}&data_collection_enabled=false&device_id=7427171842932786693&device_platform=web_pc&focus_state=true&from_page=video&history_len=6&is_fullscreen=false&is_page_visible=true&odinId=7427171704705188869&os=windows&priority_region=&referer=&region=CA&screen_height=1080&screen_width=1920&tz_name=Asia%2FTehran&user_is_login=false&webcast_language=en&msToken=U488DBL2ELMV88PxvXu7bOKQJVxuv7LnhKNHsWaOT2uQhpGyj5M-7EmUsXBIS9HbQ_bQ35u3Za-f_hVhHMMYsH-4mxWPeJoUeMhgOHOvQ-IaKb5lr3DlgBIYJXCUc9MCexCHXig1u4a98hVjnec74fs=&X-Bogus=DFSzswVYtfhANH-ltQ2xJbJ92U6T&_signature=_02B4Z6wo000017DRplgAAIDBt3uT.9qT9Zew0aLAAIsv87'
    response = requests.get(url=url, headers=DEFAULT_HEADERS)
    info = response.text
    raw_data = json.loads(info)
    print(f'we are on {curs} cursor')
    return raw_data

def find_crypto_tickers(text):
    # Pattern 1: Match $TICKER format
    dollar_pattern = r'\$([A-Z]{2,10})'
    
    # Pattern 2: Match standalone uppercase words that look like tickers
    # This will look for uppercase words 2-10 characters long
    # We'll exclude common English words to reduce false positives
    word_pattern = r'\b([A-Z]{2,10})\b'
    
    # Common words to exclude (add more as needed)
    common_words = {'THE', 'IS', 'ARE', 'WAS', 'WERE', 'BE', 'THIS', 'THAT', 'IT', 'LOL', 'OMG'}
    
    tickers = []
    
    # Find tickers with $ symbol
    dollar_tickers = re.findall(dollar_pattern, text)
    tickers.extend(dollar_tickers)
    
    # Find potential tickers without $ symbol
    word_tickers = re.findall(word_pattern, text)
    # Filter out common words
    word_tickers = [t for t in word_tickers if t not in common_words]
    tickers.extend(word_tickers)
    
    return tickers

def extract_comments(post_id):
    comments = []
    seen_comments = set()  # Track unique user-comment combinations
    ticker_counts = defaultdict(int)
    curs = 0
    
    while True:
        raw_data = req(post_id, curs)
        comment_data = raw_data['comments']
        
        for cm in comment_data:
            # Get user ID
            user_id = cm['user']['uid']
            
            # Get comment text
            com = cm['share_info']['desc']
            if com == "":
                com = cm['text']
                
            # Create unique identifier for user-comment combination
            comment_identifier = f"{user_id}:{com}"
            
            # Skip if we've seen this exact comment from this user
            if comment_identifier in seen_comments:
                continue
                
            seen_comments.add(comment_identifier)
            comments.append(com)
            
            # Find and count crypto tickers in the comment
            tickers = find_crypto_tickers(com)
            for ticker in tickers:
                ticker_counts[ticker] += 1
        
        if raw_data['has_more'] == 1:
            curs += 20
            print('moving to the next cursor')
        else:
            print('no more comments available')
            break
    
    print("\nFetched all comments!")
    
    # Prepare response object
    response = {
        "count": len(comments),
        "tickers": dict(ticker_counts),  # Convert defaultdict to regular dict
        "data": comments
    }
    
    return response