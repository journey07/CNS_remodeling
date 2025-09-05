// 환경변수 템플릿 파일
// 🔒 보안: 실제 키는 Git에 커밋되지 않습니다
// 📦 Netlify: 배포 시 자동으로 실제 환경변수로 치환됩니다
// 💻 로컬: 이 파일을 수정하여 개발용 키를 입력하세요

window.ENV = {
    // 🚨 실제 값으로 교체하세요 (로컬 개발용)
    SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',
    ADMIN_EMAIL: 'YOUR_ADMIN_EMAIL_HERE',
    NODE_ENV: 'development'
};

// 환경변수 상태 확인
if (window.ENV.SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
    console.warn('⚠️ 환경변수가 설정되지 않았습니다. 로컬 개발 시 실제 값을 입력하세요.');
} else {
    console.log('✅ 환경변수가 로드되었습니다.');
}
