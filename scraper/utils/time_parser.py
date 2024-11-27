from datetime import datetime, timedelta

def parse_tiktok_time(relative_time):
    """Convert TikTok relative time to datetime object"""
    now = datetime.now()
    if "d" in relative_time:
        days = int(relative_time.split("d")[0])
        return now - timedelta(days=days)
    elif "h" in relative_time:
        hours = int(relative_time.split("h")[0])
        return now - timedelta(hours=hours)
    elif "m" in relative_time:
        minutes = int(relative_time.split("m")[0])
        return now - timedelta(minutes=minutes)
    elif "s" in relative_time:
        seconds = int(relative_time.split("s")[0])
        return now - timedelta(seconds=seconds)
    elif "w" in relative_time:
        weeks = int(relative_time.split("w")[0])
        return now - timedelta(weeks=weeks)
    else:
        return datetime.min