// ===== Escape HTML =====
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        if (m === "'") return '&#39;';
        return m;
    });
}

// ===== الحصول على مفتاح تخزين خاص بالمستخدم =====
function getWatchlistKey() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? `watchlist_${user.email}` : 'watchlist_guest';
}

// ===== تحميل القائمة =====
function loadWatchlist() {
    return JSON.parse(localStorage.getItem(getWatchlistKey()) || '[]');
}

// ===== حفظ القائمة =====
function saveWatchlist(list) {
    localStorage.setItem(getWatchlistKey(), JSON.stringify(list));
}

// ===== إضافة فيلم =====
async function addToWatchlist() {
    const input = document.getElementById('watchInput');
    const title = input.value.trim();
    if (!title) return;

    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${apiKey}`);
        const data = await res.json();

        if (data.Response === "True") {
            const ratingReqs = data.Search.map(m =>
                fetch(`https://www.omdbapi.com/?i=${m.imdbID}&apikey=${apiKey}`)
                    .then(r => r.json()).catch(() => null)
            );
            const detailed = await Promise.all(ratingReqs);
            const sorted = detailed
                .filter(d => d && d.Response === "True")
                .sort((a, b) => {
                    const vA = parseInt((a.imdbVotes || "0").replace(/,/g, '')) || 0;
                    const vB = parseInt((b.imdbVotes || "0").replace(/,/g, '')) || 0;
                    return vB - vA;
                });
            showResults(sorted);
        } else {
            clearResults();
            alert("No results found!");
        }
    } catch (e) {
        console.error("Network error:", e);
    }
}

// ===== عرض نتائج البحث =====
function showResults(movies) {
    let resultsGrid = document.getElementById('searchResults');
    if (!resultsGrid) {
        resultsGrid = document.createElement('div');
        resultsGrid.id = 'searchResults';
        resultsGrid.className = 'results-grid';
        const hero = document.querySelector('.hero-section');
        if (hero) hero.appendChild(resultsGrid);
    }

    resultsGrid.innerHTML = `
        <p class="results-label">Select to add:</p>
        <div class="results-cards">
            ${movies.map(movie => `
                <div class="result-card" onclick="pickMovie('${escapeHtml(movie.imdbID)}', '${escapeHtml(movie.Title.replace(/'/g, "\\'"))}', '${escapeHtml(movie.Year)}', '${escapeHtml(movie.Poster)}')">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : ''}"
                         onerror="this.style.display='none'"
                         class="result-poster">
                    <div class="result-info">
                        <span class="result-title">${escapeHtml(movie.Title)}</span>
                        <span class="result-year">${escapeHtml(movie.Year)} ${movie.imdbRating !== 'N/A' ? '⭐ ' + escapeHtml(movie.imdbRating) : ''}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function clearResults() {
    const grid = document.getElementById('searchResults');
    if (grid) grid.remove();
}

// ===== اختيار فيلم للإضافة =====
function pickMovie(imdbID, title, year, poster) {
    const watchlist = loadWatchlist();
    if (watchlist.find(m => m.imdbID === imdbID)) {
        alert("Already in your watchlist!");
        return;
    }
    const posterVal = poster !== 'N/A' ? poster : null;
    watchlist.push({ Title: title, Year: year, Poster: posterVal, imdbID });
    saveWatchlist(watchlist);
    renderWatchlist();
    document.getElementById('watchInput').value = '';
    clearResults();
}

// ===== حذف فيلم =====
function removeFromWatchlist(imdbID, event) {
    event.stopPropagation();
    let watchlist = loadWatchlist();
    watchlist = watchlist.filter(m => m.imdbID !== imdbID);
    saveWatchlist(watchlist);
    renderWatchlist();
}

// ===== عرض قائمة المشاهدة =====
function renderWatchlist() {
    const grid = document.getElementById('watchlistGrid');
    const emptyMsg = document.getElementById('emptyMsg');
    const count = document.getElementById('count');

    if (!grid) return;
    grid.innerHTML = '';

    const watchlist = loadWatchlist();
    if (count) count.innerText = watchlist.length;

    if (watchlist.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    watchlist.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => {
            window.location.href = `details.html?id=${movie.imdbID}`;
        };

        card.innerHTML = `
            <button class="remove-btn" onclick="removeFromWatchlist('${escapeHtml(movie.imdbID)}', event)" title="Remove">✕</button>
            ${movie.Poster
                ? `<img src="${escapeHtml(movie.Poster)}" alt="${escapeHtml(movie.Title)}" loading="lazy" onerror="this.parentNode.insertAdjacentHTML('beforeend','<div class=\\'no-poster\\'>🎬</div>'); this.remove();">`
                : `<div class="no-poster">🎬</div>`
            }
            <div class="movie-info">
                <h3>${escapeHtml(movie.Title)}</h3>
                <p>${escapeHtml(movie.Year)}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ===== بدء التحميل =====
window.addEventListener('DOMContentLoaded', renderWatchlist);