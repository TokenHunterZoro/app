from datetime import datetime, timedelta
from selenium.webdriver.common.by import By
from utils.time_parser import parse_tiktok_time
from scrapers.comment_scraper import extract_comments

class VideoScraper:
    @staticmethod
    def extract_video_data(video_element):
        """Extract data from a TikTok video element"""
        try:
            data = {}
            
            # Extract posted time
            time_data = VideoScraper._extract_posted_time(video_element)
            if not time_data:
                print('Time info not present. Skipping...')
                return None

            current_timestamp = datetime.now().timestamp()
            print("Current timestamp")
            print(current_timestamp)
            video_timestamp = time_data["posted_timestamp"]
            print('Video timestamp')
            print(video_timestamp)

            time_diff = current_timestamp - video_timestamp
            print(f"Time difference: {time_diff}")
            
            print(time_diff)
            if time_diff > 24 * 3600:  # 24 hours in seconds
                print('Video older than 24 hours. Skipping...')
                return None

            data.update(time_data)
            
            # Extract other video data
            data.update(VideoScraper._extract_video_url(video_element))
            data.update(VideoScraper._extract_thumbnail(video_element))
            # data.update(VideoScraper._extract_description(video_element))
            data.update(VideoScraper._extract_hashtags(video_element))
            data.update(VideoScraper._extract_author(video_element))
            data.update(VideoScraper._extract_views(video_element))
            
            data['extracted_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            return data
            
        except Exception as e:
            print(f"Error extracting video data: {e}")
            return None

    @staticmethod
    def _extract_posted_time(video_element):
        """Extract and validate posted time"""
        try:
            time_selectors = [
                "div[class*='DivTimeTag']"
            ]
            
            posted_time = ""
            posted_datetime = datetime.min

            
            for selector in time_selectors:
                try:
                    time_element = video_element.find_element(By.CSS_SELECTOR, selector)
                    posted_time = time_element.text.strip()
                    if posted_time:
                        posted_datetime = parse_tiktok_time(posted_time)
                        break
                except:
                    continue
            
            print("REACEIVED DATA")
            print(posted_time)
            print(posted_datetime)

            if not posted_time:
                posted_time = "1s"
            if posted_datetime == datetime.min:
                posted_datetime = datetime.now() - timedelta(seconds=1)          

            return {
                'posted_time': posted_time,
                'posted_timestamp': posted_datetime.timestamp()
            }
            return None
            
        except Exception as e:
            print(f"Error getting posted time: {e}")
            return None

    @staticmethod
    def _extract_video_url(video_element):
        """Extract video URL"""
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
                        return {'video_url': url}
                except:
                    continue
        except Exception as e:
            print(f"Error getting video URL: {e}")
        return {'video_url': ""}
   
    @staticmethod
    def _extract_thumbnail(video_element):
        """Extract thumbnail URL"""
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
                        return {'thumbnail_url': thumb_url}
                except:
                    continue
        except Exception as e:
            print(f"Error getting thumbnail: {e}")
        return {'thumbnail_url': ""}

    @staticmethod
    def _extract_description(video_element):
        """Extract video description"""
        try:
            desc_selectors = [
                "h1[class*='H1Container']",
            ]
            for selector in desc_selectors:
                try:
                    desc_elements = video_element.find_elements(By.CSS_SELECTOR, selector)
                    words=[]
                    for element in desc_elements:
                        text = element.text.strip()
                        if text and not text.startswith('#'):
                            words.push(text)
                    return {'description': f'{" ".join(words)}'}
                except:
                    continue
        except Exception as e:
            print(f"Error getting description: {e}")
        return {'description': ""}
    
    @staticmethod
    def _extract_hashtags(video_element):
        """Extract video hashtags"""
        try:
            hashtags_selectors = [
                "a.css-4rbku5-A",
                "a[href*='/tag/']"
            ]
            hashtags = []
            for selector in hashtags_selectors:
                try:
                    hashtag_elements = video_element.find_elements(By.CSS_SELECTOR, selector)
                    for element in hashtag_elements:
                        hashtag = element.text.strip()
                        if hashtag and hashtag.startswith('#'):
                            hashtags.append(hashtag)
                except:
                    continue
            return {'hashtags': hashtags}
        except Exception as e:
            print(f"Error getting hashtags: {e}")
        return {'hashtags': []}
    
    @staticmethod
    def _extract_author(video_element):
        """Extract video author"""
        try:
            author_selectors = [
                "p[class*='PUniqueId']",
                "p[class*='PUserName']",
            ]
            for selector in author_selectors:
                try:
                    author_element = video_element.find_element(By.CSS_SELECTOR, selector)
                    author = author_element.text.strip()
                    if author:
                        return {'author': author}
                except:
                    continue
        except Exception as e:
            print(f"Error getting author: {e}")
        return {'author': ""}
    
    @staticmethod
    def _extract_views(video_element):
        """Extract video views"""
        try:
            views_selectors = [
                "strong[class*='StrongVideoCount']",

            ]
            for selector in views_selectors:
                try:
                    views_element = video_element.find_element(By.CSS_SELECTOR, selector)
                    views = views_element.text.strip()
                    if views:
                        return {'views': views}
                except:
                    continue
        except Exception as e:
            print(f"Error getting views: {e}")
        return {'views': ""}
    