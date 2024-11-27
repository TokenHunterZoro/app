import os
import json
from datetime import datetime
from config import RESULTS_DIR

def save_combined_results(all_results):
    """Save all results to a single JSON file"""
    try:
        os.makedirs(RESULTS_DIR, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'combined_results_{timestamp}.json'
        filepath = os.path.join(RESULTS_DIR, filename)
        
        final_results = {
            'extraction_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_searches': len(all_results),
            'results': all_results
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(final_results, f, ensure_ascii=False, indent=2)
        
        print(f"\nAll results saved to: {filepath}")
        return filepath
    except Exception as e:
        print(f"Error saving results: {e}")
        return None