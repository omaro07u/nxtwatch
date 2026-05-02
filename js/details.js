const urlParams = new URLSearchParams(window.location.search);
const imdbID = urlParams.get('id');

function escHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

async function fetchMovieDetails() {
    console.log("الـ ID اللي معانا هو:", imdbID);
    console.log("الـ Key اللي بنستخدمه هو:", apiKey);

    if (!imdbID) {
        document.getElementById('detailsContainer').innerHTML = "<h2>No movie selected!</h2>";
        return;
    }

    try {
        // هنا الـ await بقت جوه الدالة الـ async ومظبوطة
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${apiKey}`);
        const movie = await response.json();

        if (movie.Response === "True") {
            renderDetails(movie);
        } else {
            document.getElementById('detailsContainer').innerHTML = "<h2>Movie not found!</h2>";
        }
    } catch (error) {
        console.error("Error fetching details:", error);
    }
} // القوس ده كان مقفول بدري فوق، دلوقتي مكانه صح

function renderDetails(movie) {
    const container = document.getElementById('detailsContainer');

    let ratingsHTML = '';
    if (movie.Ratings && movie.Ratings.length > 0) {
        movie.Ratings.forEach(rating => {
            let icon = '';
            if (rating.Source === "Internet Movie Database") icon = "⭐ IMDb: ";
            else if (rating.Source === "Rotten Tomatoes") icon = "🍅 Rotten: ";
            else if (rating.Source === "Metacritic") icon = "Ⓜ️ Metacritic: ";
            else icon = "📊 " + rating.Source + ": ";
            ratingsHTML += `<span class="rating-chip">${icon} <b>${escHtml(rating.Value)}</b></span>`;
        });
    }

    container.innerHTML = `
        <div class="poster-section">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600'}" alt="${escHtml(movie.Title)}">
        </div>
        <div class="info-section">
            <h1>${escHtml(movie.Title)}</h1>
            <div class="meta-data">
                <span>📅 ${escHtml(movie.Year)}</span> | <span>⏱️ ${escHtml(movie.Runtime)}</span>
            </div>
            <div class="all-ratings">
                ${ratingsHTML}
            </div>
            <p class="plot">${escHtml(movie.Plot)}</p>
            <div class="details-grid">
                <div class="detail-item"><label>Director</label><p>${escHtml(movie.Director)}</p></div>
                <div class="detail-item"><label>Actors</label><p>${escHtml(movie.Actors)}</p></div>
                <div class="detail-item"><label>Genre</label><p>${escHtml(movie.Genre)}</p></div>
            </div>
        </div>
    `;
}

// نادى الدالة عشان تشتغل أول ما الصفحة تحمل
fetchMovieDetails();