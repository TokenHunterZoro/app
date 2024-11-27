import undetected_chromedriver as uc
import os
import time
import json
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

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

def extract_video_data(video_element):
    """Extract data from a video element with multiple selector attempts"""
    try:
        data = {}

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
        
        # Get posted time
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
                        data['posted_time'] = posted_time
                        break
                except:
                    continue
        except Exception as e:
            print(f"Error getting posted time: {e}")
            data['posted_time'] = ""
        
        data['extracted_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        return data
        
    except Exception as e:
        print(f"Error extracting video data: {e}")
        return None

def save_results(results, keyword):
    """Save results to a JSON file with automatic versioning"""
    try:
        version = 1
        filename = f"{keyword}_v{version}.json"
        
        # Check if file exists and increment version if needed
        while os.path.exists(filename):
            version += 1
            filename = f"{keyword}_v{version}.json"
        
        # Create results directory if it doesn't exist
        os.makedirs('results', exist_ok=True)
        filepath = os.path.join('results', filename)
        
        # Save the results
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                'keyword': keyword,
                'total_videos': len(results),
                'extraction_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'videos': results
            }, f, ensure_ascii=False, indent=2)
        
        print(f"\nResults saved to: {filepath}")
        return filepath
    except Exception as e:
        print(f"Error saving results: {e}")
        return None


def main():
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
    
    # Setup Chrome options
    options = uc.ChromeOptions()
    user_data_dir = os.path.expanduser('~\\AppData\\Local\\Google\\Chrome\\User Data')
    options.add_argument(f'--user-data-dir={user_data_dir}')
    options.add_argument(f'--profile-directory={selected_profile}')
    
    # Get search keyword and max results
    keyword = input("Enter search keyword: ")
    max_results = int(input("Enter maximum number of videos to extract (default 50): ") or "50")
    search_url = f"https://www.tiktok.com/search?q={keyword}"
    
    # Start browser and navigate
    try:
        print("\nStarting Chrome...")
        driver = uc.Chrome(options=options)
        
        print("Chrome started. Waiting for initialization...")
        time.sleep(5)
        
        print(f"Navigating to: {search_url}")
        driver.get(search_url)
        time.sleep(10)  # Wait for initial load
        
        print("\nWaiting for video feed...")
        
        # Initialize results list
        results = []
        processed_urls = set()
        scroll_pause_time = 2
        
        print("\nStarting video collection...")
        while len(results) < max_results:
            try:
                # Find all video elements with the correct container class
                video_elements = driver.find_elements(By.CSS_SELECTOR, "div.css-1soki6-DivItemContainerForSearch")
                
                if not video_elements:
                    print("No video elements found. Waiting...")
                    time.sleep(5)
                    continue
                
                # Process new videos
                for video_element in video_elements:
                    if len(results) >= max_results:
                        break
                        
                    video_data = extract_video_data(video_element)
                    if video_data and video_data['video_url'] and video_data['video_url'] not in processed_urls:
                        results.append(video_data)
                        processed_urls.add(video_data['video_url'])
                        print(f"Found video {len(results)}/{max_results}: {video_data['video_url']}")
                
                # Break if we have enough videos
                if len(results) >= max_results:
                    print("\nReached target number of videos.")
                    saved_path = save_results(results, keyword)
                    if saved_path:
                        print(f"Successfully saved {len(results)} videos to: {saved_path}")
                    break
                
                # Scroll to load more
                last_height = driver.execute_script("return document.documentElement.scrollHeight")
                driver.execute_script(f"window.scrollTo(0, {last_height});")
                time.sleep(scroll_pause_time)
                
                # Check if we've reached the bottom
                new_height = driver.execute_script("return document.documentElement.scrollHeight")
                if new_height == last_height:
                    print("\nReached end of feed.")
                    saved_path = save_results(results, keyword)
                    if saved_path:
                        print(f"Successfully saved {len(results)} videos to: {saved_path}")
                    break
                    
            except Exception as e:
                print(f"\nError during scraping: {e}")
                if results:
                    saved_path = save_results(results, keyword)
                    if saved_path:
                        print(f"Successfully saved {len(results)} videos to: {saved_path}")
                time.sleep(2)
        
        print("\nScraping completed!")
        if 'driver' in locals():
            print("Press Enter to close browser...")
            input()
            
    except Exception as e:
        print(f"\nError: {str(e)}")
        if results:
            saved_path = save_results(results, keyword)
            if saved_path:
                print(f"Successfully saved {len(results)} videos to: {saved_path}")
    
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    main()