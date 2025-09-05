// 간단한 모달 열기
function openModal(type = 'baechu') {
    let modalId;
    
    switch(type) {
        case 'nuts':
            modalId = 'nuts-modal';
            break;
        case 'gochu':
            modalId = 'gochu-modal';
            break;
        case 'tea':
            modalId = 'tea-modal';
            break;
        case 'other-kimchi':
            modalId = 'other-kimchi-modal';
            break;
        case 'sauce':
            modalId = 'sauce-modal';
            break;
        case 'pickled':
            modalId = 'pickled-modal';
            break;
        case 'muk':
            modalId = 'muk-modal';
            break;
        case 'meat-packaging':
            modalId = 'meat-packaging-modal';
            break;
        case 'liquid-drink':
            modalId = 'liquid-drink-modal';
            break;
        case 'sesame-oil':
            modalId = 'sesame-oil-modal';
            break;
        case 'rice-cake':
            modalId = 'rice-cake-modal';
            break;
        case 'snack':
            modalId = 'snack-modal';
            break;
        case 'agricultural':
            modalId = 'agricultural-modal';
            break;
        case 'powder':
            modalId = 'powder-modal';
            break;
        case 'bread':
            modalId = 'bread-modal';
            break;
        case 'dried-fish':
            modalId = 'dried-fish-modal';
            break;
        case 'fruit-vegetable':
            modalId = 'fruit-vegetable-modal';
            break;
        case 'tofu':
            modalId = 'tofu-modal';
            break;
        case 'seafood':
            modalId = 'seafood-modal';
            break;
        case 'meat-processing':
            modalId = 'meat-processing-modal';
            break;
        default:
            modalId = 'baechu-modal';
    }
    
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    // 애니메이션을 위한 지연
    setTimeout(() => {
        modal.classList.add('show');
        // add scroll lock class (does not change scroll position)
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');
    }, 10);
    
}

// 간단한 모달 닫기
function closeModal() {
    // 모든 모달을 찾아서 닫기
    const modals = document.querySelectorAll('.simple-modal');
    modals.forEach(modal => {
        if (modal.style.display === 'block') {
            modal.classList.remove('show');
            
            // 애니메이션 완료 후 숨김
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });
    // remove scroll lock class
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
}



// 이미지 지연 로딩(로고/헤더 제외)
document.querySelectorAll('img').forEach((img) => {
    const isLogo = img.closest('.logo') || img.closest('.footer-logo');
    const isDynamicCard = img.closest('.case-card-v2') || img.closest('.modal-main-image');
    
    if (!isLogo && !isDynamicCard) {
        img.loading = 'lazy';
        img.decoding = 'async';
        
        // 이미지 로딩 최적화
        img.addEventListener('load', function() {
            this.classList.add('loaded');
            this.style.opacity = '1';
        });
        
        // 이미지 로딩 실패 시 처리
        img.addEventListener('error', function() {
            // 빈 src나 file:// URL 체크
            if (!this.src || this.src.trim() === '' || this.src.startsWith('file://')) {
                this.style.display = 'none';
                return;
            }
            // Supabase URL이 아닌 경우에만 에러 처리
            if (!this.src.includes('supabase.co')) {
                this.style.display = 'none';
                if (window.CONFIG?.DEBUG) console.warn('Image failed to load:', this.src);
            }
        });
    }
});

// 이미지 프리로딩은 Supabase에서 동적으로 로드되므로 제거


// 내부 링크 프리패치(호버 시)
function prefetch(url) {
    try {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    } catch {}
}
    
document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    const isInternal = href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#');
    if (isInternal) {
        a.addEventListener('mouseenter', () => prefetch(href));
        a.addEventListener('touchstart', () => prefetch(href), { passive: true });
    }
});
// 헤더 그림자 효과
const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
        }
    });
}

// 로고 클릭시 홈페이지로 이동
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', function(e) {
        e.preventDefault();
        const currentPath = window.location.pathname;
        if (currentPath.includes('pages/')) {
            window.location.href = '../index.html';
        } else {
            const heroSection = document.querySelector('#hero');
            if (heroSection) {
                heroSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
}

// 스크롤 다운 아이콘 클릭
const scrollDown = document.querySelector('.scroll-down');
if(scrollDown) {
    scrollDown.addEventListener('click', function() {
        const firstSection = document.querySelector('.story-section');
        if(firstSection) {
            firstSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// 스크롤 애니메이션
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// 심플 솔루션 섹션 애니메이션 관찰
const simpleContent = document.querySelector('.simple-content');
const simpleLargeImage = document.querySelector('.simple-large-image');
const simpleText = document.querySelector('.simple-text');
    
if (simpleContent) {
    observer.observe(simpleContent);
}
if (simpleLargeImage) {
    observer.observe(simpleLargeImage);
}
if (simpleText) {
    observer.observe(simpleText);
}



// 회사명과 reference 이미지 매칭 함수
function getReferenceImagePath(companyName) {
    // 회사명 정규화 (괄호, 공백, 특수문자 제거)
    const normalizedCompany = companyName
        .replace(/[()]/g, '')  // 괄호 제거
        .replace(/\s+/g, '')   // 공백 제거
        .replace(/[㈜㈐]/g, ''); // 특수 기호 제거
    
        // reference 폴더의 이미지 파일들과 매칭 (전역 변수로 정의)
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
    
    // 추가 매칭 규칙 (회사명 → 이미지 파일명) - 전역 변수로 정의
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

// 성공사례 페이지 V2 스크립트
if (document.querySelector('.case-grid')) {
    let caseData = [];
    async function loadCases() {
        try {
            const client = window.supabaseClient;
            if (!client) throw new Error('Supabase client missing');
            const { data, error } = await client
                .from('cases')
                .select('*')
                .eq('published', true)
                .order('year_month', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false });
            if (error) throw error;
            caseData = (data || []).map(row => {
                // 대표 이미지
                let main = null;
                if (Array.isArray(row.images) && row.images.length > 0) {
                    const path = row.images[0].path || row.images[0];
                    console.log('Processing image path:', path, 'for company:', row.company);
                    
                    if (path && typeof path === 'string' && path.length > 0) {
                        try {
                            const res = client.storage.from('portfolio').getPublicUrl(path);
                            main = res.data.publicUrl;
                            console.log('Generated mainImage URL:', main, 'for path:', path);
                        } catch (error) {
                            console.error('Error generating URL for path:', path, error);
                            main = null;
                        }
                    } else {
                        console.warn('Invalid image path:', path, 'for company:', row.company);
                    }
                }
                return {
                    id: row.id,
                    year: row.year_month,
                    company: row.company,
                    product: row.product,
                    location: row.location,
                    industry: row.industry || [],
                    tags: row.tags || [],
                    images: row.images || [],
                    duration: row.duration,
                    summary: row.summary,
                    mainImage: main
                };
            });
            
            // 🎯 데이터 로딩 완료 후 스켈레톤 제거하고 실제 카드 렌더링
            renderCards();
        } catch (e) {
            if (window.CONFIG?.DEBUG) console.error(e);
            // 🎯 에러 발생 시에도 스켈레톤 제거
            const skeletonCards = grid.querySelectorAll('.case-card-skeleton');
            skeletonCards.forEach(skeleton => skeleton.remove());
        }
    }

    const grid = document.querySelector('.case-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    const tagDetails = {
        construction: { icon: 'check', text: 'HACCP 공사' },
        equipment: { icon: 'check', text: 'HACCP 설비' },
        consulting: { icon: 'check', text: 'HACCP 컨설팅' }
    };
    const tagOrder = ['construction', 'equipment', 'consulting'];

    const createCard = (item, isPriority = false) => {
        const card = document.createElement('div');
        card.className = 'case-card-v2';
        card.dataset.id = item.id;
        card.dataset.industry = item.industry.join(',');

        const orderedTags = (item.tags || []).slice().sort((a, b) => tagOrder.indexOf(a) - tagOrder.indexOf(b));
        const tagsHtml = orderedTags.map(tag => `
            <div class="case-card-v2-tag ${tag}">
                <i data-feather="${tagDetails[tag].icon}" style="width:16px; height:16px;"></i>
                <span>${tagDetails[tag].text}</span>
            </div>
        `).join('');

        // 대표이미지 경로 가져오기
        const referenceImagePath = getReferenceImagePath(item.company);
        const representativeImage = referenceImagePath || item.mainImage || '../assets/medal.png';
        const imgAttrs = isPriority
            ? 'loading="eager" decoding="sync" fetchpriority="high"'
            : 'loading="lazy" decoding="async" fetchpriority="low"';

        card.innerHTML = `
            <img src="../assets/medal.png" alt="인증 메달" class="medal-icon">
            <div class="case-card-v2-img">
                <img ${imgAttrs} src="${representativeImage}" alt="${item.company}" onerror="this.src='../assets/medal.png'">
                <div class="certification-badge">HACCP 인증완료</div>
            </div>
            <div class="case-card-v2-info">
                <div class="case-card-v2-header">
                    <h3 class="case-card-v2-title">${item.company}</h3>
                    <div class="case-card-v2-tags">
                        ${tagsHtml}
                    </div>
                </div>
                <div class="case-card-v2-industry">${item.industry.join(', ')}</div>
                <span class="case-card-v2-duration">작업기간 : ${item.duration}</span>
            </div>
        `;
        return card;
    };

    const renderCards = (filter = 'all') => {
        // 🎯 스켈레톤 카드들 제거
        const skeletonCards = grid.querySelectorAll('.case-card-skeleton');
        skeletonCards.forEach(skeleton => skeleton.remove());
        
        // 기존 실제 카드들만 제거 (스켈레톤은 이미 위에서 제거됨)
        const realCards = grid.querySelectorAll('.case-card-v2');
        realCards.forEach(card => card.remove());
        
        let filteredData;
        
        if (filter === 'all') {
            filteredData = caseData;
        } else if (filter === '빵류, 과자류') {
            // 빵류와 과자류를 모두 포함
            filteredData = caseData.filter(item => 
                item.industry.some(industry => 
                    industry.includes('빵류') || industry.includes('과자류')
                )
            );
        } else if (filter === '김치류') {
            // 김치 관련 업종만 포함
            filteredData = caseData.filter(item => 
                item.industry.some(industry => 
                    industry.includes('김치')
                )
            );
        } else if (filter === '기타') {
            // 상위 5개 업종에 포함되지 않은 모든 업종들
            const topIndustries = ['식육포장처리업', '수산물', '식육가공업', '빵류', '과자류', '김치'];
            filteredData = caseData.filter(item => 
                item.industry.some(industry => 
                    !topIndustries.some(top => industry.includes(top))
                )
            );
        } else {
            filteredData = caseData.filter(item => item.industry.includes(filter));
        }
        
        // 현재 그리드 열 개수 계산 (우선순위 로딩을 위해 상단 2행 계산)
        const getColumnCount = () => {
            try {
                const style = window.getComputedStyle(grid);
                const tpl = style.gridTemplateColumns;
                if (tpl && tpl !== 'none') {
                    const repeatMatch = tpl.match(/repeat\(\s*(\d+)\s*,/);
                    if (repeatMatch) return parseInt(repeatMatch[1], 10);
                    const parts = tpl.split(' ').filter(Boolean);
                    if (parts.length > 0) return parts.length;
                }
            } catch (e) {}
            const w = window.innerWidth;
            if (w >= 1025) return 3; // desktop default
            if (w >= 769) return 2;  // tablet
            return 1;               // mobile
        };

        const cols = Math.max(1, getColumnCount());
        const prioritizedCount = Math.max(1, cols * 2); // 상단 2행 우선 로딩

        // 🎯 첫 번째 줄 카드들을 먼저 즉시 렌더링 (매우 빠른 응답성을 위해)
        const firstRowCards = filteredData.slice(0, cols);
        firstRowCards.forEach((item, idx) => {
            const card = createCard(item, true); // 모두 우선순위로 설정
            grid.appendChild(card);
        });
        
        // 🎯 첫 번째 줄 아이콘을 즉시 교체하여 빠른 시각적 피드백 제공
        feather.replace();
        
        // 🎯 나머지 카드들을 비동기로 렌더링 (브라우저 블로킹 방지)
        if (filteredData.length > cols) {
            requestAnimationFrame(() => {
                const remainingCards = filteredData.slice(cols);
                remainingCards.forEach((item, idx) => {
                    const actualIdx = idx + cols;
                    grid.appendChild(createCard(item, actualIdx < prioritizedCount));
                });
                feather.replace();
            });
        }
    };

    const openModal = (id) => {
        const item = caseData.find(d => d.id == id);
        if (!item) return;

        document.getElementById('modal-title').textContent = item.company;
        document.getElementById('modal-location').textContent = `${item.location} | ${item.product}`;
        document.getElementById('modal-summary').textContent = item.summary;
        document.getElementById('modal-duration').textContent = item.duration;
            
            // 메인/썸네일 URL 준비 (메인은 모달용 최적화, 썸네일은 작게 최적화)
            const imgs = (item.images || []).map((img) => {
                const path = img.path || img;
                const thumb = window.supabaseClient.storage
                    .from('portfolio')
                    .getPublicUrl(path, { transform: { width: 112, height: 112, quality: 80, resize: 'cover' } })
                    .data.publicUrl;
                // 모달 메인 이미지를 위한 최적화 (최대 800px 폭, 고품질 유지)
                const full = window.supabaseClient.storage
                    .from('portfolio')
                    .getPublicUrl(path, { transform: { width: 800, quality: 85, resize: 'limit' } })
                    .data.publicUrl;
                return { path, thumb, full };
            });
            
            // 모달에 대표이미지 표시 (reference 이미지 우선, 없으면 기존 이미지)
            const mainImgEl = document.querySelector('.modal-main-image img');
            const referenceImagePath = getReferenceImagePath(item.company);
            const modalImage = referenceImagePath || item.mainImage;
            
            if (mainImgEl && modalImage && modalImage.trim() !== '' && !modalImage.startsWith('file://')) {
                console.log('Setting modal image src to:', modalImage);
                mainImgEl.src = modalImage;
                
                // 이미지 로드 확인
                mainImgEl.onload = () => {
                    console.log('Modal image loaded successfully');
                };
                mainImgEl.onerror = () => {
                    console.error('Modal image failed to load:', modalImage);
                    // 대체 이미지로 fallback - 기본 이미지 사용
                    mainImgEl.src = '../assets/medal.png';
                    // 또는 이미지 컨테이너를 숨김
                    mainImgEl.style.display = 'none';
                };
            } else {
                console.warn('Missing elements:', { mainImgEl: !!mainImgEl, modalImage: !!modalImage });
            }

            
        const tagsContainer = document.getElementById('modal-tags');
        const orderedForModal = (item.tags || []).slice().sort((a, b) => tagOrder.indexOf(a) - tagOrder.indexOf(b));
        tagsContainer.innerHTML = `<p style="color: var(--gray-700); font-size: 14px; margin: 0; line-height: 1.5;">${orderedForModal.map(tag => tagDetails[tag].text).join(', ')}</p>`;

        feather.replace();
        modalOverlay.classList.add('active');
        // Lock background scroll while cases modal is open
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        // Unlock background scroll when cases modal closes
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 🎯 필터 변경 시 즉각적인 스켈레톤 표시 (빠른 시각적 피드백)
            showSkeletonCards();
            
            // 🎯 실제 렌더링을 다음 프레임에서 수행 (브라우저 블로킹 방지)
            requestAnimationFrame(() => {
                renderCards(button.dataset.filter);
            });
        });
    });
    
    // 🎯 스켈레톤 카드 표시 함수
    function showSkeletonCards() {
        // 기존 카드들 제거
        const existingCards = grid.querySelectorAll('.case-card-v2, .case-card-skeleton');
        existingCards.forEach(card => card.remove());
        
        // 현재 화면 크기에 맞는 열 개수 계산
        const getColumnCount = () => {
            try {
                const style = window.getComputedStyle(grid);
                const tpl = style.gridTemplateColumns;
                if (tpl && tpl !== 'none') {
                    const repeatMatch = tpl.match(/repeat\(\s*(\d+)\s*,/);
                    if (repeatMatch) return parseInt(repeatMatch[1], 10);
                    const parts = tpl.split(' ').filter(Boolean);
                    if (parts.length > 0) return parts.length;
                }
            } catch (e) {}
            const w = window.innerWidth;
            if (w >= 1025) return 3; // desktop default
            if (w >= 769) return 2;  // tablet
            return 1;               // mobile
        };
        
        const cols = Math.max(1, getColumnCount());
        
        // 첫 번째 줄 스켈레톤 카드들 추가
        for (let i = 0; i < cols; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'case-card-skeleton';
            skeletonCard.setAttribute('data-skeleton', i + 1);
            skeletonCard.innerHTML = `
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-industry"></div>
                    <div class="skeleton-duration"></div>
                </div>
            `;
            grid.appendChild(skeletonCard);
        }
    }

    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.case-card-v2');
        if (card) {
            openModal(card.dataset.id);
        }
    });
        
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
        
    if(modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // ESC 키로 cases.html 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const casesModal = document.querySelector('.modal-overlay');
            if (casesModal && casesModal.classList.contains('active')) {
                closeModal();
            }
        }
    });

    const thumbImages = document.querySelector('.modal-thumb-images');
    if(thumbImages) {
        thumbImages.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                const mainEl = document.querySelector('.modal-main-image img');
                const full = e.target.getAttribute('data-full') || e.target.getAttribute('src');
                if (mainEl) {
                    // 로딩 상태 표시
                    mainEl.style.opacity = '0.5';
                    mainEl.style.filter = 'blur(2px)';
                    
                    // 이미지 로드 완료 시 효과 제거
                    const onLoad = () => {
                        mainEl.style.opacity = '1';
                        mainEl.style.filter = 'none';
                        mainEl.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
                    };
                    
                    const onError = () => {
                        console.warn('Failed to load thumbnail image:', full);
                        mainEl.style.opacity = '1';
                        mainEl.style.filter = 'none';
                    };
                    
                    mainEl.onload = onLoad;
                    mainEl.onerror = onError;
                    if (full && full.trim() !== '' && !full.startsWith('file://')) {
                        mainEl.src = full;
                    } else {
                        onError();
                    }
                }
                document.querySelectorAll('.modal-thumb-images img').forEach(img => img.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    loadCases();
}

// 포트폴리오 카드 클릭 시 이벤트 처리
const portfolioCards = document.querySelectorAll('.portfolio-card');

portfolioCards.forEach((card) => {
    const industry = card.getAttribute('data-industry');
    
    if (industry === '배추김치') {
        // 배추김치 카드만: 모달 열기
        card.addEventListener('click', function() {
            openModal('baechu');
        });
        // 배추김치 카드만 커서 포인터 표시
        card.style.cursor = 'pointer';
    }
    // 다른 카드들은 클릭 이벤트 없음 (커서도 기본값)
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // cases.html 모달 닫기
        const casesModal = document.querySelector('.modal-overlay');
        if (casesModal && casesModal.classList.contains('active')) {
            closeModal();
        }
        
        // index.html 업종별 카드 모달 닫기
        const simpleModals = document.querySelectorAll('.simple-modal');
        simpleModals.forEach(modal => {
            if (modal.classList.contains('show')) {
                closeModal();
            }
        });
    }
});
    
// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('simple-modal')) {
        closeModal();
    }
});

// 관리자 접근 체크 (전역 함수) - Supabase Auth 연동
async function checkAdminAccess() {
    const modal = document.getElementById('adminPasswordModal');
    if (!modal) return;
        modal.style.display = 'flex';
    const emailEl = document.getElementById('adminEmail');
    if (emailEl) emailEl.focus();
}

// 비밀번호 모달 닫기
function closePasswordModal() {
    const modal = document.getElementById('adminPasswordModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('adminPassword').value = '';
    }
}

// 관리자 비밀번호 확인
async function verifyAdminPassword() {
    try {
    const password = document.getElementById('adminPassword').value;
        // 입력 검증 강화
        if (!password || password.trim() === '') {
            showLoginToast('비밀번호를 입력하세요.', 'info');
            return;
        }
        if (password.length < 6) {
            showLoginToast('비밀번호는 최소 6자 이상이어야 합니다.', 'info');
            return;
        }
        if (!window.supabaseClient) {
            showLoginToast('초기화 오류: Supabase 클라이언트가 없습니다.', 'info');
            return;
        }
        // 관리자 이메일 (환경변수로 이동 권장)
        const ADMIN_EMAIL = window.CONFIG?.ADMIN_EMAIL || 'counted07@gmail.com';
        // 기존 세션이 꼬였을 수 있으므로 먼저 로그아웃 후 재로그인
        await window.supabaseClient.auth.signOut();
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
        if (error) {
            const msg = (error.message || '').toLowerCase().includes('invalid') ? '비밀번호가 올바르지 않습니다.' : `로그인 실패: ${error.message}`;
            showLoginToast(msg, 'error');
            return;
        }
        closePasswordModal();
        // 관리자 여부는 admin 페이지 진입 시 RLS에서 검증되지만, 편의상 바로 이동
        window.location.href = 'admin.html';
    } catch (e) {
        showLoginToast(`로그인 실패: ${e.message || '알 수 없는 오류'}`, 'error');
        if (window.CONFIG?.DEBUG) console.error(e);
    }
}

// 간단한 토스트 UI (사업실적 페이지 전용)
function showLoginToast(message, type = 'info') {
    const existing = document.querySelector('.login-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'login-toast';
    const bg = type === 'error' ? '#ef4444' : (type === 'success' ? '#22c55e' : '#334155');
    toast.style.cssText = `
        position: fixed; top: 24px; right: 24px; z-index: 10001;
        background: ${bg}; color: #fff; padding: 12px 16px; border-radius: 12px;
        font-weight: 700; font-size: 14px; box-shadow: 0 16px 40px rgba(0,0,0,.2);
        transform: translateX(120%); transition: transform .35s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 350);
    }, 2500);
}

    // Enter 키로 로그인
    document.addEventListener('DOMContentLoaded', function() {
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    verifyAdminPassword();
                }
            });
        }
    });

    // 부드러운 스크롤을 위한 앵커 링크 처리
    document.addEventListener('DOMContentLoaded', function() {
        // 추진실적 링크 클릭 시 부드럽게 스크롤
        const achievementsLink = document.querySelector('a[href="#achievements"]');
        if (achievementsLink) {
            achievementsLink.addEventListener('click', function(e) {
                e.preventDefault();
                const achievementsSection = document.getElementById('achievements');
                if (achievementsSection) {
                    achievementsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    });

    // 간단한 hover 효과는 CSS로 처리되므로 JavaScript 불필요

// 지도 로딩 애니메이션 (location.html 전용)
if (window.location.pathname.includes('location.html')) {
    const mapIframe = document.getElementById('map-iframe');
    const loadingOverlay = document.querySelector('.map-loading-overlay');
    
    if (mapIframe && loadingOverlay) {
        // iframe 로드 완료 시 애니메이션 제거
        mapIframe.addEventListener('load', function() {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                mapIframe.style.opacity = '1';
            }, 800); // 최소 800ms 로딩 애니메이션 표시
        });
        
        // 5초 후 강제로 로딩 제거 (네트워크 문제 대비)
        setTimeout(() => {
            if (!loadingOverlay.classList.contains('hidden')) {
                loadingOverlay.classList.add('hidden');
                mapIframe.style.opacity = '1';
            }
        }, 5000);
    }
}

// 모바일 네비게이션 기능 - 완전히 새로 작성
document.addEventListener('DOMContentLoaded', function() {
    if (window.CONFIG?.DEBUG) console.log('DOM 로드 완료');
    
    // 현재 페이지 감지 및 모바일 네비게이션 활성화
    function setActiveMobileNavLink() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // 모든 모바일 네비게이션 링크에서 active 클래스 제거
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 현재 페이지에 해당하는 링크에 active 클래스 추가
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref) {
                const linkPage = linkHref.split('/').pop();
                if (linkPage === currentPage || 
                    (currentPage === 'index.html' && linkHref === 'index.html') ||
                    (currentPath.includes('pages/') && linkHref.includes(currentPage))) {
                    link.classList.add('active');
                }
            }
        });
    }
    
    // 페이지 로드 시 활성 메뉴 설정
    setActiveMobileNavLink();
    
    // 모바일 네비게이션 요소들 찾기
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.querySelector('.mobile-nav-menu');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    
    if (window.CONFIG?.DEBUG) console.log('모바일 네비게이션 요소들:', {
        toggle: mobileNavToggle,
        menu: mobileNavMenu,
        overlay: mobileNavOverlay,
        close: mobileNavClose
    });
    
    if (mobileNavToggle && mobileNavMenu && mobileNavOverlay && mobileNavClose) {
        if (window.CONFIG?.DEBUG) console.log('모든 요소를 찾았습니다. 이벤트 리스너 설정 시작...');
        
        // 모바일 메뉴 열기 함수
        function openMobileNav() {
            if (window.CONFIG?.DEBUG) console.log('모바일 메뉴 열기 실행!');
            mobileNavToggle.classList.add('active');
            mobileNavMenu.classList.add('active');
            mobileNavOverlay.classList.add('active');
            // 사이드바에서는 body scroll을 막지 않음
            if (window.CONFIG?.DEBUG) console.log('클래스 추가 완료:', {
                toggle: mobileNavToggle.classList.contains('active'),
                menu: mobileNavMenu.classList.contains('active'),
                overlay: mobileNavOverlay.classList.contains('active')
            });
        }
        
        // 모바일 메뉴 닫기 함수
        function closeMobileNav() {
            if (window.CONFIG?.DEBUG) console.log('모바일 메뉴 닫기 실행!');
            mobileNavToggle.classList.remove('active');
            mobileNavMenu.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            // body scroll 복원 불필요
        }
        
        // 햄버거 메뉴 클릭 이벤트
        mobileNavToggle.addEventListener('click', function(e) {
            if (window.CONFIG?.DEBUG) console.log('햄버거 메뉴 클릭 이벤트 발생!');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            openMobileNav();
        });
        
        // 햄버거 메뉴 터치 이벤트
        mobileNavToggle.addEventListener('touchstart', function(e) {
            if (window.CONFIG?.DEBUG) console.log('햄버거 메뉴 터치 이벤트 발생!');
            // passive: false로 설정하고 조건부 preventDefault 사용
            if (e.cancelable) {
                e.preventDefault();
            }
            e.stopPropagation();
            e.stopImmediatePropagation();
            openMobileNav();
        }, { passive: false });
        
        // 닫기 버튼 이벤트
        mobileNavClose.addEventListener('click', function(e) {
            if (window.CONFIG?.DEBUG) console.log('닫기 버튼 클릭!');
            e.preventDefault();
            e.stopPropagation();
            closeMobileNav();
        });
        
        // 오버레이 클릭 이벤트 - 메뉴가 열려있을 때만 작동
        mobileNavOverlay.addEventListener('click', function(e) {
            if (mobileNavMenu.classList.contains('active')) {
                if (window.CONFIG?.DEBUG) console.log('오버레이 클릭!');
                closeMobileNav();
            }
        });
        
        // ESC 키 이벤트 - 메뉴가 열려있을 때만 작동
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNavMenu.classList.contains('active')) {
                if (window.CONFIG?.DEBUG) console.log('ESC 키 눌림!');
                closeMobileNav();
            }
        });
        
        // 모바일 메뉴 링크 이벤트 - 메뉴가 열려있을 때만 작동
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach((link, index) => {
            link.addEventListener('click', function(e) {
                if (mobileNavMenu.classList.contains('active')) {
                    if (window.CONFIG?.DEBUG) console.log(`링크 ${index + 1} 클릭!`);
                    closeMobileNav();
                }
            });
        });
        
        if (window.CONFIG?.DEBUG) console.log('모바일 네비게이션 이벤트 리스너 설정 완료!');
        
        // 디버깅용: 현재 상태 확인
        if (window.CONFIG?.DEBUG) console.log('초기 상태:', {
            toggleActive: mobileNavToggle.classList.contains('active'),
            menuActive: mobileNavMenu.classList.contains('active'),
            overlayActive: mobileNavOverlay.classList.contains('active')
        });
        
    } else {
        if (window.CONFIG?.DEBUG) console.error('모바일 네비게이션 요소를 찾을 수 없습니다!');
    }
});