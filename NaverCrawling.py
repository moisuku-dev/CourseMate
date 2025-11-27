from selenium.webdriver.common.by import By
# from openpyxl import Workbook # (1. 엑셀(openpyxl) 싹 다 지움)
import pandas as pd # (2. 판다스(pandas) 추가)
from bs4 import BeautifulSoup
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
import time
import datetime
from selenium.webdriver.chrome.service import Service

# url (네가 올린 NaverCrawling.py와 동일)
url = 'https://m.place.naver.com/restaurant/11871325/home?entry=pll' 

# Webdriver headless mode setting
options = webdriver.ChromeOptions()
# options.add_argument('headless')
options.add_argument('window-size=1920x1080')
options.add_argument("disable-gpu")
options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36")


# (3. 엑셀(openpyxl) 초기화 코드 싹 다 지움)
now = datetime.datetime.now() # (파일 이름 저장용으로 'now'는 남겨둠)

# Start crawling/scraping!
driver = None
try:
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get(url)
    
    driver.implicitly_wait(10) 
    
    # --- (이름/주소 수집 로직 - 100% 동일) ---
    store_name = "수집실패" # (try 밖에서도 쓸 수 있게 미리 정의)
    address = "수집실패"
    try:
        print("--- 1. 페이지 초기 로딩 대기 (10초)... ---")
        time.sleep(10)
        
        store_name = driver.find_element(By.CSS_SELECTOR, 'span.GHAhO').text
        address = driver.find_element(By.CSS_SELECTOR, 'span.LDgIH').text
        print(f"--- 2. 가게 이름 수집: {store_name} ---")
        print(f"--- 2. 주소 수집: {address} ---")

        review_tab = driver.find_element(By.XPATH, '//a[@role="tab"][contains(., "리뷰")]')
        review_tab.click()
        print("--- 3. 리뷰 탭으로 이동 완료. 5초 대기... ---")
        time.sleep(5)
        
    except Exception as e:
        print(f"--- 가게 이름/주소 수집 중 에러: {e} ---")
    # --- (이름/주소 수집 끝) ---


    body = driver.find_element(By.TAG_NAME, 'body')
    
    # --- (50번 '더보기' 루프 - 100% 동일) ---
    print("--- 4. '더보기' 루프 시작 (최대 50회) ---")
    try:
        for i in range(50): 
            print(f"{i+1}번째 '더보기' 시도...")
            body.send_keys(Keys.PAGE_DOWN)
            time.sleep(1.0) # (intercepted 에러 잡는 1초 대기)
            driver.find_element(By.CSS_SELECTOR, 'a.fvwqf[role="button"]').click()
            time.sleep(0.4)
    except Exception as e:
        print(f"'더보기' 버튼 클릭 중단 (이유: {e})")
    else :
        print("최대 50회 '더보기' 클릭 완료")
    
    
    print("스크롤링 완료. 10초간 최종 페이지 로딩 대기...")
    time.sleep(10)
    
    html = driver.page_source # 리뷰 페이지의 HTML을 변수에 저장
    driver.quit() # 드라이버 종료

    # --- (4. 여기가 핵심 수정: '중구난방' 엑셀 대신 '깨끗한' CSV 바로 저장) ---
    
    # (A) '깨끗한' 데이터를 담을 빈 리스트 생성
    review_data_list = []

    # (B) 리뷰 수집 로직 (BeautifulSoup)
    bs = BeautifulSoup(html, 'lxml')
    reviews = bs.select('li.place_apply_pui.EjjAW')

    if not reviews:
        print("--- 경고: 리뷰를 하나도 찾지 못했습니다. (0개 수집) ---")
    print(f"--- 총 {len(reviews)}개의 리뷰를 찾았습니다. ---")

    # (C) 리뷰를 하나씩 돌면서 'dict'로 만들고, '가게이름/주소'를 "복붙"
    for r in reviews:
        nickname = r.select_one('span.pui__NMi-Dp')
        content = r.select_one('div.pui__vn15t2 > a')
        
        nickname = nickname.text.strip() if nickname else 'N/A'
        content = content.text.strip() if content else 'N/A'

        # '1 대 N' 문제를 해결하는 'dict' 생성
        review_dict = {
            'store_name': store_name, # 크롤링 초반에 가져온 'store_name' 변수
            'address': address,     # 크롤링 초반에 가져온 'address' 변수
            'nickname': nickname,
            'content': content
        }
        
        # (D) 'dict'를 리스트에 추가
        review_data_list.append(review_dict)
    
    # (E) '리스트'를 'pandas DataFrame'으로 한 방에 변환
    df = pd.DataFrame(review_data_list)
    
    # (F) '깨끗한' CSV 파일로 바로 저장
    file_name = f'clean_review_{store_name}'+'.csv'
    # (encoding='utf-8-sig'로 해야 엑셀에서 한글 안 깨짐)
    df.to_csv(file_name, index=False, encoding='utf-8-sig')
    
    print(f"--- {file_name} ('깨끗한' CSV) 파일 저장 완료 ---")
    # --- (핵심 수정 끝) ---

except Exception as e:
    print(f"--- 전체 프로세스 중 에러 발생: {e} ---")
    if driver:
        driver.quit() 
        
    print(f"--- 에러 발생. 파일 저장 안 함 ---")