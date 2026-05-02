// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
    loadSuggestedMovies();
    bindSearch();
});

// ===== Load suggested movies =====
async function loadSuggestedMovies() {
    const grid = document.getElementById('suggestedGrid');
    if (!grid) return;
    grid.innerHTML = '<p class="empty-msg">Loading...</p>';

    const keywords = [
        "action", "space", "world", "love", "night", "life", "dream", "star",
        "lost", "hero", "war", "dark", "king", "fire", "ice", "future",
        "man", "woman", "fast", "blue", "magic", "time", "dead", "city",
        "adventure", "mystery", "police", "street", "final"
    ];

    // اختيار عشوائي لـ 8 كلمات في كل مرة لضمان التنوع
    const shuffledKeywords = keywords.sort(() => 0.5 - Math.random()).slice(0, 8);
    let movies = [];
    const seen = new Set();

    for (const kw of shuffledKeywords) {
        try {
            const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(kw)}&type=movie&apikey=${apiKey}`);
            const data = await res.json();
            if (data.Response === "True") {
                for (const m of data.Search) {
                    if (!seen.has(m.imdbID) && m.Poster !== "N/A") {
                        seen.add(m.imdbID);
                        movies.push(m);
                    }
                }
            }
        } catch (e) {
            console.error("Error fetching:", kw, e);
        }
        if (movies.length >= 60) break;
    }

    if (movies.length > 0) {
        const selected = movies.sort(() => 0.5 - Math.random()).slice(0, 20);
        renderMovieGrid(selected, grid);
    } else {
        grid.innerHTML = '<p class="empty-msg">No suggestions available.</p>';
    }
}

// ===== Search binding =====
function bindSearch() {
    const btn = document.getElementById('heroSearchBtn');
    const input = document.getElementById('globalSearchInput');
    if (btn && input) {
        btn.addEventListener('click', () => performSearch(input.value));
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(input.value); });
    }
}

// ===== Perform search =====
async function performSearch(query) {
    query = query.trim();
    if (!query) return;

    const resultsArea = document.getElementById('searchResultsArea');
    const grid = document.getElementById('movieGrid');
    resultsArea.style.display = 'block';
    grid.innerHTML = '<p class="empty-msg">🔍 Searching...</p>';
    document.querySelector('.suggested-section').style.display = 'none';

    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`);
        const data = await res.json();
        if (data.Response === "True") {
            renderMovieGrid(data.Search, grid);
            document.getElementById('searchResultTitle').innerText = `🎬 Results for “${query}”`;
        } else {
            grid.innerHTML = '<p class="empty-msg">No movies found.</p>';
        }
    } catch (e) {
        grid.innerHTML = '<p class="empty-msg">Network error.</p>';
    }
}

// ===== Render movie grid =====
function renderMovieGrid(movies, container) {
    if (!movies.length) {
        container.innerHTML = '<p class="empty-msg">No results.</p>';
        return;
    }
    container.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="location.href='details.html?id=${movie.imdbID}'">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${escHtml(movie.Title)}" loading="lazy">
            <div class="movie-info">
                <h3>${escHtml(movie.Title)}</h3>
                <p>${movie.Year}</p>
            </div>
        </div>
    `).join('');
}

// ===== Escape HTML =====
function escHtml(str) {
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}