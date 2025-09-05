// ==========================================
//   ACHIEVEMENTS ADMIN JAVASCRIPT
// ==========================================

// 현재 편집 중인 추진실적 정보
let currentEditAchievement = null;
let deleteTargetAchievement = null;
let achievementsCache = [];
let achievementsRealtimeChannel = null;

// 추진실적 데이터 가져오기
async function fetchAchievementsFromSupabase() {
    const client = window.supabaseClient;
    if (!client) {
        console.error('Supabase 클라이언트가 없습니다.');
        return;
    }
    
    try {
        const { data, error } = await client
            .from('achievements')
            .select('*')
            .order('year_month', { ascending: false })
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('추진실적 데이터 가져오기 오류:', error);
            return;
        }
        
        console.log('DB에서 가져온 원본 데이터:', data);
        
        achievementsCache = data || [];
        console.log('데이터 로딩 완료:', achievementsCache.length, '건');
        
        // 통계와 테이블 업데이트
        updateStatistics();
        renderAchievementsTable();
        
    } catch (err) {
        console.error('데이터 가져오기 중 예외 발생:', err);
    }
}

// 통계 업데이트
function updateStatistics() {
    const totalElement = document.getElementById('totalAchievements');
    const thisYearElement = document.getElementById('thisYearAchievements');
    
    if (totalElement) {
        totalElement.textContent = achievementsCache.length;
        console.log('총 실적 업데이트:', achievementsCache.length);
    }
    
    if (thisYearElement) {
        const currentYear = new Date().getFullYear();
        const thisYearAchievements = achievementsCache.filter(a => 
            a.year_month && a.year_month.startsWith(currentYear.toString())
        );
        thisYearElement.textContent = thisYearAchievements.length;
        console.log('이번 년도 실적 업데이트:', thisYearAchievements.length);
    }
}

// 추진실적 테이블 렌더링
function renderAchievementsTable() {
    const tbody = document.getElementById('achievementsTableBody');
    if (!tbody) return;
    
    if (achievementsCache.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <h3 style="color: #475569; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                        추진실적이 없습니다
                    </h3>
                    <p style="color: #94a3b8; font-size: 14px;">첫 번째 추진실적을 추가해보세요</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = achievementsCache.map(achievement => {
        // 디버깅 로그 추가
        console.log(`Rendering achievement ${achievement.id}:`, {
            company: achievement.company,
            consulting: achievement.consulting,
            equipment: achievement.equipment,
            construction: achievement.construction
        });
        
        return `
        <tr data-id="${achievement.id}">
            <td>${achievement.year_month}</td>
            <td>${achievement.company}</td>
            <td>${achievement.product}</td>
            <td>${achievement.location}</td>
            <td class="service-check ${achievement.consulting ? 'has-service' : 'no-service'}">${achievement.consulting ? '○' : '-'}</td>
            <td class="service-check ${achievement.equipment ? 'has-service' : 'no-service'}">${achievement.equipment ? '○' : '-'}</td>
            <td class="service-check ${achievement.construction ? 'has-service' : 'no-service'}">${achievement.construction ? '○' : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editAchievement(${achievement.id})" title="수정">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteAchievement(${achievement.id})" title="삭제">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6l-2,14H7L5,6"/>
                            <path d="M10,11v6"/>
                            <path d="M14,11v6"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// 새 추진실적 추가 모달 열기
function openAddAchievementModal() {
    currentEditAchievement = null;
    const modal = document.getElementById('achievementEditModal');
    const title = document.getElementById('achievementModalTitle');
    const form = document.getElementById('achievementForm');
    
    if (title) title.textContent = '새 추진실적 추가';
    if (form) {
        form.reset();
        // 모든 체크박스를 명시적으로 체크 해제
        form.querySelector('[name="consulting"]').checked = false;
        form.querySelector('[name="equipment"]').checked = false;
        form.querySelector('[name="construction"]').checked = false;
    }
    
    if (modal) {
        modal.style.display = 'flex';
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
    }
}

// 추진실적 수정 모달 열기
function editAchievement(id) {
    const achievement = achievementsCache.find(a => a.id === id);
    if (!achievement) return;
    
    currentEditAchievement = achievement;
    const modal = document.getElementById('achievementEditModal');
    const title = document.getElementById('achievementModalTitle');
    const form = document.getElementById('achievementForm');
    
    if (title) title.textContent = '추진실적 수정';
    
    // 폼에 데이터 채우기
    if (form) {
        form.querySelector('[name="year_month"]').value = achievement.year_month;
        form.querySelector('[name="company"]').value = achievement.company;
        form.querySelector('[name="product"]').value = achievement.product;
        form.querySelector('[name="location"]').value = achievement.location;
        form.querySelector('[name="consulting"]').checked = achievement.consulting;
        form.querySelector('[name="equipment"]').checked = achievement.equipment;
        form.querySelector('[name="construction"]').checked = achievement.construction;
    }
    
    if (modal) {
        modal.style.display = 'flex';
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
    }
}

// 추진실적 삭제 모달 열기
function deleteAchievement(id) {
    const achievement = achievementsCache.find(a => a.id === id);
    if (!achievement) return;
    
    deleteTargetAchievement = achievement;
    const modal = document.getElementById('deleteAchievementModal');
    const targetInfo = document.getElementById('deleteTargetInfo');
    
    if (targetInfo) {
        targetInfo.innerHTML = `
            <strong>${achievement.company}</strong><br>
            <small>${achievement.year_month} • ${achievement.product}</small>
        `;
    }
    
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 모달 닫기
function closeAchievementModal() {
    const modal = document.getElementById('achievementEditModal');
    if (modal) {
        modal.style.display = 'none';
        currentEditAchievement = null;
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
        
        // 폼과 체크박스 초기화
        const form = document.getElementById('achievementForm');
        if (form) {
            form.reset();
            form.querySelector('[name="consulting"]').checked = false;
            form.querySelector('[name="equipment"]').checked = false;
            form.querySelector('[name="construction"]').checked = false;
        }
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteAchievementModal');
    if (modal) {
        modal.style.display = 'none';
        deleteTargetAchievement = null;
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
    }
}

function closePasswordChangeModal() {
    const modal = document.getElementById('passwordChangeModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
}

// 폼 제출 처리
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('achievementForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAchievementFormSubmit();
        });
    }
    
    // 비밀번호 변경 폼
    const passwordForm = document.getElementById('passwordChangeForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                const current = passwordForm.querySelector('input[name="current"]').value;
                const next = passwordForm.querySelector('input[name="next"]').value;
                if (!current || !next) {
                    showNotification('비밀번호를 모두 입력하세요.', 'info');
                    return;
                }
                
                const userRes = await window.supabaseClient.auth.getUser();
                const email = userRes.data.user?.email;
                if (!email) throw new Error('로그인이 필요합니다');
                
                const signIn = await window.supabaseClient.auth.signInWithPassword({ email, password: current });
                if (signIn.error) throw new Error('현재 비밀번호가 올바르지 않습니다');
                
                const upd = await window.supabaseClient.auth.updateUser({ password: next });
                if (upd.error) throw upd.error;
                
                showNotification('비밀번호가 변경되었습니다.', 'success');
                closePasswordChangeModal();
            } catch (err) {
                console.error(err);
                showNotification('비밀번호 변경에 실패했습니다.', 'info');
            }
        });
    }
});

// 추진실적 폼 제출 처리
async function handleAchievementFormSubmit() {
    const form = document.getElementById('achievementForm');
    if (!form) return;
    
    // 폼 유효성 검사
    if (!validateAchievementForm(form)) {
        return;
    }
    
    const formData = new FormData(form);
    
    const achievementData = {
        year_month: formData.get('year_month').trim(),
        company: formData.get('company').trim(),
        product: formData.get('product').trim(),
        location: formData.get('location').trim(),
        consulting: formData.get('consulting') === 'true',
        equipment: formData.get('equipment') === 'true',
        construction: formData.get('construction') === 'true'
    };
    
    try {
        if (currentEditAchievement && currentEditAchievement.id) {
            // 수정
            await updateAchievement(currentEditAchievement.id, achievementData);
            showNotification('추진실적이 수정되었습니다.', 'success');
        } else {
            // 추가
            await insertAchievement(achievementData);
            showNotification('추진실적이 추가되었습니다.', 'success');
        }
        
        await fetchAchievementsFromSupabase();
        closeAchievementModal();
    } catch (err) {
        console.error(err);
        showNotification(err && err.message ? err.message : '저장 중 오류가 발생했습니다.', 'info');
    }
}

// 폼 유효성 검사
function validateAchievementForm(form) {
    const requiredFields = ['year_month', 'company', 'product', 'location'];
    
    for (const fieldName of requiredFields) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field && !field.value.trim()) {
            showNotification(`${fieldName === 'year_month' ? '추진년도' : fieldName === 'company' ? '회사명' : fieldName === 'product' ? '제품명' : '추진지역'}를 입력해주세요.`, 'info');
            field.focus();
            return false;
        }
    }
    
    // 연도 형식 검사
    const yearField = form.querySelector('[name="year_month"]');
    if (yearField && yearField.value.trim()) {
        const yearPattern = /^\d{4}년 (0[1-9]|1[0-2])월$/;
        if (!yearPattern.test(yearField.value.trim())) {
            showNotification('추진년도는 "YYYY년 MM월" 형식으로 입력해주세요.', 'info');
            yearField.focus();
            return false;
        }
    }
    
    // 최소 하나의 서비스 선택
    const services = ['consulting', 'equipment', 'construction'];
    const hasService = services.some(service => form.querySelector(`[name="${service}"]`).checked);
    
    if (!hasService) {
        showNotification('최소 하나의 서비스를 선택해주세요.', 'info');
        return false;
    }
    
    return true;
}

// 추진실적 추가
async function insertAchievement(achievementData) {
    const client = window.supabaseClient;
    const userRes = await client.auth.getUser();
    const user = userRes.data.user;
    if (!user) throw new Error('로그인이 필요합니다');
    
    const { error } = await client.from('achievements').insert(achievementData);
    if (error) throw error;
}

// 추진실적 수정
async function updateAchievement(id, achievementData) {
    const client = window.supabaseClient;
    const userRes = await client.auth.getUser();
    const user = userRes.data.user;
    if (!user) throw new Error('로그인이 필요합니다');
    
    const { error } = await client.from('achievements').update(achievementData).eq('id', id);
    if (error) throw error;
}

// 추진실적 삭제 확인
async function confirmDeleteAchievement() {
    if (!deleteTargetAchievement) return;
    
    const client = window.supabaseClient;
    try {
        const { error } = await client.from('achievements').delete().eq('id', deleteTargetAchievement.id);
        if (error) throw error;
        
        showNotification(`${deleteTargetAchievement.company} 추진실적이 삭제되었습니다.`, 'success');
    } catch (e) {
        console.error(e);
        showNotification('삭제 중 오류가 발생했습니다.', 'info');
    } finally {
        closeDeleteModal();
        await fetchAchievementsFromSupabase();
    }
}

// 추진실적 필터링
function filterAchievements(filter) {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    let filteredAchievements = achievementsCache;
    
    if (filter !== 'all') {
        filteredAchievements = achievementsCache.filter(a => {
            switch (filter) {
                case 'consulting': return a.consulting;
                case 'equipment': return a.equipment;
                case 'construction': return a.construction;
                default: return true;
            }
        });
    }
    
    renderFilteredAchievements(filteredAchievements);
}

// 필터된 추진실적 렌더링
function renderFilteredAchievements(achievements) {
    const tbody = document.getElementById('achievementsTableBody');
    if (!tbody) return;
    
    if (achievements.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                    <h3 style="color: #475569; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                        검색 결과가 없습니다
                    </h3>
                    <p style="color: #94a3b8; font-size: 14px;">다른 필터를 시도해보세요</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = achievements.map(achievement => `
        <tr data-id="${achievement.id}">
            <td>${achievement.year_month}</td>
            <td>${achievement.company}</td>
            <td>${achievement.product}</td>
            <td>${achievement.location}</td>
            <td class="service-check ${achievement.consulting ? 'has-service' : 'no-service'}">${achievement.consulting ? '○' : '-'}</td>
            <td class="service-check ${achievement.equipment ? 'has-service' : 'no-service'}">${achievement.equipment ? '○' : '-'}</td>
            <td class="service-check ${achievement.construction ? 'has-service' : 'no-service'}">${achievement.construction ? '○' : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editAchievement(${achievement.id})" title="수정">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteAchievement(${achievement.id})" title="삭제">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6l-2,14H7L5,6"/>
                            <path d="M10,11v6"/>
                            <path d="M14,11v6"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 추진실적 검색
function searchAchievements(query) {
    if (!query.trim()) {
        renderAchievementsTable();
        return;
    }
    
    const filteredAchievements = achievementsCache.filter(a => {
        const searchText = `${a.company} ${a.product} ${a.location}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    renderFilteredAchievements(filteredAchievements);
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 필터 탭 이벤트
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterAchievements(filter);
        });
    });
    
    // 검색 이벤트
    const searchInput = document.getElementById('achievementSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchAchievements(this.value);
        });
    }
    
    // 모달 배경 클릭시 닫기
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('premium-modal-overlay')) {
            if (e.target.id === 'achievementEditModal') {
                closeAchievementModal();
            } else if (e.target.id === 'deleteAchievementModal') {
                closeDeleteModal();
            } else if (e.target.id === 'passwordChangeModal') {
                closePasswordChangeModal();
            }
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAchievementModal();
            closeDeleteModal();
            closePasswordChangeModal();
        }
    });
    
    // 비밀번호 변경 폼 제출
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const currentPassword = formData.get('current');
            const newPassword = formData.get('next');
            
            if (!currentPassword || !newPassword) {
                showNotification('모든 필드를 입력해주세요.', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('새 비밀번호는 최소 6자 이상이어야 합니다.', 'error');
                return;
            }
            
            try {
                // 여기에 실제 비밀번호 변경 로직을 구현할 수 있습니다
                // 현재는 성공 메시지만 표시
                showNotification('비밀번호가 성공적으로 변경되었습니다.', 'success');
                closePasswordChangeModal();
                this.reset();
            } catch (error) {
                console.error('비밀번호 변경 오류:', error);
                showNotification('비밀번호 변경 중 오류가 발생했습니다.', 'error');
            }
        });
    }
}

// Supabase Realtime 설정
function setupAchievementsRealtime() {
    const client = window.supabaseClient;
    if (!client || achievementsRealtimeChannel) return;
    
    achievementsRealtimeChannel = client
        .channel('achievements-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, async () => {
            await fetchAchievementsFromSupabase();
        })
        .subscribe();
}

// 알림 표시
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.global-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'global-toast';
    const bg = type === 'success' ? '#16a34a' : (type === 'error' ? '#ef4444' : '#334155');
    
    toast.style.cssText = `
        position: fixed; top: 24px; right: 24px; z-index: 10001; 
        background: ${bg}; color: #fff; padding: 14px 18px; 
        border-radius: 12px; font-weight: 700; font-size: 14px; 
        box-shadow: 0 16px 40px rgba(0,0,0,.2); 
        transform: translateX(120%); transition: transform .35s ease; 
        backdrop-filter: blur(8px);
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Achievements Admin UI Initialized');
    
    setupEventListeners();
    
    // 데이터 로딩 및 통계 업데이트
    await fetchAchievementsFromSupabase();
    
    // 실시간 업데이트 설정
    setupAchievementsRealtime();
    
    // 애니메이션 효과
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // 초기 통계 확인
    console.log('초기 통계 확인:', {
        total: achievementsCache.length,
        thisYear: achievementsCache.filter(a => 
            a.year_month && a.year_month.startsWith(new Date().getFullYear().toString())
        ).length
    });
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    if (achievementsRealtimeChannel) {
        try { achievementsRealtimeChannel.unsubscribe(); } catch (e) {}
        achievementsRealtimeChannel = null;
    }
});

// 전역 함수로 등록
window.openAddAchievementModal = openAddAchievementModal;
window.editAchievement = editAchievement;
window.deleteAchievement = deleteAchievement;
window.closeAchievementModal = closeAchievementModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteAchievement = confirmDeleteAchievement;
window.closePasswordChangeModal = closePasswordChangeModal;

// 비밀번호 변경 모달 제어
function openPasswordChangeModal() {
    const modal = document.getElementById('passwordChangeModal');
    if (modal) {
        modal.style.display = 'flex';
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
        setTimeout(() => {
            const first = modal.querySelector('input[name="current"]');
            if (first) first.focus();
        }, 200);
    }
}

function closePasswordChangeModal() {
    const modal = document.getElementById('passwordChangeModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
}

// 전역 함수로 등록
window.openPasswordChangeModal = openPasswordChangeModal;
window.closePasswordChangeModal = closePasswordChangeModal;
