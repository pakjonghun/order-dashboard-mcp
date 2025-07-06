🟣 Electron-SQL Desktop App Scaffold Prompt — Step 5 (실제 주문 데이터 구조로 변경)

당신은 Electron 기반 SQLite 분석 앱의 데이터 구조를 실사용 환경에 맞춰 개편하는 전문 scaffold 생성기입니다.  
아래 명세에 따라 `main`, `renderer`, `shared`의 모든 데이터 및 타입, 상수 파일을 **실제 주문 테이블 구조**로 전환하세요.  
shared 에 전환된 데이터 column 을 upload 시 column 매핑 에 사용하세요.

────────────────────────────────────────────
🎯 변경 목표

기존: id, name, age  
변경: 아래 필드들로 구성된 주문/매출 데이터 구조

🧾 실제 데이터 구조 필드:

- address: string ← 주소
- barcode: string ← 바코드
- invoiceNumber: string ← 송장번호
- message: string ← 메시지
- orderStatus: string ← 주문상태
- postalCode: string ← 우편번호
- customerName: string ← 수취인 이름
- client: string ← 거래처
- orderNumber: string ← 주문번호
- totalAmount: number ← 매출
- settlementAmount: number ← 정산액
- quantity: number ← 수량
- cost: number ← 원가
- productCode: string ← 제품코드
- productName: string ← 제품이름
- orderDate: string ← 주문날짜 (ISO 형식)
- shoppingMallId: string ← 쇼핑몰/옵션ID
- phoneNumber: string ← 연락처

────────────────────────────────────────────
📁 적용 대상 및 작업 항목

1. shared/constants.ts

- 사용되는 컬럼 이름 목록을 위 데이터로 전면 교체
- 예: export const DB_COLUMNS = ['address', 'barcode', ..., 'phoneNumber']

2. shared/types.ts

- 기존 User 또는 Row 타입 제거
- 위 필드를 포함한 `OrderRow` 인터페이스 생성

3. main/src/handlers/queryHandler.ts

- mock 데이터를 위 필드 기반으로 구성
- 최소 2~3개의 OrderRow mock 데이터 포함

4. renderer/src/stores/queryStore.ts

- result 타입을 `OrderRow[]`로 명시
- runQuery 내부 mock 호출 시 위 구조를 기준으로 상태 업데이트

5. renderer/src/components/ResultTable.tsx

- columns 추론 시 result[0]의 key 기준으로 동적 생성되므로, 필드 자동 렌더링됨
- 별도 변경 없이 OrderRow 구조만 적용되면 정상 동작

────────────────────────────────────────────
✅ 완료 조건

- 전 mock 데이터 구조가 위 실데이터 형식으로 완전히 변경됨
- main의 queryHandler.ts에서는 OrderRow[] 형태로 mock 데이터 반환
- renderer는 해당 데이터를 받아 테이블로 렌더링함
- shared/constants.ts와 shared/types.ts는 실데이터 기준으로 정확히 변경됨
- 추후 실제 DB 쿼리 및 엑셀 업로드 기능과의 호환성이 확보됨
