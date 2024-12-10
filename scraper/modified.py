import time
import ssl
import undetected_chromedriver as uc
from utils.chrome import list_chrome_profiles
from selenium.common.exceptions import WebDriverException, TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

def setup_driver(selected_profile, chrome_user_data_dir):
    """Setup and return a Chrome driver with proper configuration"""
    options = uc.ChromeOptions()
    options.add_argument(f'--user-data-dir={chrome_user_data_dir}')
    options.add_argument(f'--profile-directory={selected_profile}')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-extensions')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--start-maximized')
    
    # Add these options to help avoid detection
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    try:
        driver = uc.Chrome(
            options=options,
            driver_executable_path=None,
            version_main=None,
            use_subprocess=True
        )
        # Execute CDP commands to avoid detection
        driver.execute_cdp_cmd('Network.setUserAgentOverride', {
            "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    except WebDriverException as e:
        print(f"Failed to create driver: {e}")
        return None

def verify_page_loaded(driver, timeout=30):
    """Verify that the page has loaded properly with explicit waits"""
    try:
        print("Testing browser with google.com...")
        driver.get("https://www.google.com")
        
        # Wait for Google search box to be present
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.NAME, "q"))
        )
        print("Google.com loaded successfully")
        
        print("Attempting to load TikTok...")
        driver.get("https://www.tiktok.com")
        
        # Wait for TikTok's main content to load
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Additional wait for dynamic content
        time.sleep(5)
        
        current_url = driver.current_url
        print(f"Current URL: {current_url}")
        
        if "tiktok.com" not in current_url:
            print("Failed to reach TikTok - redirected elsewhere")
            return False
            
        return True
        
    except TimeoutException:
        print("Timeout waiting for page to load")
        return False
    except Exception as e:
        print(f"Error during page load verification: {e}")
        return False

def main():
    # Configure SSL context
    ssl._create_default_https_context = ssl._create_unverified_context
    
    chrome_user_data_dir = '/Users/gabrielantonyxaviour/Library/Application Support/Google/Chrome'
    print("Available Chrome profiles:")
    profiles = list_chrome_profiles()
    for i, profile in enumerate(profiles):
        print(f"{i+1}. {profile}")

    print("Using Chrome Profile index 2") 
    selected_profile = profiles[2]
    
    print(f"\nUsing Chrome profile: {selected_profile}")

    max_retries = 3
    for attempt in range(max_retries):
        print(f"\nAttempt {attempt + 1} to start Chrome...")
        driver = setup_driver(selected_profile, chrome_user_data_dir)
        
        if driver:
            try:
                print("Chrome started. Waiting for initialization...")
                time.sleep(5)

                if verify_page_loaded(driver):
                    print("Pages loaded successfully!")
                    # Continue with your scraping logic here
                    time.sleep(10)  # Add appropriate wait times
                    return
                else:
                    print("Failed to load pages properly, retrying...")
                    
            except Exception as e:
                print(f"\nError during execution: {str(e)}")
            
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