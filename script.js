/**
 * ハロステ動画詳細ページ 200件対応・完全版
 */

// 1. ベースデータ (ここを元に200件生成します)
const baseData = [
    { id: 1, title: "Juice=Juice「Fiesta! Fiesta!」ライブ映像", category: "ライブ", sub: "Juice=Juice", desc: "2分15秒のDメロから再生。", youtubeId: "v2WpS8X98_I", startTime: 135, uploadDate: "2026-03-01T18:00:00" },
    { id: 2, title: "モーニング娘。'24「最前」レコーディング", category: "レコーディング", sub: "モーニング娘。'24", desc: "歌い出しから再生。", youtubeId: "N_V_tXv3kUo", startTime: 45, uploadDate: "2026-02-15T21:00:00" },
    { id: 3, title: "アンジュルム「新曲」ダンスレッスン", category: "ダンスレッスン", sub: "アンジュルム", desc: "中盤のサビ部分から再生。", youtubeId: "D86_o-U2yE8", startTime: 300, uploadDate: "2026-03-05T19:00:00" },
    { id: 4, title: "BEYOOOOONDS「眼鏡の男の子」寸劇シーン", category: "ライブ", sub: "BEYOOOOONDS", desc: "寸劇パートから再生を開始します。", youtubeId: "8O6vL9CAtzY", startTime: 10, uploadDate: "2025-12-20T12:00:00" },
    { id: 5, title: "つばきファクトリー ボーカル練習風景", category: "レコーディング", sub: "つばきファクトリー", desc: "先生の熱い指導が入るシーン。", youtubeId: "N_V_tXv3kUo", startTime: 120, uploadDate: "2026-01-10T10:00:00" },
    { id: 6, title: "OCHA NORMA「恋のクラウチングスタート」ダンス", category: "ダンスレッスン", sub: "OCHA NORMA", desc: "サビの振り付けレクチャー。", youtubeId: "D86_o-U2yE8", startTime: 60, uploadDate: "2026-02-28T17:00:00" }
];

// 2. データを200件まで自動生成
const videoData = [];
for (let i = 0; i < 200; i++) {
    const base = baseData[i % baseData.length]; // ベースデータをループ利用
    const date = new Date(2026, 2, 8); // 基準日
    date.setDate(date.getDate() - i); // 1日ずつ古いデータにする
    
    videoData.push({
        ...base,
        id: i + 1,
        title: `${base.title} (No.${i + 1})`,
        uploadDate: date.toISOString()
    });
}

// 状態管理
let currentCategory = "すべて";
let searchQuery = "";
let currentPage = 1;
let pageSize = 12;
let sortOrder = "newest";

// DOM要素
const videoGrid = document.getElementById('videoGrid');
const resultCount = document.getElementById('resultCount');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const modal = document.getElementById('videoModal');
const player = document.getElementById('youtubePlayer');

function init() {
    if (!videoGrid) return;
    render();
    setupEventListeners();
}

/**
 * 描画メイン処理
 */
function render() {
    // フィルタリング
    let filtered = videoData.filter(item => {
        const matchesCategory = currentCategory === "すべて" || item.category === currentCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // ソート
    filtered.sort((a, b) => {
        const dateA = new Date(a.uploadDate);
        const dateB = new Date(b.uploadDate);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    resultCount.textContent = `検索結果：${filtered.length}件`;

    // ページ境界チェック
    const maxPage = Math.ceil(filtered.length / pageSize) || 1;
    if (currentPage > maxPage) currentPage = 1;

    // データ切り出し
    const start = (currentPage - 1) * pageSize;
    const pagedItems = filtered.slice(start, start + pageSize);

    // HTML生成
    let gridHtml = '';
    if (pagedItems.length === 0) {
        gridHtml = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">動画が見つかりませんでした。</p>';
    } else {
        pagedItems.forEach((item, index) => {
            // インフィード広告：4番目(index === 3)に挿入
            if (index === 3) {
                gridHtml += `
                    <div class="ad-space ad-card">
                        <div class="ad-label">ADVERTISEMENT</div>
                        <div class="ad-placeholder">Amazon Card Ad</div>
                    </div>
                `;
            }
            gridHtml += `
                <article class="card" onclick="openVideo('${item.youtubeId}', ${item.startTime})">
                    <div class="card-img" style="background-image: url('https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg')"></div>
                    <div class="card-content">
                        <span class="category-badge">${item.category} / ${item.sub}</span>
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-desc">${item.desc}</p>
                    </div>
                </article>
            `;
        });
    }
    
    videoGrid.innerHTML = gridHtml;
    renderPagination(filtered.length);
}

/**
 * スマートページネーション生成 (省略記号対応)
 */
function renderPagination(total) {
    const pageCount = Math.ceil(total / pageSize);
    if (pageCount <= 1) { pagination.innerHTML = ''; return; }

    let html = '';
    const range = 1; // 現在のページの前後いくつ表示するか

    // 「前へ」ボタン
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">&lt;</button>`;

    for (let i = 1; i <= pageCount; i++) {
        // 1ページ目、最後のページ、または現在位置の前後のみ表示
        if (i === 1 || i === pageCount || (i >= currentPage - range && i <= currentPage + range)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } 
        // 省略記号を表示する条件
        else if (i === currentPage - range - 1 || i === currentPage + range + 1) {
            html += `<span style="padding: 8px; color: #999;">...</span>`;
        }
    }

    // 「次へ」ボタン
    html += `<button class="page-btn" ${currentPage === pageCount ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">&gt;</button>`;

    pagination.innerHTML = html;
}

/**
 * イベント設定
 */
function setupEventListeners() {
    document.getElementById('categoryTabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            currentPage = 1;
            render();
        }
    });

    const triggerSearch = () => { searchQuery = searchInput.value; currentPage = 1; render(); };
    document.getElementById('searchBtn').addEventListener('click', triggerSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') triggerSearch(); });
    searchInput.addEventListener('input', () => { clearBtn.style.display = searchInput.value ? 'block' : 'none'; });
    clearBtn.addEventListener('click', () => { searchInput.value = ''; clearBtn.style.display = 'none'; searchQuery = ''; currentPage = 1; render(); });

    document.getElementById('sortOrder').addEventListener('change', (e) => { sortOrder = e.target.value; currentPage = 1; render(); });
    document.getElementById('pageSize').addEventListener('change', (e) => { pageSize = parseInt(e.target.value); currentPage = 1; render(); });

    document.querySelector('.close-modal').onclick = closeModal;
    window.onclick = (event) => { if (event.target == modal) closeModal(); };
}

window.changePage = (page) => { 
    if (page < 1) return;
    currentPage = page; 
    render(); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
};

window.openVideo = (id, time) => {
    player.src = `https://www.youtube.com/embed/${id}?start=${time}&autoplay=1`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

function closeModal() { 
    modal.style.display = 'none'; 
    player.src = ''; 
    document.body.style.overflow = 'auto'; 
}

init();