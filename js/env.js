// 환경변수 로더
// 🔒 보안: 실제 키는 Git에 커밋되지 않습니다
// 📦 Netlify: 배포 시 자동으로 실제 환경변수로 치환됩니다
// 💻 로컬: .env 파일에서 환경변수를 자동으로 로드합니다

// 기본값 설정
window.ENV = {
    SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',
    ADMIN_EMAIL: 'YOUR_ADMIN_EMAIL_HERE',
    NODE_ENV: 'development'
};

// .env 파일 파싱 함수
function parseEnvFile(content) {
    const env = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                // 따옴표 제거
                env[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        }
    }
    return env;
}

// 로컬 개발 환경에서 .env 파일 로드 시도
async function loadEnvFile() {
    if (location.protocol === 'file:') {
        try {
            // file:// 프로토콜에서는 상대 경로로 .env 파일 접근
            const envPath = location.href.includes('/pages/') 
                ? '../.env' 
                : '.env';
            
            const response = await fetch(envPath);
            if (response.ok) {
                const content = await response.text();
                const envVars = parseEnvFile(content);
                
                // 환경변수 업데이트
                if (envVars.SUPABASE_URL) window.ENV.SUPABASE_URL = envVars.SUPABASE_URL;
                if (envVars.SUPABASE_ANON_KEY) window.ENV.SUPABASE_ANON_KEY = envVars.SUPABASE_ANON_KEY;
                if (envVars.ADMIN_EMAIL) window.ENV.ADMIN_EMAIL = envVars.ADMIN_EMAIL;
                if (envVars.NODE_ENV) window.ENV.NODE_ENV = envVars.NODE_ENV;
                
                console.log('✅ .env 파일에서 환경변수를 로드했습니다.');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ .env 파일을 찾을 수 없습니다. 기본값을 사용합니다.');
        }
    }
    return false;
}

// 환경변수 상태 확인
function checkEnvStatus() {
    if (window.ENV.SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
        console.warn('⚠️ 환경변수가 설정되지 않았습니다.');
        console.info('💡 로컬 개발: .env 파일을 생성하거나 env.js를 수정하세요.');
    } else {
        console.log('✅ 환경변수가 로드되었습니다.');
    }
}

// 즉시 실행
(async function() {
    const envLoaded = await loadEnvFile();
    checkEnvStatus();
})();
