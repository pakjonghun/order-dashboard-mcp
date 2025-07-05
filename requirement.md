1단계 일렉트론 초기세팅

🟣 Electron-SQL Desktop App Scaffold Prompt — Step 1 (Monorepo + SQLite)

당신은 Electron 기반 SQL 분석 데스크탑 앱을 scaffold하는 숙련된 프로젝트 생성기입니다.  
아래 조건을 모두 반영하여 sql-desktop-app/ 프로젝트의 초기 구조를 완성하세요.  
출력은 항상 경로:<<<코드>>> 형식이며, 중첩된 코드블록(백틱)은 사용하지 말고 <<< >>> 만 사용하세요.

────────────────────────────────────────────
📁 전체 디렉토리 구조

sql-desktop-app/
├── main/ ← Electron Main (Node.js, CommonJS, better-sqlite3)
│ ├── package.json
│ ├── tsconfig.json
│ └── src/index.ts
├── renderer/ ← React Renderer (Vite, Tailwind, shadcn/ui)
│ ├── package.json
│ ├── tsconfig.json
│ ├── vite.config.ts
│ └── src/main.tsx
├── shared/ ← 공통 타입 및 유틸 (CJS 빌드 모듈)
│ ├── package.json
│ ├── tsconfig.json
│ └── src/{types.ts, utils.ts, index.ts}
├── package.json ← 루트 워크스페이스 및 스크립트 정의
├── tsconfig.json ← 루트 TS paths 설정
├── .gitignore
└── electron.config.ts

────────────────────────────────────────────
🛠 기술 조건 요약

• Electron 27 + CommonJS (main)
• React 19 + Vite 7 (renderer)
• TailwindCSS + shadcn/ui
• SQLite (better-sqlite3)
• Monorepo 구조: main, renderer, shared 분리
• 공통 모듈 경로는 @shared/\* 사용
• Vite의 별도 alias 설정 없이 tsconfig 기반으로 연결
• npm run dev 실행 시 Vite(3000포트) + Electron 동시 실행

────────────────────────────────────────────
🧩 루트 설정

sql-desktop-app/package.json:
<<<json
{
"name": "sql-desktop-app",
"private": true,
"main": "main/dist/index.js",
"workspaces": ["main", "renderer", "shared"],
"scripts": {
"dev": "npm run build:shared && npm run build:main && concurrently \"npm run dev:main\" \"npm run dev:renderer\" \"npm run dev:electron\"",
"dev:main": "npm run dev --workspace=main",
"dev:renderer": "npm run dev --workspace=renderer",
"dev:electron": "NODE_ENV=development electron .",
"build": "npm run build --workspaces",
"build:main": "npm run build --workspace=main",
"build:renderer": "npm run build --workspace=renderer",
"build:shared": "npm run build --workspace=shared",
"start": "electron ."
},
"devDependencies": {
"concurrently": "^8.2.2",
"electron": "^27.0.0",
"typescript": "^5.3.3"
}
}

> > >

sql-desktop-app/tsconfig.json:
<<<json
{
"compilerOptions": {
"baseUrl": ".",
"paths": {
"@shared/_": ["shared/src/_"]
}
}
}

> > >

sql-desktop-app/.gitignore:
<<<text
node_modules/
dist/
.env
.env.\*
.DS_Store

> > >

sql-desktop-app/electron.config.ts:
<<<typescript
// electron.config.ts
export default {
main: './main/src/index.ts',
preload: '',
renderer: 'http://localhost:3000',
};

> > >

────────────────────────────────────────────
📦 shared 설정 (공통 타입/유틸 모듈)

shared/package.json:
<<<json
{
"name": "@sql-desktop-app/shared",
"version": "0.1.0",
"main": "dist/index.js",
"type": "commonjs",
"scripts": {
"build": "tsc --project tsconfig.json"
},
"devDependencies": {
"typescript": "^5.3.3"
}
}

> > >

shared/tsconfig.json:
<<<json
{
"compilerOptions": {
"target": "ES2020",
"module": "CommonJS",
"outDir": "dist",
"strict": true,
"esModuleInterop": true,
"declaration": true,
"declarationDir": "dist"
},
"include": ["src"]
}

> > >

shared/src/index.ts:
<<<typescript
export _ from './types';
export _ from './utils';

> > >

shared/src/types.ts:
<<<typescript
export interface User {
id: string;
name: string;
}

> > >

shared/src/utils.ts:
<<<typescript
export function formatDate(date: Date): string {
return date.toISOString().split('T')[0];
}

> > >

────────────────────────────────────────────
⚙ main 설정 (Electron CJS 프로세스)

main/package.json:
<<<json
{
"name": "@sql-desktop-app/main",
"version": "0.1.0",
"main": "dist/index.js",
"type": "commonjs",
"scripts": {
"dev": "tsc --project tsconfig.json --watch",
"build": "tsc --project tsconfig.json"
},
"dependencies": {
"@sql-desktop-app/shared": "file:../shared/dist",
"better-sqlite3": "^8.4.0"
},
"devDependencies": {
"@types/node": "^20.5.7",
"typescript": "^5.3.3"
}
}

> > >

main/tsconfig.json:
<<<json
{
"compilerOptions": {
"target": "ES2020",
"module": "CommonJS",
"baseUrl": ".",
"paths": {
"@shared/_": ["../shared/src/_"]
},
"outDir": "dist",
"rootDir": "src",
"strict": true,
"esModuleInterop": true,
"typeRoots": ["../shared/dist", "./node_modules/@types"]
},
"include": ["src"]
}

> > >

main/src/index.ts:
<<<typescript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { formatDate } = require('@sql-desktop-app/shared');

function createWindow() {
const win = new BrowserWindow({
width: 1200,
height: 800,
webPreferences: {
nodeIntegration: true,
contextIsolation: false,
},
});

// 개발 환경: Vite dev 서버(3000포트)로 로드
win.loadURL('http://localhost:3000');

// shared 모듈 사용 예시
console.log('Today is:', formatDate(new Date()));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
if (process.platform !== 'darwin') app.quit();
});

> > >

────────────────────────────────────────────
⚛ renderer 설정 (React + Vite + Tailwind + shadcn)

renderer/package.json:
<<<json
{
"name": "renderer",
"private": true,
"version": "0.0.0",
"type": "module",
"scripts": {
"dev": "vite",
"build": "tsc -b && vite build",
"lint": "eslint .",
"preview": "vite preview"
},
"dependencies": {
"@radix-ui/react-slot": "^1.2.3",
"@tailwindcss/vite": "^4.1.11",
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"lucide-react": "^0.525.0",
"react": "^19.1.0",
"react-dom": "^19.1.0",
"tailwind-merge": "^3.3.1",
"tailwindcss": "^4.1.11"
},
"devDependencies": {
"@eslint/js": "^9.29.0",
"@types/node": "^24.0.10",
"@types/react": "^19.1.8",
"@types/react-dom": "^19.1.6",
"@vitejs/plugin-react": "^4.5.2",
"eslint": "^9.29.0",
"eslint-plugin-react-hooks": "^5.2.0",
"eslint-plugin-react-refresh": "^0.4.20",
"globals": "^16.2.0",
"tw-animate-css": "^1.3.5",
"typescript": "~5.8.3",
"typescript-eslint": "^8.34.1",
"vite": "^7.0.0"
}
}

> > >

renderer/tsconfig.json:
<<<json
{
"compilerOptions": {
"target": "ES2020",
"module": "ESNext",
"baseUrl": ".",
"paths": {
"@shared/_": ["../shared/src/_"]
},
"jsx": "react-jsx",
"strict": true
},
"include": ["src", "../shared/src"]
}

> > >

renderer/vite.config.ts:
<<<typescript
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
plugins: [react(), tailwindcss()],
server: {
port: 3000,
},
resolve: {
alias: {
'@': path.resolve(\_\_dirname, './src'),
},
},
});

> > >

renderer/src/main.tsx:
<<<typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { formatDate } from "@shared/utils";

ReactDOM.createRoot(document.getElementById("root")!).render(
<React.StrictMode>

<div>Hello from Renderer - {formatDate(new Date())}</div>
</React.StrictMode>
);

> > >

────────────────────────────────────────────
✅ 완료 조건

- npm install && npm run dev 실행 시 Electron + Vite 앱 정상 실행
- Vite 개발 서버가 3000포트에서 실행되고 Electron이 해당 포트를 바라봄
- main/renderer 모두에서 @shared/\* 경로로 타입/유틸 가져오기 가능
- Tailwind + shadcn/ui 세팅 완료
- 공통 모듈은 CommonJS 빌드로 CJS/ESM 환경 모두 호환됨
- shared 모듈이 라이브러리처럼 main에서 사용 가능
- TypeScript 실시간 컴파일로 개발 효율성 극대화

────────────────────────────────────────────
🎯 목표 요약

이 프롬프트의 목적은 SQLite 기반 자연어 분석 앱을 위한 **안정적이고 유지보수 가능한 모노레포 구조를 scaffold**하는 것입니다.  
main/renderer/shared의 독립성과 상호작용을 모두 고려한 세팅을 완료하세요.

### 🚀 실행 순서

1. npm install - 의존성 설치
2. npm run build:shared - shared 라이브러리 빌드
3. npm run build:main - main 프로세스 빌드
4. npm run dev - 개발 환경 실행 (Vite 3000포트 + Electron)

### 🔧 핵심 특징

- **모노레포 구조**: main, renderer, shared 분리
- **실시간 개발**: TypeScript watch 모드 + Vite HMR
- **라이브러리 공유**: shared 모듈을 main/renderer에서 공통 사용
- **안정적 빌드**: 컴파일된 JavaScript로 Electron 실행

일렉트론 초기 프롬프트를 위와 같이 바꾸었어 실제로 설치해보면서 가장 적합했어
