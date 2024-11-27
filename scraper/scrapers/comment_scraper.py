import time
import requests
from config import DEFAULT_HEADERS

def extract_comments(video_url):
    """Extract comments from a TikTok video URL"""
    try:
        post_id = video_url.split('/')[-1]
        comments = []
        cursor = 0
        
        while True:
            url = f'https://www.tiktok.com/api/comment/list/?WebIdLastTime=1729273214&aid=1988&app_language=en&app_name=tiktok_web&aweme_id={post_id}&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F129.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&count=20&cursor={cursor}&device_platform=web_pc&focus_state=true&from_page=video&history_len=6&is_fullscreen=false&is_page_visible=true&os=windows&priority_region=&referer=&region=CA&screen_height=1080&screen_width=1920&tz_name=Asia%2FTehran&user_is_login=false&webcast_language=en'
            
            response = requests.get(url=url, headers=DEFAULT_HEADERS)
            raw_data = response.json()
            
            if 'comments' not in raw_data:
                break
                
            for comment in raw_data['comments']:
                com = comment['share_info']['desc']
                if com == "":
                    com = comment['text']
                comments.append(com)
            
            if raw_data['has_more'] == 1:
                cursor += 20
                time.sleep(1)
            else:
                break
                
        return comments
        
    except Exception as e:
        print(f"Error extracting comments: {e}")
        return []
