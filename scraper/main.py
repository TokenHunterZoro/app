import time
import ssl
import undetected_chromedriver as uc
from selenium.common.exceptions import WebDriverException, TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.chrome import list_chrome_profiles
from scrapers.video_scraper import VideoScraper
from storage.result_handler import save_combined_results
from selenium.webdriver.common.by import By
from config import CHROME_USER_DATA_DIR
from scrapers.comment_scraper import extract_comments

def setup_driver(selected_profile):
    """Setup and return a Chrome driver with proper configuration"""
    options = uc.ChromeOptions()
    options.add_argument(f'--user-data-dir={CHROME_USER_DATA_DIR}')
    options.add_argument(f'--profile-directory={selected_profile}')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-extensions')
    options.add_argument('--window-size=1920,1080')  # Set a standard window size
    options.add_argument('--start-maximized')
    
    try:
        driver = uc.Chrome(
            options=options,
            driver_executable_path=None,
            version_main=None,
            use_subprocess=True
        )
        return driver
    except WebDriverException as e:
        print(f"Failed to create driver: {e}")
        return None

def verify_page_loaded(driver, timeout=30):
    """Verify that the page has loaded properly"""
    try:
        # First try loading a simple test page to verify browser works
        print("Testing browser with google.com...")
        driver.get("https://www.google.com")
        time.sleep(5)
        
        # Now try TikTok
        print("Attempting to load TikTok...")
        driver.get("https://www.tiktok.com")
        time.sleep(10)
        
        # Check if we're on TikTok
        current_url = driver.current_url
        print(f"Current URL: {current_url}")
        
        if "tiktok.com" not in current_url:
            print("Failed to reach TikTok - redirected elsewhere")
            return False
            
        return True
        
    except Exception as e:
        print(f"Error during page load verification: {e}")
        return False

def process_search_term(driver, keyword, max_results=50):
    """Process a single search term and return results"""
    search_url = f"https://www.tiktok.com/search?q={keyword}"
    results = []
    scroll_pause_time = 2
    
    try:
        print(f"\nProcessing search term: {keyword}")
        print(f"Navigating to: {search_url}")
        driver.get(search_url)
        time.sleep(10)

        print("\nWaiting for video feed...")

        while len(results) < max_results:
            try:
                video_elements = driver.find_elements(By.CSS_SELECTOR, "div.css-x6y88p-DivItemContainerV2")       

                if not video_elements:
                    print("No video elements found. Waiting...")
                    time.sleep(5)
                    continue

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
                            print(f"Found {len(video_data['comments']['data'])} comments")
                        processed_urls.add(video_data['video_url'])
                        results.append(video_data)
                    else:
                        if video_data and video_data['video_url'] and video_data['video_url'] in processed_urls:
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

        return results
    
    except Exception as e:
        print(f"\nError processing search term '{keyword}': {str(e)}")
        return results


def main():
    # Configure SSL context
    ssl._create_default_https_context = ssl._create_unverified_context
    
    search_terms = ["pumpfun"]
    
    print("Available Chrome profiles:")
    profiles = list_chrome_profiles()
    for i, profile in enumerate(profiles):
        print(f"{i+1}. {profile}")

    print("Using Chrome Profile index 1") 
    selected_profile = profiles[1]
    
    print(f"\nUsing Chrome profile: {selected_profile}")
    print("Using max results 10 for now")
    max_results = 10

    max_retries = 3
    for attempt in range(max_retries):
        print(f"\nAttempt {attempt + 1} to start Chrome...")
        driver = setup_driver(selected_profile)
        
        if driver:
            try:
                print("Chrome started. Waiting for initialization...")
                time.sleep(5)

                if not verify_page_loaded(driver):
                    print("Failed to load TikTok properly, retrying...")
                    continue
                
                all_results = {}
                
                for search_term in search_terms:
                    results = process_search_term(driver, search_term, max_results)
                    if results:
                        all_results[search_term] = {
                            'total_videos': len(results),
                            'videos': results
                        }
                        print(f"Successfully processed {len(results)} videos for '{search_term}'")
                    time.sleep(5)
                
                if all_results:
                    saved_path = save_combined_results(all_results)
                    if saved_path:
                        print("\nSuccessfully saved all results!")
                
                print("\nAll search terms processed!")
                print("Press Enter to close browser...")
                input()
                return  # Success - exit the function
                
            except Exception as e:
                print(f"\nError during scraping: {str(e)}")
                if 'all_results' in locals() and all_results:
                    saved_path = save_combined_results(all_results)
                    if saved_path:
                        print("\nSaved partial results before error!")
            
            finally:
                try:
                    driver.quit()
                except:
                    pass
        
        print(f"Attempt {attempt + 1} failed, waiting before retry...")
        time.sleep(5)
    
    print("Failed to complete scraping after multiple attempts")

if __name__ == "__main__":
    main()