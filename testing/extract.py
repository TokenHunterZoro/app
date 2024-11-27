import undetected_chromedriver as uc
import os
import time
import json
from datetime import datetime, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import requests, json

def list_chrome_profiles():
    """List available Chrome profiles"""
    base_path = os.path.expanduser('~\\AppData\\Local\\Google\\Chrome\\User Data')
    profiles = []
    try:
        for item in os.listdir(base_path):
            if item.startswith('Profile ') or item == 'Default':
                profiles.append(item)
    except Exception as e:
        print(f"Error listing profiles: {str(e)}")
    return profiles

def parse_tiktok_time(relative_time):
    now = datetime.now()
    if "d" in relative_time:  # Days ago
        days = int(relative_time.split("d")[0])
        return now - timedelta(days=days)
    elif "h" in relative_time:  # Hours ago
        hours = int(relative_time.split("h")[0])
        return now - timedelta(hours=hours)
    elif "m" in relative_time:  # Minutes ago
        minutes = int(relative_time.split("m")[0])
        return now - timedelta(minutes=minutes)
    elif "s" in relative_time:  # Seconds ago
        seconds = int(relative_time.split("s")[0])
        return now - timedelta(seconds=seconds)
    elif "w" in relative_time:  # Weeks ago
        weeks = int(relative_time.split("w")[0])
        return now - timedelta(weeks=weeks)
    else:
        # If no recognizable format, return a very old date
        return datetime.min

def extract_comments(video_url):
    """Extract comments from a video URL"""
    try:
        post_id = video_url.split('/')[-1]
        headers = {
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
        
        comments = []
        cursor = 0
        
        while True:
            url = f'https://www.tiktok.com/api/comment/list/?WebIdLastTime=1729273214&aid=1988&app_language=en&app_name=tiktok_web&aweme_id={post_id}&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F129.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&count=20&cursor={cursor}&device_platform=web_pc&focus_state=true&from_page=video&history_len=6&is_fullscreen=false&is_page_visible=true&os=windows&priority_region=&referer=&region=CA&screen_height=1080&screen_width=1920&tz_name=Asia%2FTehran&user_is_login=false&webcast_language=en'
            
            response = requests.get(url=url, headers=headers)
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
                time.sleep(1)  # Add delay between requests
            else:
                break
                
        return comments
        
    except Exception as e:
        print(f"Error extracting comments: {e}")
        return []

def extract_video_data(video_element):
    """Extract data from a video element with multiple selector attempts"""
    try:
        data = {}
        
        # Get posted time
        temp_posted_time = ""
        temp_posted_datetime = datetime.min

        try:
            time_selectors = [
                "div.css-dennn6-DivTimeTag",
                "div[class*='TimeTag']"
            ]
            for selector in time_selectors:
                try:
                    time_element = video_element.find_element(By.CSS_SELECTOR, selector)
                    posted_time = time_element.text.strip()
                    if posted_time:
                        temp_posted_datetime = parse_tiktok_time(posted_time)
                        temp_posted_time = posted_time  
                        break
                except:
                    continue
        except Exception as e:
            print(f"Error getting posted time: {e}")
            temp_posted_time = ""
            temp_posted_datetime = datetime.min
        
        now = datetime.now()

        if now - timedelta(hours=24) <= temp_posted_datetime <= now: 
            data['posted_time'] = temp_posted_time
            data['posted_timestamp'] = temp_posted_datetime.timestamp()
            print("Video is posted in the last 24 hours")
        else: 
            print("Video is not posted in the last 24 hours")
            return None
        
        # Get video link - try multiple selectors
        try:
            link_selectors = [
                "a.css-1g95xhm-AVideoContainer",
                "a[href*='/video/']",
                "a[class*='AVideoContainer']"
            ]
            for selector in link_selectors:
                try:
                    link = video_element.find_element(By.CSS_SELECTOR, selector)
                    url = link.get_attribute("href")
                    if url and '/video/' in url:
                        data['video_url'] = url
                        break
                except:
                    continue
        except Exception as e:
            print(f"Error getting video URL: {e}")
            data['video_url'] = ""
            
        # Get thumbnail - try multiple selectors
        try:
            thumbnail_selectors = [
                "img[alt][src*='tiktokcdn']",
                "img[src*='tiktokcdn']",
                "img[class*='poster']"
            ]
            for selector in thumbnail_selectors:
                try:
                    thumbnail = video_element.find_element(By.CSS_SELECTOR, selector)
                    thumb_url = thumbnail.get_attribute("src")
                    if thumb_url:
                        data['thumbnail_url'] = thumb_url
                        break
                except:
                    continue
        except Exception as e:
            print(f"Error getting thumbnail: {e}")
            data['thumbnail_url'] = ""
            
        # Get description - try multiple selectors
        try:
            desc_selectors = [
                "span.css-j2a19r-SpanText",
                "div[data-e2e='search-card-desc'] span",
                "div[class*='desc'] span"
            ]
            for selector in desc_selectors:
                try:
                    desc_elements = video_element.find_elements(By.CSS_SELECTOR, selector)
                    for element in desc_elements:
                        text = element.text.strip()
                        if text and not text.startswith('#'):
                            data['description'] = text
                except:
                    continue
        except Exception as e:
            print(f"Error getting description: {e}")
            data['description'] = ""
            
        # Get hashtags - try multiple selectors
        try:
            hashtag_selectors = [
                "strong.css-1qkxi8e-StrongText",
                "a[href*='/tag/'] strong",
                "strong[color*='rgb']"
            ]
            hashtags = set()
            for selector in hashtag_selectors:
                try:
                    elements = video_element.find_elements(By.CSS_SELECTOR, selector)
                    for element in elements:
                        tag = element.text.strip()
                        if tag.startswith('#'):
                            hashtags.add(tag)
                        else:
                            hashtags.add(f"#{tag}")
                except:
                    continue
            data['hashtags'] = list(hashtags)
        except Exception as e:
            print(f"Error getting hashtags: {e}")
            data['hashtags'] = []
            
        # Get author - try multiple selectors
        try:
            author_selectors = [
                "p.css-2zn17v-PUniqueId",
                "a[data-e2e='search-card-user-link']",
                "div[class*='UserInfo'] p"
            ]
            for selector in author_selectors:
                try:
                    author = video_element.find_element(By.CSS_SELECTOR, selector)
                    author_text = author.text.strip()
                    if author_text:
                        data['author'] = author_text
                        break
                except:
                    continue
        except Exception as e:
            print(f"Error getting author: {e}")
            data['author'] = ""
            
        # Get views - try multiple selectors
        try:
            view_selectors = [
                "strong.css-ws4x78-StrongVideoCount",
                "strong[class*='VideoCount']",
                "div[class*='PlayIcon'] strong"
            ]
            for selector in view_selectors:
                try:
                    views = video_element.find_element(By.CSS_SELECTOR, selector)
                    view_count = views.text.strip()
                    if view_count:
                        data['stats'] = {'views': view_count}
                        break
                except:
                    continue
        except Exception as e:
            print(f"Error getting views: {e}")
            data['stats'] = {'views': ""}
        
        if 'video_url' in data:
            print(f"Extracting comments for video: {data['video_url']}")
            data['comments'] = extract_comments(data['video_url'])
            print(f"Found {len(data['comments'])} comments")
            
        data['extracted_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        return data
        
    except Exception as e:
        print(f"Error extracting video data: {e}")
        return None
    

def save_combined_results(all_results):
    """Save all results to a single JSON file with search terms as keys"""
    try:
        # Create results directory if it doesn't exist
        os.makedirs('results', exist_ok=True)
        
        # Get current date and time for filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'combined_results_{timestamp}.json'
        filepath = os.path.join('results', filename)
        
        # Prepare the results object
        final_results = {
            'extraction_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_searches': len(all_results),
            'results': all_results
        }
        
        # Save the results
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(final_results, f, ensure_ascii=False, indent=2)
        
        print(f"\nAll results saved to: {filepath}")
        return filepath
    except Exception as e:
        print(f"Error saving results: {e}")
        return None

def process_search_term(driver, keyword, max_results=50):
    """Process a single search term and return results"""
    search_url = f"https://www.tiktok.com/search?q={keyword}"
    results = []
    processed_urls = set()
    scroll_pause_time = 2
    
    try:
        print(f"\nProcessing search term: {keyword}")
        print(f"Navigating to: {search_url}")
        driver.get(search_url)
        time.sleep(10)  # Wait for initial load
        
        print("\nWaiting for video feed...")
        
        while len(results) < max_results:
            try:
                video_elements = driver.find_elements(By.CSS_SELECTOR, "div.css-1soki6-DivItemContainerForSearch")
                
                if not video_elements:
                    print("No video elements found. Waiting...")
                    time.sleep(5)
                    continue
                
                for video_element in video_elements:
                    if len(results) >= max_results:
                        break
                        
                    video_data = extract_video_data(video_element)
                    if video_data and video_data['video_url'] and video_data['video_url'] not in processed_urls:
                        results.append(video_data)
                        processed_urls.add(video_data['video_url'])
                        print(f"Found video {len(results)}/{max_results}: {video_data['video_url']}")
                
                if len(results) >= max_results:
                    print(f"\nReached target number of videos for '{keyword}'")
                    break
                
                # Scroll to load more
                last_height = driver.execute_script("return document.documentElement.scrollHeight")
                driver.execute_script(f"window.scrollTo(0, {last_height});")
                time.sleep(scroll_pause_time)
                
                new_height = driver.execute_script("return document.documentElement.scrollHeight")
                if new_height == last_height:
                    print(f"\nReached end of feed for '{keyword}'")
                    break
                    
            except Exception as e:
                print(f"\nError during scraping '{keyword}': {e}")
                break
                
        return results
        
    except Exception as e:
        print(f"\nError processing search term '{keyword}': {str(e)}")
        return results

def main():
    # Define your search terms array
    search_terms = [
        "memecoin",
        # "solana",
        # "crypto",
        # "pumpfun"
    ]
    
    # List and select profile
    print("Available Chrome profiles:")
    profiles = list_chrome_profiles()
    for i, profile in enumerate(profiles):
        print(f"{i+1}. {profile}")
    
    while True:
        try:
            profile_index = int(input("\nEnter the number of the profile where you're logged into TikTok: ")) - 1
            if 0 <= profile_index < len(profiles):
                selected_profile = profiles[profile_index]
                break
            else:
                print("Invalid selection. Please try again.")
        except ValueError:
            print("Please enter a valid number.")
    
    print(f"\nUsing Chrome profile: {selected_profile}")
    
    max_results = int(input("Enter maximum number of videos to extract per search term (default 50): ") or "50")
    
    # Setup Chrome options
    options = uc.ChromeOptions()
    user_data_dir = os.path.expanduser('~\\AppData\\Local\\Google\\Chrome\\User Data')
    options.add_argument(f'--user-data-dir={user_data_dir}')
    options.add_argument(f'--profile-directory={selected_profile}')
    
    try:
        print("\nStarting Chrome...")
        driver = uc.Chrome(options=options)
        print("Chrome started. Waiting for initialization...")
        time.sleep(5)
        
        # Dictionary to store all results
        all_results = {}
        
        # Process each search term
        for search_term in search_terms:
            results = process_search_term(driver, search_term, max_results)
            if results:
                # Store results with search term as key
                all_results[search_term] = {
                    'total_videos': len(results),
                    'videos': results
                }
                print(f"Successfully processed {len(results)} videos for '{search_term}'")
            time.sleep(5)  # Brief pause between searches
        
        # Save all results to a single file
        if all_results:
            saved_path = save_combined_results(all_results)
            if saved_path:
                print("\nSuccessfully saved all results!")
        
        print("\nAll search terms processed!")
        if 'driver' in locals():
            print("Press Enter to close browser...")
            input()
            
    except Exception as e:
        print(f"\nError: {str(e)}")
        # Try to save any results we have if there's an error
        if 'all_results' in locals() and all_results:
            saved_path = save_combined_results(all_results)
            if saved_path:
                print("\nSaved partial results before error!")
    
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    main()