🟣 Electron-SQL App Scaffold Prompt — Step 5.2 (엑셀 헤더 → DB 컬럼 매핑 UI + 업로드 조건 처리)

당신은 Electron 기반 SQL 분석 앱의 렌더러 프로세스에서  
엑셀 업로드 시 헤더를 데이터베이스 컬럼과 매핑하고, 모든 매핑이 완료된 경우에만 업로드 버튼을 활성화하는  
고급 파일 매핑 UI를 구성하는 scaffold 생성기입니다.  
shadcn/ui 컴포넌트를 기반으로 UI를 구성하고, Zustand로 상태를 관리하세요.

────────────────────────────────────────────
🎯 기능 목표 요약

• 엑셀 업로드 후 미리보기 (헤더 + 상위 5개 데이터 row) 표시  
• DB 컬럼 리스트를 badge 형태로 상단에 나열  
• 각 badge는 drag 가능, table header는 drop target  
• 또는 각 헤더 cell에 selector를 제공하여 DB 컬럼 선택 가능  
• 선택된 컬럼은 badge 색상이 녹색으로 변경됨  
• 모든 헤더가 매핑되면 "업로드" 버튼이 활성화됨  
• 업로드 시 매핑된 헤더(key)를 기준으로 데이터가 DB에 저장됨

────────────────────────────────────────────
📁 구성 요소

renderer/
├── src/
│ ├── components/
│ │ ├── ExcelPreview.tsx ← 엑셀 테이블 미리보기 (헤더 + 5개 row)
│ │ ├── ColumnBadge.tsx ← DB 컬럼 목록 배지 + 드래그 상태 표시
│ │ └── HeaderMappingSelector.tsx ← 드롭 영역 또는 셀렉터 UI
│ ├── pages/
│ │ └── UploadPage.tsx ← 전체 화면 조합
│ ├── stores/
│ │ └── uploadStore.ts ← 상태 저장 (headers, rows, mapping, etc)

────────────────────────────────────────────
📦 주요 상태 (uploadStore):

- `headers: string[]` → 엑셀에서 추출된 원본 헤더
- `rows: any[]` → 엑셀에서 추출된 미리보기 데이터 (최대 5개 row)
- `dbColumns: string[]` → 현재 데이터베이스 컬럼명 리스트
- `mapping: Record<string, string>` → 원본 헤더 → DB 컬럼으로 매핑된 상태
- `isReadyToUpload: boolean` → 모든 매핑 완료 여부

────────────────────────────────────────────
📦 주요 UI 구성

1. <ColumnBadgeList />
   - 상단에 DB 컬럼들을 배지 형태로 렌더링
   - 드래그 가능
   - 이미 매핑된 컬럼은 녹색 배지로 표시

2. <ExcelPreview />
   - 표 형태로 headers + 5개 row 표시
   - 각 header는 드롭 영역
   - 또는 셀렉터 클릭 시 HeaderMappingSelector로 DB 컬럼 선택 가능
   - 드래그/셀렉트 시 상태 업데이트

3. <UploadButton />
   - 모든 헤더가 매핑되어야 버튼 활성화
   - 클릭 시 runUploadHandler(mapping, rows) 실행

────────────────────────────────────────────
✅ 완료 조건

- 사용자는 엑셀을 업로드하면 header와 row 데이터가 렌더링됨
- DB 컬럼 리스트는 badge로 상단에 표시되며, 각 배지는 drag 가능
- 테이블 header에 badge를 drop하거나, 각 header에서 컬럼을 선택해 매핑 가능
- 매핑된 헤더는 상태에 반영되며, 사용된 컬럼은 badge 색상이 녹색으로 변경됨
- 모든 헤더가 매핑되면 업로드 버튼이 활성화됨
- 업로드 버튼 클릭 시 매핑된 컬럼명을 기준으로 ipcRenderer.invoke('excel:upload-to-db', { columns, rows }) 호출됨

────────────────────────────────────────────
💡 UX 디테일

- Badge는 `<Badge variant="outline" className={mapped ? 'bg-green-100' : ''}>` 형태로 구현
- 드래그 시 badge에 `draggable` 속성, header에 `onDrop`, `onDragOver` 처리 필요
- 셀렉터는 shadcn/ui의 `<Select>` 컴포넌트 활용
- 매핑이 완료된 상태 판단은 `Object.keys(mapping).length === headers.length` 기준으로 판단
