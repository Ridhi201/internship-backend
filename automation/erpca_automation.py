import os
import time
import shutil
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configuration
# Note: Chrome User Data path and Profile are specific to local Windows.
# On Render, these will need to be adjusted or removed if using a portable setup.
CHROME_USER_DATA = os.getenv("CHROME_USER_DATA", r"C:\Users\Gaurav\AppData\Local\Google\Chrome\User Data")
CHROME_PROFILE = os.getenv("CHROME_PROFILE", "Default")

DOWNLOAD_DIR = os.path.join(os.path.expanduser("~"), "Downloads")

# Portability: Use a relative path for the target directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_DIR = os.path.join(BASE_DIR, "data")

ERPCA_URL = "https://bhilwara.erpca.in/member/index.php?module=reports&page=daysheet-summary"

def setup_driver():
    chrome_options = Options()
    
    # Only use user-data-dir if it exists or is provided
    if os.path.exists(CHROME_USER_DATA):
        chrome_options.add_argument(f"--user-data-dir={CHROME_USER_DATA}")
        chrome_options.add_argument(f"--profile-directory={CHROME_PROFILE}")
    
    # Render/Linux specific headless options often needed for Selenium
    if os.name != 'nt': # If not Windows (likely Render/Linux)
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Preventing "Chrome is being controlled by automated test software" notification
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def download_report():
    driver = setup_driver()
    try:
        print(f"Opening ERPCA: {ERPCA_URL}")
        driver.get(ERPCA_URL)
        
        # Wait for the export button to be clickable
        print("Waiting for export button...")
        wait = WebDriverWait(driver, 20)
        
        try:
            export_button = wait.until(EC.element_to_be_clickable((By.ID, "exportCSV")))
        except Exception as e:
            print(f"ID 'exportCSV' not found, trying link text 'Export CSV'... Error: {e}")
            export_button = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Export CSV")))
            
        export_button.click()
        print("Export button clicked. Waiting for download...")
        
        # Wait for download to finish (heuristic)
        time.sleep(15)
        
        # Find the most recently downloaded report
        if not os.path.exists(DOWNLOAD_DIR):
            print(f"Download directory {DOWNLOAD_DIR} does not exist.")
            return

        files = [
            os.path.join(DOWNLOAD_DIR, f) 
            for f in os.listdir(DOWNLOAD_DIR) 
            if (f.endswith('.csv') or f.endswith('.xls') or f.endswith('.xlsx')) and "Daysheet" in f
        ]
        if not files:
            print(f"No ERPCA report files found in {DOWNLOAD_DIR}.")
            return
            
        latest_file = max(files, key=os.path.getctime)
        print(f"Latest download: {latest_file}")
        
        # Move to target directory (clean existing file first)
        if not os.path.exists(TARGET_DIR):
            os.makedirs(TARGET_DIR)
            print(f"Created target directory: {TARGET_DIR}")
        
        ext = os.path.splitext(latest_file)[1]
        target_path = os.path.join(TARGET_DIR, f"daysheet_report{ext}")
        
        # Remove any old reports to avoid confusion
        for old_file in os.listdir(TARGET_DIR):
            if "daysheet_report" in old_file:
                # Use a safer removal
                try:
                    os.remove(os.path.join(TARGET_DIR, old_file))
                except Exception as e:
                    print(f"Could not remove old file {old_file}: {e}")

        shutil.move(latest_file, target_path)
        print(f"Moved report to: {target_path}")
        
    except Exception as e:
        print(f"An error occurred during automation: {e}")
        raise e
    finally:
        driver.quit()

if __name__ == "__main__":
    download_report()
