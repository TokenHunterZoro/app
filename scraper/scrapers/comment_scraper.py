import requests
import json
import re
from collections import defaultdict, Counter
from utils.chrome import DEFAULT_HEADERS

def req(post_id, curs):
    url = f'https://www.tiktok.com/api/comment/list/?WebIdLastTime=1729273214&aid=1988&app_language=en&app_name=tiktok_web&aweme_id={post_id}&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F129.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&count=20&cursor={curs}&data_collection_enabled=false&device_id=7427171842932786693&device_platform=web_pc&focus_state=true&from_page=video&history_len=6&is_fullscreen=false&is_page_visible=true&odinId=7427171704705188869&os=windows&priority_region=&referer=&region=CA&screen_height=1080&screen_width=1920&tz_name=Asia%2FTehran&user_is_login=false&webcast_language=en&msToken=U488DBL2ELMV88PxvXu7bOKQJVxuv7LnhKNHsWaOT2uQhpGyj5M-7EmUsXBIS9HbQ_bQ35u3Za-f_hVhHMMYsH-4mxWPeJoUeMhgOHOvQ-IaKb5lr3DlgBIYJXCUc9MCexCHXig1u4a98hVjnec74fs=&X-Bogus=DFSzswVYtfhANH-ltQ2xJbJ92U6T&_signature=_02B4Z6wo000017DRplgAAIDBt3uT.9qT9Zew0aLAAIsv87'
    response = requests.get(url=url, headers=DEFAULT_HEADERS)
    info = response.text
    raw_data = json.loads(info)
    print(f'we are on {curs} cursor')
    return raw_data

def find_crypto_tickers(text):
    cleaned_string = re.sub(r'\$([^\s,]+)', r'\1', text)
    cleaned_string = re.sub(r'[\s,]+', ' ', cleaned_string.strip())
    
    cleaned_string = re.sub(r'[!"#\$%&\'\(\)\*\+,\-\.\/\:;<=>\?@\[\\\]\^_`\{\|\}\~\u00A0-\u10FFFF]', '', cleaned_string)

    words = cleaned_string.lower().split()
    
    ignore_words = ["WHAT","DO","YOU","I",'AND','THE', "THINK", 'IS', 'ARE', 'WAS', 'WERE', 'BE', 'THIS', 'THAT', 'IT', 'LOL', 'OMG' ,'BUY', 'TO', 'ITS', 'MOON', 'LFG', 'HODL', 'SOON', 'ABOUT']
    filtered_words = [word for word in words if word.upper() not in ignore_words]
    
    return dict(Counter(filtered_words))

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
