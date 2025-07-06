// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// main 폴더의 .env 파일을 올바른 경로로 지정
const envPath = path.join(process.cwd(), 'main', '.env');
dotenv.config({ path: envPath });

console.log('[Config] .env loaded from:', envPath);
console.log('[Config] API Key exists:', !!process.env.ANTHROPIC_API_KEY);
