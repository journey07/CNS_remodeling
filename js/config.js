// 환경 설정 파일
// 프로덕션 환경에서는 빌드 시점에 환경변수로 치환되어야 함

window.CONFIG = {
    // Supabase 설정 (환경변수에서만 가져오기 - 보안상 기본값 제거)
    SUPABASE_URL: window.ENV?.SUPABASE_URL || null,
    SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || null,
    
    // 관리자 설정 (환경변수에서만 가져오기)
    ADMIN_EMAIL: window.ENV?.ADMIN_EMAIL || null,
    
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
