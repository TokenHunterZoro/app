# Place these at the very top of the file, before any other imports
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import os
import sys
import time
import logging
import urllib3
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from scrapers.video_scraper import VideoScraper
from storage.result_handler import save_combined_results
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from scrapers.comment_scraper import extract_comments
from pathlib import Path
from supabase import create_client, Client
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

processed_urls = set()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def get_chrome_path():
    """Get Chrome user data directory path"""
    home = str(Path.home())
    return os.path.join(home, "Library", "Application Support", "Google", "Chrome")

def setup_driver(with_profile=False, profile_name=None):
    """Setup Chrome driver with SSL verification disabled"""
    try:
        options = uc.ChromeOptions()
        
        # SSL and security options
        options.add_argument('--ignore-certificate-errors')
        options.add_argument('--ignore-ssl-errors')
        
        # Basic options
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-extensions')
        
        if with_profile and profile_name:
            chrome_path = get_chrome_path()
            logger.info(f"Loading Chrome profile from: {chrome_path}")
            options.add_argument(f'--user-data-dir={chrome_path}')
            options.add_argument(f'--profile-directory={profile_name}')
        
        # Additional options to bypass security checks
        options.add_argument('--allow-insecure-localhost')
        options.add_argument('--ignore-urlfetcher-cert-requests')
        
        # Create driver with specific configuration
        driver = uc.Chrome(
            options=options,
            driver_executable_path=None,
            version_main=None,
            use_subprocess=True,
            headless=False,
            suppress_welcome=True
        )
        
        return driver
    except Exception as e:
        logger.error(f"Failed to create driver: {e}")
        return None

def verify_page_loaded(driver, url, timeout=30):
    """Verify that a page has loaded properly"""
    try:
        logger.info(f"Loading {url}...")
        driver.get(url)
        
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        time.sleep(5)
        logger.info(f"Successfully loaded {url}")
        return True
    except Exception as e:
        logger.error(f"Error loading page: {e}")
        return False


def process_search_term(driver, keyword, max_results=50):
    """Process a single search term and return results"""
    search_url = f"https://www.tiktok.com/search?q={keyword}"
    results = []
    scroll_pause_time = 2
    
    try:
        print(f"\nProcessing search term: {keyword}")
        print(f"Navigating to: {search_url}")
        # driver.get(search_url)
        # time.sleep(10)

        if verify_page_loaded(driver, search_url):
            print("\nWaiting for video feed...")
            
            while len(results) < max_results:
                try:
                    video_elements = driver.find_elements(By.CSS_SELECTOR, "div[class*='DivItemContainerV2']")
                    if not video_elements:
                        print("No video elements found. Waiting...")
                        time.sleep(5)
                        continue
                    
                    print(len(video_elements))
                    for video_element in video_elements:
                        if len(results) >= max_results:
                            break
                            
                        video_data = VideoScraper.extract_video_data(video_element)
                        if video_data and video_data['video_url'] and video_data['video_url'] not in processed_urls:
                            print(f"Found video {len(results)}/{max_results}: {video_data['video_url']}")
                            if 'video_url' in video_data:
                                print(f"Extracting comments for video: {video_data['video_url']}")
                                post_id = video_data['video_url'].split('/')[-1]
                                video_data['comments'] = extract_comments(post_id)
                                # print(video_data['comments'])
                                # print(video_data['comments']['data'])
                                print(f"Found {video_data['comments']['count']} comments")
                            processed_urls.add(video_data['video_url'])
                            results.append(video_data)
                        else:
                            if video_data and  video_data['video_url'] and video_data['video_url'] in processed_urls:
                                print(f"Duplicate video. Skipping...")
                    if len(results) >= max_results:
                        print(f"\nReached target number of videos for '{keyword}'")
                        break
                    
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
        else:
            print(f"\nFailed to load search term: {keyword}")

        return results
        
    except Exception as e:
        print(f"\nError processing search term '{keyword}': {str(e)}")
        return results


def process_hashtag_term(driver, keyword, max_results=50):
    """Process a single hashtag term and return results"""
    hashtag_url = f"https://www.tiktok.com/tag/{keyword}"
    results = []
    scroll_pause_time = 2
    
    try:
        print(f"\nProcessing hashtag term: {keyword}")
        print(f"Navigating to: {hashtag_url}")

        if verify_page_loaded(driver, hashtag_url):
            print("\nWaiting for video feed...")
            
            while len(results) < max_results:
                try:
                    video_elements = driver.find_elements(By.CSS_SELECTOR, "div[class*='DivItemContainerV2']")
                    if not video_elements:
                        print("No video elements found. Waiting...")
                        time.sleep(5)
                        continue
                    
                    print("WORKING TILL NOW")
                    print(len(video_elements))
                    for video_element in video_elements:
                        if len(results) >= max_results:
                            break
                            
                        video_data = VideoScraper.extract_video_data(video_element)
                        print("VIDEO DATA")
                        print(video_data)
                        if video_data and video_data['video_url'] and video_data['video_url'] not in processed_urls:
                            print(f"Found video {len(results)}/{max_results}: {video_data['video_url']}")
                            if 'video_url' in video_data:
                                print(f"Extracting comments for video: {video_data['video_url']}")
                                post_id = video_data['video_url'].split('/')[-1]
                                video_data['comments'] = extract_comments(post_id)
                                # print(video_data['comments'])
                                # print(video_data['comments']['data'])
                                print(f"Found {video_data['comments']['count']} comments")
                            processed_urls.add(video_data['video_url'])
                            results.append(video_data)
                        else:
                            if video_data and  video_data['video_url'] and video_data['video_url'] in processed_urls:
                                print(f"Duplicate video. Skipping...")
                    if len(results) >= max_results:
                        print(f"\nReached target number of videos for '{keyword}'")
                        break

                    print("Executing scroll script")
                    last_height = driver.execute_script("return document.documentElement.scrollHeight")
                    driver.execute_script(f"window.scrollTo(0, {last_height});")
                    time.sleep(scroll_pause_time)
                    print("Successfully scrolled")
                    
                    new_height = driver.execute_script("return document.documentElement.scrollHeight")
                    if new_height == last_height:
                        print(f"\nReached end of feed for '{keyword}'")
                        break
                        
                except Exception as e:
                    print(f"\nError during scraping '{keyword}': {e}")
                    break
        else:
            print(f"\nFailed to load hashtag term: {keyword}")

        return results
        
    except Exception as e:
        print(f"\nError processing hashtag term '{keyword}': {str(e)}")
        return results



def main():

    search_terms = [
        "memecoin",
        "solana",
        "crypto",
        "pumpfun", 
    ]

    hashtag_terms =[  
        "memecoin",
        "solana",
        "crypto",
        "pumpfun"
    ]
    selected_profile = "Profile 3"
    logger.info(f"Using Chrome profile: {selected_profile}")
    
    # Kill any existing Chrome processes
    os.system("pkill -9 'Google Chrome'")
    time.sleep(2)
    
    try:
        logger.info("Starting Chrome with profile...")
        driver = setup_driver(with_profile=True, profile_name=selected_profile)
        
        if not driver:
            logger.error("Failed to create Chrome driver")
            return
            
        logger.info("Chrome started successfully")
        
        all_results = []
        
        for search in search_terms:
            results = process_search_term(driver, search, 100)
            if results:
                all_results.append({
                    "search": search,
                    'total_videos': len(results),
                    'videos': results
                })
                print(f"Successfully processed {len(results)} videos for '{search}'")
            time.sleep(5)

        print("\nAll search terms processed!")
        
        for hashtag in hashtag_terms:
            results = process_hashtag_term(driver, hashtag, 100)
            if(results):
                all_results.append({
                    "search": "#"+search,
                    'total_videos': len(results),
                    'videos': results
                })
                print(f"Successfully processed {len(results)} videos for '#{hashtag}'")
            time.sleep(5)

        # print("Storing results to supabase")

        if all_results:
            saved_path = save_combined_results(all_results)
            if saved_path:
                print("\nSuccessfully saved all results!")
        
        print("\nAll hashtag terms processed!")
        if 'driver' in locals():
            print("Press Enter to close browser...")
            input()
            
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        
    finally:
        try:
            if 'driver' in locals() and driver:
                driver.quit()
        except:
            pass

if __name__ == "__main__":
    main()