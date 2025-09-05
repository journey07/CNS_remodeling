// Supabase 브라우저 클라이언트 초기화
// 전역에서 window.supabaseClient 로 접근 가능
// 안전: anon public key만 사용 (쓰기 권한은 RLS로 제한)

(function() {
	if (window.supabaseClient) return;
	// 환경변수에서만 가져오기 (보안상 하드코딩 제거)
	const SUPABASE_URL = window.CONFIG?.SUPABASE_URL;
	const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY;

	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		console.error('[Supabase] 환경변수가 설정되지 않았습니다. window.ENV에 SUPABASE_URL과 SUPABASE_ANON_KEY를 설정하세요.');
		return;
	}

	if (!window.supabase || !window.supabase.createClient) {
		console.error('[Supabase] SDK가 로드되지 않았습니다. CDN 스크립트를 확인하세요.');
		return;
	}

	window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	});

	console.log('[Supabase] 클라이언트 초기화 완료');
})();


