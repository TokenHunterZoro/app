# config.py
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(BASE_DIR, 'results')
CHROME_USER_DATA_DIR = os.path.expanduser('~/Library/Application Support/Google/Chrome')


DEFAULT_HEADERS = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9,fa;q=0.8',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://www.tiktok.com/explore',
    'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
}

# utils/chrome.py
import os
from config import CHROME_USER_DATA_DIR

def list_chrome_profiles():
    """List available Chrome profiles"""
    profiles = []
    try:
        print(os.listdir(CHROME_USER_DATA_DIR))
        for item in os.listdir(CHROME_USER_DATA_DIR):

            if item.startswith('Profile ') or item == 'Default':
                profiles.append(item)
    except Exception as e:
        print(f"Error listing profiles: {str(e)}")
    return profiles
