// Supabase 브라우저 클라이언트 초기화
// 전역에서 window.supabaseClient 로 접근 가능
// 안전: anon public key만 사용 (쓰기 권한은 RLS로 제한)

(function() {
	if (window.supabaseClient) return;
	// 환경변수에서 가져오거나 기본값 사용 (프로덕션에서는 환경변수 필수)
	const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || 'https://ejqnjxoblfctkouswgkh.supabase.co';
	const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcW5qeG9ibGZjdGtvdXN3Z2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNjUzMDMsImV4cCI6MjA3MDY0MTMwM30.GQ0hxwrvxvPe7LIWbMRal720FhGmhkr2Krqi5VuNsdU';

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


