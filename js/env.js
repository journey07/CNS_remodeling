// 환경변수 템플릿 파일
// 🔒 보안: 실제 키는 Git에 커밋되지 않습니다
// 📦 Netlify: 배포 시 자동으로 실제 환경변수로 치환됩니다
// 💻 로컬: js/env.local.js 파일을 생성하여 사용하세요

// 환경변수가 이미 로드되었는지 확인 (env.local.js에서 설정됨)
if (!window.ENV || window.ENV.SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
    // 기본값 설정 (템플릿) - env.local.js가 없을 때만
    window.ENV = {
        SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
        SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',
        ADMIN_EMAIL: 'YOUR_ADMIN_EMAIL_HERE',
        NODE_ENV: 'development'
    };
}

// 환경 감지 및 상태 확인
function detectEnvironment() {
    const isLocal = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isNetlify = location.hostname.includes('netlify.app') || location.hostname.includes('netlify.com');
    
    if (window.ENV.SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
        if (isLocal) {
            console.warn('⚠️ 로컬 환경: 환경변수가 설정되지 않았습니다.');
            console.info('💡 해결방법: js/env.local.js 파일을 생성하고 HTML에서 먼저 로드하세요.');
            console.info('💡 예시: <script src="../js/env.local.js"></script>');
        } else if (isNetlify) {
            console.warn('⚠️ Netlify 환경: 빌드 과정에서 환경변수 주입 실패');
            console.info('💡 확인사항: Netlify 환경변수 설정 및 netlify.toml 빌드 스크립트');
        } else {
            console.warn('⚠️ 프로덕션 환경: 환경변수가 설정되지 않았습니다.');
        }
    } else {
        const envSource = isLocal ? '로컬 개발용' : (isNetlify ? 'Netlify' : '프로덕션');
        console.log(`✅ ${envSource} 환경변수가 로드되었습니다.`);
    }
}

detectEnvironment();
