// 환경 설정 파일
// 프로덕션 환경에서는 빌드 시점에 환경변수로 치환되어야 함

window.CONFIG = {
    // Supabase 설정 (환경변수로 설정하는 것을 권장)
    SUPABASE_URL: window.ENV?.SUPABASE_URL || 'https://ejqnjxoblfctkouswgkh.supabase.co',
    SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcW5qeG9ibGZjdGtvdXN3Z2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNjUzMDMsImV4cCI6MjA3MDY0MTMwM30.GQ0hxwrvxvPe7LIWbMRal720FhGmhkr2Krqi5VuNsdU',
    
    // 관리자 설정
    ADMIN_EMAIL: window.ENV?.ADMIN_EMAIL || 'counted07@gmail.com',
    
    // 애플리케이션 설정
    VERSION: '1.0.0',
    DEBUG: window.ENV?.NODE_ENV !== 'production',
    
    // 보안 설정
    FORCE_HTTPS: true,
    ALLOWED_ORIGINS: ['https://cnsi.co.kr', 'https://www.cnsi.co.kr']
};

// 보안 검사: HTTPS 강제 (로컬 개발 환경 제외)
if (window.CONFIG.FORCE_HTTPS && 
    location.protocol !== 'https:' && 
    location.protocol !== 'file:' && 
    location.hostname !== 'localhost' && 
    location.hostname !== '127.0.0.1') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}

// 프로덕션에서는 console.log 숨기기
if (!window.CONFIG.DEBUG) {
    console.log = () => {};
    console.warn = () => {};
}
