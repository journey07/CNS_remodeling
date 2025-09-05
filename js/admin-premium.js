// ==========================================
//   PREMIUM ADMIN UI JAVASCRIPT
// ==========================================

// 현재 편집 중인 케이스 정보
let currentEditCase = null;
let deleteTargetCase = null;
let previewState = { urls: [], rawUrls: [], index: 0, company: '', paths: [] };
let imagesMarkedForRemoval = new Set();
let newFilesSelected = [];
const ENABLE_DELEGATE_REMOVE = false;

let premiumCasesCache = [];
let casesRealtimeChannel = null;
function getPremiumCaseData() {
    return premiumCasesCache;
}

async function fetchCasesFromSupabase() {
    const client = window.supabaseClient;
    if (!client) return;
    const { data, error } = await client
        .from('cases')
        .select('*')
        .order('year_month', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
    if (error) {
        console.error(error);
        return;
    }
    // 표준화: images = [{path, url?}] → url 채우기
    premiumCasesCache = (data || []).map(row => {
        const images = Array.isArray(row.images) ? row.images : [];
        const normalized = images.map(img => {
            const path = img.path || img;
            let url = img.url;
            if (!url && path) {
                const res = client.storage.from('portfolio').getPublicUrl(path, { transform: { width: 224, quality: 70 } });
                url = res.data.publicUrl;
            }
            return { path, url, alt: img.alt || '' };
        });
        return {
            id: row.id,
            year: row.year_month,
            company: row.company,
            product: row.product,
            location: row.location,
            industry: row.industry || [],
            tags: row.tags || [],
            images: normalized,
            duration: row.duration,
            summary: row.summary,
            published: row.published,
        };
    });
}

// 서비스 태그 정보
const serviceTagInfo = {
    construction: { name: 'HACCP 공사', color: '#8b5cf6' },
    equipment: { name: 'HACCP 설비', color: '#f97316' },
    consulting: { name: 'HACCP 컨설팅', color: '#22c55e' }
};

// 페이지 초기화
document.addEventListener('DOMContentLoaded', async function() {
    initializePremiumAdmin();
    await fetchCasesFromSupabase();
    loadPremiumCases();
    updateStatistics();
    setupEventListeners();
    setupCasesRealtime();
    // 비밀번호 변경 버튼 바인딩 보강
    const pwBtn = document.getElementById('btnOpenPwChange');
    if (pwBtn) {
        pwBtn.addEventListener('click', function(e){
            e.preventDefault();
            if (typeof openPasswordChangeModal === 'function') {
                openPasswordChangeModal();
            }
        });
    }
});

window.addEventListener('beforeunload', function() {
    if (casesRealtimeChannel) {
        try { casesRealtimeChannel.unsubscribe(); } catch (e) {}
        casesRealtimeChannel = null;
    }
});

function initializePremiumAdmin() {
    console.log('🚀 Premium Admin UI Initialized');
    
    // 애니메이션 효과
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // 업종 통계 분석 (데이터 로드 후 실행)
    setTimeout(async () => {
        await fetchCasesFromSupabase();
        analyzeIndustryStatistics();
    }, 500);
}

// 통계 업데이트
function updateStatistics() {
    const cases = getPremiumCaseData();
    const currentYear = new Date().getFullYear();
    const thisYearCases = cases.filter(c => c.year.startsWith(currentYear.toString()));
    
    const totalElement = document.getElementById('totalCases');
    const thisYearElement = document.getElementById('thisYearCases');
    
    if (totalElement) {
        totalElement.textContent = cases.length;
    }
    
    if (thisYearElement) {
        thisYearElement.textContent = thisYearCases.length;
    }
}

// 업종별 통계 분석 및 정렬
function analyzeIndustryStatistics() {
    const cases = getPremiumCaseData();
    const industryCount = {};
    
    // 각 케이스의 industry 데이터 수집
    cases.forEach(caseItem => {
        if (caseItem.industry && Array.isArray(caseItem.industry)) {
            caseItem.industry.forEach(industry => {
                if (industry && industry.trim()) {
                    industryCount[industry] = (industryCount[industry] || 0) + 1;
                }
            });
        }
    });
    
    // 업종별 개수를 내림차순으로 정렬
    const sortedIndustries = Object.entries(industryCount)
        .sort(([,a], [,b]) => b - a)
        .map(([industry, count]) => ({ industry, count }));
    
    console.log('📊 업종별 통계 (많은 순):');
    sortedIndustries.forEach((item, index) => {
        console.log(`${index + 1}. ${item.industry}: ${item.count}건`);
    });
    
    return sortedIndustries;
}

// 숫자 애니메이션
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const range = end - start;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        const current = Math.floor(start + (range * easeProgress));
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// 사업실적 로드
function loadPremiumCases() {
    const cases = getPremiumCaseData();
    const grid = document.getElementById('premiumCasesGrid');
    
    if (!grid) return;
    
    if (cases.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
                <div style="color: #94a3b8; font-size: 48px; margin-bottom: 24px;">📋</div>
                <h3 style="color: #475569; font-size: 24px; font-weight: 700; margin-bottom: 12px;">사업실적이 없습니다</h3>
                <p style="color: #94a3b8; font-size: 16px; margin-bottom: 32px;">첫 번째 사업실적을 추가해보세요</p>
                <button onclick="openAddModal()" class="primary-action-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    새 실적 추가
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = cases.map(createPremiumCaseCard).join('');
    
    // 카드 애니메이션
    setTimeout(() => {
        const cards = grid.querySelectorAll('.premium-case-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
}

// 회사명과 reference 이미지 매칭 함수
function getReferenceImagePath(companyName) {
    // 회사명 정규화 (괄호, 공백, 특수문자 제거)
    const normalizedCompany = companyName
        .replace(/[()]/g, '')  // 괄호 제거
        .replace(/\s+/g, '')   // 공백 제거
        .replace(/[㈜㈐]/g, ''); // 특수 기호 제거
    
    // reference 폴더의 이미지 파일들과 매칭
    const referenceImages = [
        '효성푸드(주).jpg', '홍당무씨앤씨.jpg', '홍주천년식품.jpg', '해림씨푸드.jpg', '해성물산.jpg', '해초식품.jpg',
        '플로어칠(주).jpg', '한마음유.jpg', '한원푸드시스템.jpg', '한진식품.jpg', '푸른촌.jpg', '티에스커뮤니트.jpg',
        '태양식품.jpg', '(주)태서식품.jpg', '키다리유통.jpg', '진부축산.jpg', '참나무.jpg', '지엠물산.jpg', '정우계육.jpg',
        '제일씨푸드.jpg', '줄포수산.jpg', '인천샌드.jpg', '이춘복참치.jpg', '이호프레.jpg', '이삭미트.jpg', '이담.jpg',
        '유한네이처.jpg', '유성수산.jpg', '유라가(주).jpg', '우리식품.jpg', '원일유통.jpg', '예성(주).jpg', '영우푸드.jpg',
        '신평양찹쌀순대.jpg', '솜사탕제과.jpg', '(주)신일피쉬.jpg', '세종식품.jpg', '성해참치.jpg', '선영네농원.jpg', '(주)성민수산.jpg',
        '비에스에프코리.jpg', '미찌코리아.jpg', '봉이푸드.jpg', '리마카롱.jpg', '동천식품.jpg', '뉴웰빙.jpg', '덕수F&C(주).jpg',
        '꿀꿀이축산.jpg', '남한산성식.jpg', '그린자연식품.jpg', '글로벌미트.jpg', '광미식품.jpg', '(주)가야지.jpg',
        '(주)한서개발.jpg', '(주)흥이란.jpg', '(주)하심.jpg', '(주)프로티앤씨.jpg', '(주)티티코퍼레이션.jpg', '(주)치즈앤푸드.jpg',
        '(주)일영피앤씨.jpg', '(주)청림미트.jpg', '(주)인생푸드.jpg', '(주)유라가.jpg', '(주)왓츠피데.jpg', '(주)올댓푸드.jpg',
        '(주)삼성식품.jpg', '(주)서울플러스.jpg', '(주)마늘향기.jpg', '(주)델리테일.jpg', '(주)광장축산.jpg'
    ];
    
    // 추가 매칭 규칙 (회사명 → 이미지 파일명)
    const additionalMappings = {
        '씨디엠수산(주)': '(주)태서식품.jpg', // 임시로 태서식품 이미지 사용
        // 필요시 더 많은 매핑 규칙 추가
    };
    
    // 0. 추가 매칭 규칙 확인
    if (additionalMappings[companyName]) {
        const mappedImage = additionalMappings[companyName];
        return `../assets/reference/${mappedImage}`;
    }
    
    // 1. 정확한 매칭 시도 (전체 파일명과 비교)
    for (const imageFile of referenceImages) {
        if (companyName === imageFile.replace('.jpg', '')) {
            return `../assets/reference/${imageFile}`;
        }
    }
    
    // 2. 괄호만 제거한 매칭 시도 (주) → 주
    for (const imageFile of referenceImages) {
        const bracketRemovedImage = imageFile.replace(/[()]/g, '').replace('.jpg', '');
        if (companyName === bracketRemovedImage) {
            return `../assets/reference/${imageFile}`;
        }
    }
    
    // 3. 정규화된 정확한 매칭 시도
    for (const imageFile of referenceImages) {
        const normalizedImageName = imageFile
            .replace(/[()]/g, '')
            .replace(/\s+/g, '')
            .replace(/[㈜㈐]/g, '')
            .replace(/\.jpg$/i, '');
        
        if (normalizedCompany === normalizedImageName) {
            return `../assets/reference/${imageFile}`;
        }
    }
    
    // 4. 유사도 기반 매칭 (철자 차이 허용)
    for (const imageFile of referenceImages) {
        const normalizedImageName = imageFile
            .replace(/[()]/g, '')
            .replace(/\s+/g, '')
            .replace(/[㈜㈐]/g, '')
            .replace(/\.jpg$/i, '');
        
        // 유사도 계산 (공통 문자 수 / 전체 문자 수)
        const commonChars = [...new Set(normalizedCompany)].filter(char => 
            normalizedImageName.includes(char)
        ).length;
        const totalChars = Math.max(normalizedCompany.length, normalizedImageName.length);
        const similarity = commonChars / totalChars;
        
        // 80% 이상 유사하면 매칭 성공으로 간주
        if (similarity >= 0.8) {
            return `../assets/reference/${imageFile}`;
        }
    }
    
    // 5. 부분 매칭 시도 (회사명의 주요 부분이 포함된 경우)
    for (const imageFile of referenceImages) {
        const normalizedImageName = imageFile
            .replace(/[()]/g, '')
            .replace(/\s+/g, '')
            .replace(/[㈜㈐]/g, '')
            .replace(/\.jpg$/i, '');
        
        if (normalizedCompany.includes(normalizedImageName) || normalizedImageName.includes(normalizedCompany)) {
            return `../assets/reference/${imageFile}`;
        }
    }
    
    return null;
}

// 프리미엄 케이스 카드 생성
function createPremiumCaseCard(caseItem) {
    const orderedTags = ['construction', 'equipment', 'consulting'];
    const serviceTags = orderedTags.filter(t => caseItem.tags.includes(t)).map(tag => {
        const info = serviceTagInfo[tag];
        return `
            <span class="service-tag ${tag}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M9 11l3 3l8-8"/>
                </svg>
                ${info.name}
            </span>
        `;
    }).join('');
    
    // 대표이미지 경로 가져오기
    const referenceImagePath = getReferenceImagePath(caseItem.company);
    const representativeImage = referenceImagePath ? `
        <div class="case-representative-image">
            <img src="${referenceImagePath}" alt="${caseItem.company} 대표이미지" 
                loading="lazy" 
                onerror="this.style.display='none'; this.parentElement.style.display='none';"
                style="width:100%; height:320px; object-fit:cover; border-radius:12px; margin-bottom:16px;">
        </div>
    ` : '';
    
    const imageCount = (caseItem.images || []).length;
    const thumbs = (caseItem.images || []).slice(0, 5).map((img, idx) => {
        let url = '';
        if (img.path && window.supabaseClient) {
            // 원본 URL 사용 (변환 URL 대신)
            url = window.supabaseClient.storage.from('portfolio').getPublicUrl(img.path).data.publicUrl;
        } else if (img.url) {
            url = img.url;
        }
        
        // URL이 유효하지 않으면 썸네일 생성하지 않음
        if (!url || url.trim() === '') {
            return '';
        }
        
        return `<img src="${url}" alt="thumb" 
            loading="lazy" style="width:112px;height:112px;object-fit:cover;border-radius:12px;border:1px solid #e2e8f0;cursor:pointer;"
            onclick="openImagePreviewFromCase(${caseItem.id}, ${idx})"
            onerror="this.style.display='none';"
        />`;
    }).filter(thumb => thumb !== '').join('');
    const moreImages = imageCount > 5 ? `<div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;border:1px dashed #cbd5e1;border-radius:10px;color:#475569;font-weight:700;">+${imageCount - 5}</div>` : '';
    
    return `
        <div class="premium-case-card" style="opacity: 0; transform: translateY(20px); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);">
            ${representativeImage}
            
            <div class="case-card-header">
                <div class="case-info">
                    <h3 class="case-company">${caseItem.company}</h3>
                    <div class="case-meta">${caseItem.industry && caseItem.industry.length > 0 ? caseItem.industry.join(', ') : caseItem.product} • ${caseItem.location}</div>
                    <div class="case-meta">${caseItem.year} • ${caseItem.duration}</div>
                </div>
                <div class="case-actions">
                    <button class="action-btn btn-edit" onclick="editPremiumCase(${caseItem.id})" title="수정">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="deletePremiumCase(${caseItem.id})" title="삭제">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6l-2,14H7L5,6"/>
                            <path d="M10,11v6"/>
                            <path d="M14,11v6"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="case-services">
                ${serviceTags}
            </div>
            
            <div class="case-summary">
                ${caseItem.summary}
            </div>
            
            <div class="case-images" style="display:flex; gap:8px; flex-wrap:wrap;">
                ${thumbs}
                ${moreImages}
            </div>
        </div>
    `;
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 필터 탭 이벤트
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterCases(filter);
        });
    });
    
    // 검색 이벤트
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchCases(this.value);
        });
    }
    
    // 뷰 컨트롤 이벤트
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            changeView(view);
        });
    });
    
    // 모달 배경 클릭시 닫기
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('premium-modal-overlay')) {
            if (e.target.id === 'premiumEditModal') {
                closePremiumModal();
            } else if (e.target.id === 'premiumDeleteModal') {
                closePremiumDeleteModal();
            } else if (e.target.id === 'passwordChangeModal') {
                closePasswordChangeModal();
            }
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePremiumModal();
            closePremiumDeleteModal();
        closePasswordChangeModal();
        closeImagePreview();
        }
    });

    // 기존 이미지 삭제 토글 (이벤트 위임) - 비활성화: 인라인 핸들러로 처리
    document.addEventListener('click', function(e) {
        if (!ENABLE_DELEGATE_REMOVE) return;
        const btn = e.target.closest('.mark-remove-btn');
        if (!btn) return;
        const key = btn.getAttribute('data-key');
        if (!key) return;
        if (imagesMarkedForRemoval.has(key)) {
            imagesMarkedForRemoval.delete(key);
        } else {
            imagesMarkedForRemoval.add(key);
        }
        if (currentEditCase) renderCurrentImagesPreview(currentEditCase);
    });

    // 파일 선택 변화 감지 → 누적 선택 및 미리보기
    document.addEventListener('change', function(e) {
        const input = e.target.closest('input[name="imageFiles"]');
        if (!input) return;
        const files = Array.from(input.files || []);
        if (files.length === 0) return;
        newFilesSelected.push(...files);
        input.value = '';
        renderNewFilesPreview();
    });

    // 새 파일 제거 클릭
    document.addEventListener('click', function(e) {
        const rm = e.target.closest('.remove-new-btn');
        if (!rm) return;
        const idx = Number(rm.getAttribute('data-new-idx'));
        if (!Number.isNaN(idx)) {
            newFilesSelected.splice(idx, 1);
            renderNewFilesPreview();
        }
    });
}

// Supabase Realtime으로 변경 즉시 반영
function setupCasesRealtime() {
    const client = window.supabaseClient;
    if (!client || casesRealtimeChannel) return;
    casesRealtimeChannel = client
        .channel('cases-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, async () => {
            await fetchCasesFromSupabase();
            loadPremiumCases();
            updateStatistics();
        })
        .subscribe();
}

// 케이스 필터링
function filterCases(filter) {
    const cases = getPremiumCaseData();
    let filteredCases = cases;
    
    if (filter !== 'all') {
        filteredCases = cases.filter(c => c.tags.includes(filter));
    }
    
    displayFilteredCases(filteredCases);
}

// 케이스 검색
function searchCases(query) {
    const cases = getPremiumCaseData();
    const filteredCases = cases.filter(c => {
        const searchText = `${c.company} ${c.product} ${c.location} ${c.summary}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    displayFilteredCases(filteredCases);
}

// 필터된 케이스 표시
function displayFilteredCases(cases) {
    const grid = document.getElementById('premiumCasesGrid');
    if (!grid) return;
    
    if (cases.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
                <div style="color: #94a3b8; font-size: 48px; margin-bottom: 24px;">🔍</div>
                <h3 style="color: #475569; font-size: 24px; font-weight: 700; margin-bottom: 12px;">검색 결과가 없습니다</h3>
                <p style="color: #94a3b8; font-size: 16px;">다른 검색어를 시도해보세요</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = cases.map(createPremiumCaseCard).join('');
    
    // 재애니메이션
    setTimeout(() => {
        const cards = grid.querySelectorAll('.premium-case-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }, 100);
}

// 뷰 변경 (현재는 UI만)
function changeView(view) {
    const grid = document.getElementById('premiumCasesGrid');
    if (!grid) return;
    
    // TODO: 리스트 뷰 구현 (현재는 그리드 뷰만)
    console.log(`View changed to: ${view}`);
}

// ==========================================
//   MODAL FUNCTIONS
// ==========================================

// 새 실적 추가 모달 열기
function openAddModal() {
    currentEditCase = null;
    const modal = document.getElementById('premiumEditModal');
    const title = document.getElementById('premiumModalTitle');
    const form = document.getElementById('premiumCaseForm');
    
    if (title) title.textContent = '새 사업실적 추가';
    if (form) form.reset();
    imagesMarkedForRemoval = new Set();
    const preview = document.getElementById('currentImagesPreview');
    if (preview) preview.innerHTML = '';
    const newPrev = document.getElementById('newImagesPreview');
    if (newPrev) newPrev.innerHTML = '';
    newFilesSelected = [];
    
    clearFormValidation();
    
    if (modal) {
        modal.style.display = 'flex';
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
        const bodyEl = modal.querySelector('.premium-modal-body');
        if (bodyEl) bodyEl.scrollTop = 0;
        setTimeout(() => {
            const bodyEl2 = modal.querySelector('.premium-modal-body');
            if (bodyEl2) bodyEl2.scrollTop = 0;
            const firstInput = modal.querySelector('.premium-input');
            if (firstInput) firstInput.focus();
        }, 300);
    }
}

// 실적 수정 모달 열기
function editPremiumCase(id) {
    const cases = getPremiumCaseData();
    const caseItem = cases.find(c => c.id === id);
    
    if (!caseItem) return;
    
    currentEditCase = caseItem;
    imagesMarkedForRemoval = new Set();
    newFilesSelected = [];
    const modal = document.getElementById('premiumEditModal');
    const title = document.getElementById('premiumModalTitle');
    const form = document.getElementById('premiumCaseForm');
    
    if (title) title.textContent = '사업실적 수정';
    
    // 폼에 데이터 채우기
    if (form) {
        const formData = new FormData();
        formData.append('year', caseItem.year);
        formData.append('duration', caseItem.duration);
        formData.append('company', caseItem.company);
        formData.append('product', caseItem.product);
        formData.append('location', caseItem.location);
        formData.append('summary', caseItem.summary);
        
        // 기본 필드 채우기
        for (let [key, value] of formData.entries()) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        }
        
        // 태그 체크박스 설정
        const checkboxes = form.querySelectorAll('input[name="tags"]');
        checkboxes.forEach(cb => {
            cb.checked = caseItem.tags.includes(cb.value);
        });

        renderCurrentImagesPreview(caseItem);
    }
    
    clearFormValidation();
    
    if (modal) {
        modal.style.display = 'flex';
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
        const bodyEl = modal.querySelector('.premium-modal-body');
        if (bodyEl) bodyEl.scrollTop = 0;
    }
}

function renderCurrentImagesPreview(caseItem) {
    const preview = document.getElementById('currentImagesPreview');
    if (!preview) return;
    const client = window.supabaseClient;
    preview.innerHTML = (caseItem.images || []).map((img, idx) => {
        const url = img.url || (client?.storage.from('portfolio').getPublicUrl(img.path).data.publicUrl);
        const key = img.path || `idx-${idx}`;
        const marked = imagesMarkedForRemoval.has(key);
        return `
            <div style="position:relative;width:112px;height:112px;">
                <img src="${url}" alt="이미지" style="width:112px;height:112px;object-fit:cover;border:1px solid #e2e8f0;border-radius:12px;${marked ? 'filter:grayscale(100%);opacity:.5;' : ''}">
                <button type="button" data-key="${key}" class="mark-remove-btn" onclick="toggleExistingImageRemoval('${key.replace(/'/g, "\\'")}')" style="position:absolute;right:6px;top:6px;background:${marked ? '#ef4444' : 'rgba(15,23,42,.7)'};color:#fff;border:none;border-radius:8px;padding:4px 6px;font-size:11px;cursor:pointer;z-index:10;pointer-events:auto;">${marked ? '취소' : '삭제'}</button>
            </div>
        `;
    }).join('');
}

// 기존 이미지 삭제 토글 (직접 핸들러)
function toggleExistingImageRemoval(key) {
    if (!key) return;
    if (imagesMarkedForRemoval.has(key)) {
        imagesMarkedForRemoval.delete(key);
    } else {
        imagesMarkedForRemoval.add(key);
    }
    if (currentEditCase) renderCurrentImagesPreview(currentEditCase);
}
window.toggleExistingImageRemoval = toggleExistingImageRemoval;

function renderNewFilesPreview() {
    const wrap = document.getElementById('newImagesPreview');
    if (!wrap) return;
    wrap.innerHTML = newFilesSelected.map((file, i) => {
        const url = URL.createObjectURL(file);
        return `
            <div style=\"position:relative;width:112px;height:112px;\">\n                <img src=\"${url}\" alt=\"new\" style=\"width:112px;height:112px;object-fit:cover;border:1px solid #e2e8f0;border-radius:12px;\">\n                <button type=\"button\" data-new-idx=\"${i}\" class=\"remove-new-btn\" style=\"position:absolute;right:6px;top:6px;background:#ef4444;color:#fff;border:none;border-radius:8px;padding:4px 6px;font-size:11px;cursor:pointer;\">삭제</button>\n            </div>
        `;
    }).join('');
}

// 실적 삭제 모달 열기
function deletePremiumCase(id) {
    const cases = getPremiumCaseData();
    const caseItem = cases.find(c => c.id === id);
    
    if (!caseItem) return;
    
    deleteTargetCase = caseItem;
    const modal = document.getElementById('premiumDeleteModal');
    const targetInfo = document.getElementById('deleteTargetInfo');
    
    if (targetInfo) {
        targetInfo.innerHTML = `
            <strong>${caseItem.company}</strong><br>
            <small>${caseItem.year} • ${caseItem.product}</small>
        `;
    }
    
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 프리미엄 모달 닫기
function closePremiumModal() {
    const modal = document.getElementById('premiumEditModal');
    if (modal) {
        modal.style.display = 'none';
        currentEditCase = null;
        clearFormValidation();
        imagesMarkedForRemoval = new Set();
        newFilesSelected = [];
        const curPrev = document.getElementById('currentImagesPreview');
        if (curPrev) curPrev.innerHTML = '';
        const newPrev = document.getElementById('newImagesPreview');
        if (newPrev) newPrev.innerHTML = '';
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
    }
}

// 프리미엄 삭제 모달 닫기
function closePremiumDeleteModal() {
    const modal = document.getElementById('premiumDeleteModal');
    if (modal) {
        modal.style.display = 'none';
        deleteTargetCase = null;
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
    }
}

// 삭제 확인
async function confirmPremiumDelete() {
    if (!deleteTargetCase) return;
    const client = window.supabaseClient;
    try {
        // DB 삭제
        const { error } = await client.from('cases').delete().eq('id', deleteTargetCase.id);
        if (error) throw error;
        // 스토리지 정리(옵션): 경로가 있으면 삭제 시도
        const paths = (deleteTargetCase.images || []).map(i => i.path).filter(Boolean);
        if (paths.length > 0) {
            await client.storage.from('portfolio').remove(paths);
        }
    showNotification(`${deleteTargetCase.company} 실적이 삭제되었습니다.`, 'success');
    } catch (e) {
        console.error(e);
        showNotification('삭제 중 오류가 발생했습니다.', 'info');
    } finally {
    closePremiumDeleteModal();
        await fetchCasesFromSupabase();
        loadPremiumCases();
        updateStatistics();
    }
}

// ==========================================
//   FORM HANDLING
// ==========================================

// 폼 제출 처리
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('premiumCaseForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePremiumFormSubmit();
        });
    }
});

async function handlePremiumFormSubmit() {
    const form = document.getElementById('premiumCaseForm');
    if (!form) return;
    
    // 폼 유효성 검사
    if (!validatePremiumForm(form)) {
        return;
    }
    
    const formData = new FormData(form);
    
    // 태그 수집
    const order = ['construction', 'equipment', 'consulting'];
    const tags = Array.from(form.querySelectorAll('input[name="tags"]:checked'))
        .map(cb => cb.value)
        .sort((a, b) => order.indexOf(a) - order.indexOf(b));
    
    const newCase = {
        year: formData.get('year').trim(),
        company: formData.get('company').trim(),
        product: formData.get('product').trim(),
        location: formData.get('location').trim(),
        industry: currentEditCase && currentEditCase.industry || [], // 기존 산업 유지
        tags: tags,
        // images는 업로드 후 URL로 대체됨
        images: [],
        duration: formData.get('duration').trim(),
        summary: formData.get('summary').trim()
    };
    
    // 실제 업로드 + DB 저장
    try {
        await submitCaseToSupabase(newCase, form);
        await fetchCasesFromSupabase();
        loadPremiumCases();
        updateStatistics();
        showNotification('저장되었습니다.', 'success');
        closePremiumModal();
    } catch (err) {
        console.error(err);
        showNotification(err && err.message ? err.message : '저장 중 오류가 발생했습니다.', 'info');
    }
}

// 폼 유효성 검사
function validatePremiumForm(form) {
    clearFormValidation();
    let isValid = true;
    let firstInvalid = null;
    const requiredFields = ['year', 'duration', 'company', 'product', 'location', 'summary'];
    // 필수값
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field && !field.value.trim()) {
            showFieldError(field, '이 필드는 필수입니다.');
            if (!firstInvalid) firstInvalid = field;
            isValid = false;
        }
    });
    // 태그 최소 1개
    const checkedTags = form.querySelectorAll('input[name="tags"]:checked');
    if (checkedTags.length === 0) {
        const tagsWrap = form.querySelector('.service-tags');
        showFieldError(tagsWrap, '최소 하나의 서비스를 선택해주세요.');
        if (!firstInvalid && tagsWrap) {
            const cb = tagsWrap.querySelector('input[type="checkbox"]');
            if (cb) firstInvalid = cb;
        }
        isValid = false;
    }
    // 날짜 형식 강화
    const yearField = form.querySelector('[name="year"]');
    if (yearField && yearField.value.trim()) {
        const yearPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
        if (!yearPattern.test(yearField.value.trim())) {
            showFieldError(yearField, 'YYYY-MM (01~12월) 형식으로 입력해주세요.');
            if (!firstInvalid) firstInvalid = yearField;
            isValid = false;
        }
    }
    // 요약 최소 길이
    const summaryField = form.querySelector('[name="summary"]');
    if (summaryField && summaryField.value.trim().length > 0 && summaryField.value.trim().length < 10) {
        showFieldError(summaryField, '요약은 최소 10자 이상 입력해주세요.');
        if (!firstInvalid) firstInvalid = summaryField;
        isValid = false;
    }
    // 첫 에러 포커싱 및 상단 노출
    if (!isValid && firstInvalid) {
        if (firstInvalid.focus) firstInvalid.focus();
        const bodyEl = document.querySelector('#premiumEditModal .premium-modal-body');
        if (bodyEl) bodyEl.scrollTop = 0;
    }
    return isValid;
}

// 필드 에러 표시
function showFieldError(field, message) {
    if (!field) return;
    
    field.style.borderColor = '#ef4444';
    
    // 기존 에러 메시지 제거
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // 새 에러 메시지 추가
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.style.cssText = 'color: #ef4444; font-size: 12px; font-weight: 500; margin-top: 4px; display: block;';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

// 폼 유효성 검사 클리어
function clearFormValidation() {
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.premium-input, .premium-textarea').forEach(field => {
        field.style.borderColor = '#e2e8f0';
    });
}

// ==========================================
//   NOTIFICATIONS
// ==========================================

function showToast(message, type = 'info') {
    const existing = document.querySelector('.global-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'global-toast';
    const bg = type === 'success' ? '#16a34a' : (type === 'error' ? '#ef4444' : '#334155');
    toast.style.cssText = `position: fixed; top: 24px; right: 24px; z-index: 10001; background: ${bg}; color: #fff; padding: 14px 18px; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 16px 40px rgba(0,0,0,.2); transform: translateX(120%); transition: transform .35s ease; backdrop-filter: blur(8px);`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}
function showNotification(message, type = 'info') { showToast(message, type); }

// ==========================================
//   UTILITIES
// ==========================================

// 페이지가 로드된 후 글로벌 함수로 등록
window.openAddModal = openAddModal;
window.editPremiumCase = editPremiumCase;
window.deletePremiumCase = deletePremiumCase;
window.closePremiumModal = closePremiumModal;
window.closePremiumDeleteModal = closePremiumDeleteModal;
window.confirmPremiumDelete = confirmPremiumDelete; 

// 비밀번호 변경 UI 제어
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
}
window.openPasswordChangeModal = openPasswordChangeModal;
window.closePasswordChangeModal = closePasswordChangeModal;

// 이미지 프리뷰 모달 제어
function openImagePreview(url) {
    const overlay = document.getElementById('imagePreviewModal');
    const img = document.getElementById('imagePreviewTarget');
    if (!overlay || !img) return;
    
    // URL 유효성 검사
    if (!url || url.trim() === '') {
        console.warn('Invalid URL provided to openImagePreview:', url);
        return;
    }
    
    console.log('Opening image preview with URL:', url);
    console.log('Current preview state:', previewState);
    
    // 먼저 모달을 표시
    overlay.style.display = 'flex';
    document.body.classList.add('no-scroll');
    updatePreviewUI();
    
    // 그 다음 이미지 로딩 시작
    img.classList.add('loading');
    // 이미지가 이전에 숨겨져 있을 수 있으므로 미리 표시 준비
    img.style.display = 'block';
    img.style.visibility = 'visible';
    
    // 직접 전달받은 URL 사용 (이미 rawUrl이어야 함)
    img.onload = () => {
        console.log('Image loaded successfully:', url);
        console.log('Image dimensions after load:', img.naturalWidth, 'x', img.naturalHeight);
        console.log('Image display style before fix:', window.getComputedStyle(img).display);
        
        // 이미지가 숨겨져 있다면 강제로 표시
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        img.classList.remove('loading');
        
        console.log('Image display style after fix:', window.getComputedStyle(img).display);
    };
    img.onerror = () => {
        console.warn('Image failed to load:', url);
        img.classList.remove('loading');
        // 에러 시 placeholder나 기본 이미지 표시할 수 있음
    };
    
    // 작은 지연 후 이미지 src 설정 (모달이 완전히 표시된 후)
    setTimeout(() => {
        img.src = url;
        console.log('Image src set to:', url);
    }, 50);
    
    // Debug: check if modal is visible
    console.log('Modal display style:', overlay.style.display);
    console.log('Modal computed style:', window.getComputedStyle(overlay).display);
}
function closeImagePreview() {
    const overlay = document.getElementById('imagePreviewModal');
    const img = document.getElementById('imagePreviewTarget');
    if (!overlay || !img) return;
    overlay.style.display = 'none';
    img.src = '';
    img.onload = null;
    img.onerror = null;
    // Reset image styles to prevent issues next time
    img.style.display = 'block';
    img.style.visibility = 'visible';
    img.style.opacity = '1';
    img.classList.remove('loading');
    // Reset preview state
    previewState = { urls: [], rawUrls: [], index: 0, company: '', paths: [] };
    document.body.classList.remove('no-scroll');
}
window.openImagePreview = openImagePreview;
window.closeImagePreview = closeImagePreview;

// ==========================================
//   SUPABASE INTEGRATION
// ==========================================

// 이미지 프리뷰 제어 (케이스 단위)
function openImagePreviewFromCase(caseId, startIndex = 0) {
    const cases = getPremiumCaseData();
    const item = cases.find(c => c.id === caseId);
    if (!item) {
        console.warn('Case not found:', caseId);
        return;
    }
    
    const client = window.supabaseClient;
    console.log('Opening preview for case:', caseId, 'images:', item.images);
    
    // 먼저 raw URLs를 생성 (더 안정적)
    const validImages = (item.images || []).filter(img => img.path || img.url);
    const rawUrls = validImages.map(img => {
        if (img.path && client) {
            return client.storage.from('portfolio').getPublicUrl(img.path).data.publicUrl;
        }
        return img.url || '';
    }).filter(url => url && url.trim() !== '');
    
    // paths도 함께 저장
    const paths = validImages.map(img => img.path || '');
    
    if (rawUrls.length === 0) {
        console.warn('No valid image URLs found for case:', caseId);
        return;
    }
    
    const safeIndex = Math.max(0, Math.min(startIndex, rawUrls.length - 1));
    console.log('Setting preview state:', { rawUrls, index: safeIndex, company: item.company });
    
    // previewState 완전히 새로 설정
    previewState = { 
        urls: rawUrls.slice(), // 복사본 생성
        rawUrls: rawUrls.slice(), 
        index: safeIndex, 
        company: item.company, 
        paths: paths.slice()
    };
    
    openImagePreview(rawUrls[safeIndex]);
}
function nextPreviewImage() {
    if (!previewState.rawUrls.length) return;
    previewState.index = (previewState.index + 1) % previewState.rawUrls.length;
    const img = document.getElementById('imagePreviewTarget');
    if (img) {
        const nextUrl = previewState.rawUrls[previewState.index];
        console.log('Next image URL:', nextUrl);
        openImagePreview(nextUrl);
    }
}
function prevPreviewImage() {
    if (!previewState.rawUrls.length) return;
    previewState.index = (previewState.index - 1 + previewState.rawUrls.length) % previewState.rawUrls.length;
    const img = document.getElementById('imagePreviewTarget');
    if (img) {
        const prevUrl = previewState.rawUrls[previewState.index];
        console.log('Previous image URL:', prevUrl);
        openImagePreview(prevUrl);
    }
}
window.openImagePreviewFromCase = openImagePreviewFromCase;
window.nextPreviewImage = nextPreviewImage;
window.prevPreviewImage = prevPreviewImage;

function updatePreviewUI() {
    const titleEl = document.getElementById('imagePreviewTitle');
    if (titleEl) titleEl.textContent = previewState.company || '';
    const counterEl = document.getElementById('previewCounter');
    if (counterEl && previewState.rawUrls && previewState.rawUrls.length) {
        counterEl.textContent = `${previewState.index + 1} / ${previewState.rawUrls.length}`;
    }
}

function getTransformedUrlForPath(path, tier = 'hi') {
    if (!path || !window.supabaseClient) return '';
    const client = window.supabaseClient;
    try {
        const low = { width: 220, quality: 50 };
        const hi = { width: 900, quality: 70 };
        const transform = tier === 'low' ? low : hi;
        const { data } = client.storage.from('portfolio').getPublicUrl(path, { transform });
        return data.publicUrl;
    } catch (e) {
        console.warn('Failed to get transformed URL, falling back to raw URL:', e);
        return getRawUrlForPath(path);
    }
}

function getRawUrlForPath(path) {
    if (!path || !window.supabaseClient) return '';
    const client = window.supabaseClient;
    const { data } = client.storage.from('portfolio').getPublicUrl(path);
    return data.publicUrl;
}

function preloadPreviewNeighbors() {
    if (!previewState.paths || previewState.paths.length <= 1) return;
    const nextIdx = (previewState.index + 1) % previewState.paths.length;
    const prevIdx = (previewState.index - 1 + previewState.paths.length) % previewState.paths.length;
    [nextIdx, prevIdx].forEach(i => {
        const url = getTransformedUrlForPath(previewState.paths[i], 'hi');
        const img = new Image();
        img.src = url;
    });
}

// 이미지 압축 유틸리티 함수들
class ImageCompressor {
    constructor(options = {}) {
        this.options = {
            quality: options.quality || 0.8,           // 압축 품질 (0.1 ~ 1.0)
            maxWidth: options.maxWidth || 1920,        // 최대 너비
            maxHeight: options.maxHeight || 1080,      // 최대 높이
            maxFileSize: options.maxFileSize || 1024 * 1024, // 최대 파일 크기 (1MB)
            format: options.format || 'jpeg',          // 출력 형식 (jpeg, png, webp)
            ...options
        };
    }

    // 이미지 압축 메인 함수
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                try {
                    // 원본 이미지 크기
                    let { width, height } = img;
                    
                    // 최대 크기에 맞게 조정
                    if (width > this.options.maxWidth || height > this.options.maxHeight) {
                        const ratio = Math.min(
                            this.options.maxWidth / width,
                            this.options.maxHeight / height
                        );
                        width *= ratio;
                        height *= ratio;
                    }
                    
                    // Canvas 크기 설정
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 이미지 그리기 (부드러운 렌더링을 위한 설정)
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 압축된 이미지를 Blob으로 변환
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('이미지 압축에 실패했습니다.'));
                                return;
                            }
                            
                            // 파일 크기가 여전히 큰 경우 추가 압축
                            if (blob.size > this.options.maxFileSize) {
                                this.compressWithLowerQuality(file, resolve, reject);
                                return;
                            }
                            
                            // 압축된 파일 정보 반환
                            const compressedFile = new File([blob], file.name, {
                                type: `image/${this.options.format}`,
                                lastModified: Date.now()
                            });
                            
                            resolve({
                                file: compressedFile,
                                originalSize: file.size,
                                compressedSize: blob.size,
                                compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1)
                            });
                        },
                        `image/${this.options.format}`,
                        this.options.quality
                    );
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
            img.src = URL.createObjectURL(file);
        });
    }

    // 더 낮은 품질로 추가 압축
    async compressWithLowerQuality(file, resolve, reject) {
        const lowerQuality = Math.max(0.1, this.options.quality - 0.2);
        const compressor = new ImageCompressor({ ...this.options, quality: lowerQuality });
        
        try {
            const result = await compressor.compressImage(file);
            resolve(result);
        } catch (error) {
            reject(error);
        }
    }

    // 여러 이미지 일괄 압축
    async compressImages(files, progressCallback = null) {
        const results = [];
        const total = files.length;
        
        for (let i = 0; i < total; i++) {
            try {
                if (progressCallback) {
                    progressCallback(i + 1, total, `이미지 압축 중... (${i + 1}/${total})`);
                }
                
                const result = await this.compressImage(files[i]);
                results.push(result);
                
                // 진행률 업데이트
                if (progressCallback) {
                    const progress = ((i + 1) / total) * 100;
                    progressCallback(i + 1, total, `압축 완료: ${result.compressionRatio}% 용량 감소`);
                }
            } catch (error) {
                console.error(`이미지 압축 실패: ${files[i].name}`, error);
                // 압축 실패 시 원본 파일 사용
                results.push({
                    file: files[i],
                    originalSize: files[i].size,
                    compressedSize: files[i].size,
                    compressionRatio: 0
                });
            }
        }
        
        return results;
    }
}

// 압축 설정을 위한 전역 변수
let imageCompressor = new ImageCompressor();
let compressionProgress = {
    isActive: false,
    current: 0,
    total: 0,
    message: ''
};

// 압축 설정 모달 관련 함수들
function openCompressionSettingsModal() {
    const modal = document.getElementById('compressionSettingsModal');
    if (modal) {
        modal.style.display = 'flex';
        loadCompressionSettings();
    }
}

function closeCompressionSettingsModal() {
    const modal = document.getElementById('compressionSettingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function loadCompressionSettings() {
    const saved = localStorage.getItem('imageCompressionSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        document.getElementById('compressionQuality').value = settings.quality * 100;
        document.getElementById('maxWidth').value = settings.maxWidth;
        document.getElementById('maxHeight').value = settings.maxHeight;
        document.getElementById('maxFileSize').value = settings.maxFileSize / (1024 * 1024);
        document.getElementById('outputFormat').value = settings.format;
    }
}

function saveCompressionSettings() {
    const quality = parseFloat(document.getElementById('compressionQuality').value) / 100;
    const maxWidth = parseInt(document.getElementById('maxWidth').value);
    const maxHeight = parseInt(document.getElementById('maxHeight').value);
    const maxFileSize = parseFloat(document.getElementById('maxFileSize').value) * 1024 * 1024;
    const format = document.getElementById('outputFormat').value;
    
    const settings = { quality, maxWidth, maxHeight, maxFileSize, format };
    localStorage.setItem('imageCompressionSettings', JSON.stringify(settings));
    
    // 전역 압축기 업데이트
    imageCompressor = new ImageCompressor(settings);
    
    closeCompressionSettingsModal();
    showNotification('압축 설정이 저장되었습니다.', 'success');
}

// 압축 진행률 표시 함수
function updateCompressionProgress(current, total, message) {
    compressionProgress = { isActive: true, current, total, message };
    
    const progressContainer = document.getElementById('compressionProgress');
    const progressBar = document.getElementById('compressionProgressBar');
    const progressText = document.getElementById('compressionProgressText');
    
    if (progressContainer && progressBar && progressText) {
        // 진행률 표시 컨테이너를 보이게 함
        progressContainer.style.display = 'block';
        
        const progress = (current / total) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = message;
        
        if (current === total) {
            setTimeout(() => {
                compressionProgress.isActive = false;
                progressBar.style.width = '0%';
                progressText.textContent = '';
                progressContainer.style.display = 'none';
            }, 2000);
        }
    }
}

// 압축 진행률 숨기기
function hideCompressionProgress() {
    const progressContainer = document.getElementById('compressionProgress');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    compressionProgress.isActive = false;
}

// 압축 품질 슬라이더 값 표시 업데이트
function updateCompressionQualityValue() {
    const slider = document.getElementById('compressionQuality');
    const valueDisplay = document.getElementById('compressionQualityValue');
    if (slider && valueDisplay) {
        valueDisplay.textContent = `${slider.value}%`;
    }
}

// 압축 설정 모달 초기화
function initializeCompressionSettings() {
    // 품질 슬라이더 이벤트 리스너
    const qualitySlider = document.getElementById('compressionQuality');
    if (qualitySlider) {
        qualitySlider.addEventListener('input', updateCompressionQualityValue);
    }
    
    // 저장된 설정 로드
    loadCompressionSettings();
}

// 압축 결과 표시
function showCompressionResult(filename, compressionRatio, originalSize, compressedSize) {
    const originalMB = (originalSize / 1024 / 1024).toFixed(2);
    const compressedMB = (compressedSize / 1024 / 1024).toFixed(2);
    
    const message = `이미지 압축 완료!\n\n파일: ${filename}\n용량 감소: ${compressionRatio}%\n${originalMB}MB → ${compressedMB}MB`;
    
    // 간단한 알림 표시 (기존 showNotification 함수가 있다면 사용)
    if (typeof showNotification === 'function') {
        showNotification(message, 'success');
    } else {
        // 기본 알림
        alert(message);
    }
}

async function uploadImagesToSupabase(files) {
    const client = window.supabaseClient;
    if (!client) throw new Error('Supabase client not initialized');

    const uploaded = [];
    
    // 압축 진행률 표시
    if (compressionProgress.isActive) {
        updateCompressionProgress(0, files.length, 'Supabase에 업로드 중...');
    }
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 압축된 파일인지 확인 (ImageCompressor 결과 객체인 경우)
        const actualFile = file.file || file;
        const ext = actualFile.name.split('.').pop();
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const path = `uploads/${safeName}`;
        
        try {
            const { error } = await client.storage.from('portfolio').upload(path, actualFile, { upsert: false });
            if (error) throw error;
            
            const { data } = client.storage.from('portfolio').getPublicUrl(path);
            
            // 압축 정보가 있는 경우 포함
            if (file.compressionRatio !== undefined) {
                uploaded.push({ 
                    path, 
                    url: data.publicUrl, 
                    alt: '',
                    compressionInfo: {
                        originalSize: file.originalSize,
                        compressedSize: file.compressedSize,
                        compressionRatio: file.compressionRatio
                    }
                });
                
                console.log(`이미지 압축 완료: ${actualFile.name} - ${file.compressionRatio}% 용량 감소 (${(file.originalSize / 1024 / 1024).toFixed(2)}MB → ${(file.compressedSize / 1024 / 1024).toFixed(2)}MB)`);
                
                // 압축 결과를 사용자에게 알림
                showCompressionResult(actualFile.name, file.compressionRatio, file.originalSize, file.compressedSize);
            } else {
                uploaded.push({ path, url: data.publicUrl, alt: '' });
            }
            
            // 진행률 업데이트
            if (compressionProgress.isActive) {
                updateCompressionProgress(i + 1, files.length, `업로드 완료: ${actualFile.name}`);
            }
            
        } catch (error) {
            console.error(`이미지 업로드 실패: ${actualFile.name}`, error);
            throw error;
        }
    }
    
    return uploaded;
}

async function insertOrUpdateCase(newCase) {
    const client = window.supabaseClient;
    const userRes = await client.auth.getUser();
    const user = userRes.data.user;
    if (!user) throw new Error('로그인이 필요합니다');

    const payload = {
        year_month: newCase.year,
        duration: newCase.duration,
        company: newCase.company,
        product: newCase.product,
        location: newCase.location,
        industry: newCase.industry,
        tags: newCase.tags,
        images: newCase.images.map(i => ({ path: i.path, alt: i.alt || '' })),
        summary: newCase.summary,
        slug: (currentEditCase && currentEditCase.slug)
            ? currentEditCase.slug
            : `${newCase.company}-${newCase.year}`.toLowerCase().replace(/\s+/g, '-'),
        published: true,
        created_by: user.id
    };

    if (currentEditCase && currentEditCase.id) {
        const { error } = await client.from('cases').update(payload).eq('id', currentEditCase.id);
        if (error) throw error;
    } else {
        const { error } = await client.from('cases').insert(payload);
        if (error) throw error;
    }
}

async function submitCaseToSupabase(newCase, form) {
    const fileInput = form.querySelector('input[name="imageFiles"]');
    const files = newFilesSelected.slice();
    let uploaded = [];
    if (files.length > 0) {
        // 이미지 압축 적용
        const compressedResults = await imageCompressor.compressImages(files, updateCompressionProgress);
        uploaded = await uploadImagesToSupabase(compressedResults);
    }
    // 수정 시 기존 이미지 유지 + 삭제 체크 반영 + 중복 제거
    if (currentEditCase && Array.isArray(currentEditCase.images)) {
        const kept = currentEditCase.images.filter(img => !imagesMarkedForRemoval.has(img.path));
        const merged = [...kept, ...uploaded];
        const seen = new Set();
        newCase.images = merged.filter(img => {
            const key = img.path;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    } else {
        newCase.images = uploaded;
    }
    await insertOrUpdateCase(newCase);
    newFilesSelected = [];
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 압축 설정 초기화
    initializeCompressionSettings();
    
    // 비밀번호 변경 폼 처리
    const form = document.getElementById('passwordChangeForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const current = form.querySelector('input[name="current"]').value;
            const next = form.querySelector('input[name="next"]').value;
            if (!current || !next) {
                showNotification('비밀번호를 모두 입력하세요.', 'info');
                return;
            }
            // Supabase는 직접 current 비번 검증 API가 없으므로 재로그인 후 업데이트
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
});