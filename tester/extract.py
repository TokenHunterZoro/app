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
    """Extract data from a video element"""
    try:
        data = {}
        
        # Get video link
        try:
            link = video_element.find_element(By.TAG_NAME, "a")
            data['video_url'] = link.get_attribute("href")
        except:
            data['video_url'] = ""
            
        # Get description
        try:
            desc = video_element.find_element(By.CSS_SELECTOR, "div[class*='video-desc']")
            data['description'] = desc.text
        except:
            data['description'] = ""
            
        # Get author
        try:
            author = video_element.find_element(By.CSS_SELECTOR, "a[class*='author-nickname']")
            data['author'] = author.text
        except:
            data['author'] = ""
            
        # Get engagement stats
        data['stats'] = {}
        try:
            stats = video_element.find_elements(By.CSS_SELECTOR, "strong[class*='video-count']")
            if len(stats) >= 2:
                data['stats']['likes'] = stats[0].text
                data['stats']['comments'] = stats[1].text
        except:
            pass
        
        data['scraped_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        return data
    except Exception as e:
        print(f"Error extracting video data: {e}")
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
    max_results = int(input("Enter maximum number of videos to scrape (default 50): ") or "50")
    search_url = f"https://www.tiktok.com/search?q={keyword}"
    
    # Start browser and navigate
    try:
        print("\nStarting Chrome...")
        driver = uc.Chrome(options=options)
        
        print("Chrome started. Waiting for initialization...")
        time.sleep(5)
        
        print(f"Navigating to: {search_url}")
        driver.get(search_url)
        time.sleep(10)  # Increased wait time for page load
        
        print("\nWaiting for video feed...")
        
        # Initialize results list
        results = []
        processed_urls = set()
        scroll_pause_time = 2
        
        print("\nStarting video collection...")
        while len(results) < max_results:
            try:
                # Find all video elements with a more general selector
                video_elements = driver.find_elements(By.CSS_SELECTOR, "div[data-e2e*='video']")
                
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
                    break
                
                # Scroll to load more
                last_height = driver.execute_script("return document.documentElement.scrollHeight")
                driver.execute_script(f"window.scrollTo(0, {last_height});")
                time.sleep(scroll_pause_time)
                
                # Check if we've reached the bottom
                new_height = driver.execute_script("return document.documentElement.scrollHeight")
                if new_height == last_height:
                    print("Reached end of feed.")
                    break
                    
            except Exception as e:
                print(f"Error during scraping: {e}")
                time.sleep(2)
        
        # Save results
        if results:
            filename = f"tiktok_search_{keyword}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"\nFound {len(results)} videos")
            print(f"Results saved to {filename}")
        else:
            print("\nNo videos found")
        
        print("\nPress Enter to close browser...")
        input()
        
    except Exception as e:
        print(f"Error: {str(e)}")
    
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    main()