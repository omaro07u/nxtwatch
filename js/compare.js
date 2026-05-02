async function getMovieInfo(title) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&plot=full&apikey=${apiKey}`);
        return await response.json();
    } catch (error) {
        console.error("Network error!");
        return null;
    }
}

async function startComparison() {
    const name1 = document.getElementById('movieInput1').value;
    const name2 = document.getElementById('movieInput2').value;

    if (!name1 || !name2) {
        alert("Please enter both movie names.");
        return;
    }

    const movie1 = await getMovieInfo(name1);
    const movie2 = await getMovieInfo(name2);

    if (movie1) updateColumn(movie1, 1);
    if (movie2) updateColumn(movie2, 2);
}

function updateColumn(data, num) {
    if (data.Response === "True") {
        document.getElementById(`title${num}`).innerText = data.Title;
        document.getElementById(`year${num}`).innerText = data.Year;
        document.getElementById(`time${num}`).innerText = data.Runtime;
        document.getElementById(`cast${num}`).innerText = data.Actors;

        // صورة مع رابط بديل
        const posterUrl = data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/160x240?text=No+Poster';
        document.getElementById(`poster${num}`).innerHTML = `<img src="${posterUrl}" class="poster-img" alt="Poster">`;

        // تصفير التقييمات
        document.getElementById(`imdb${num}`).innerText = "N/A";
        document.getElementById(`rotten${num}`).innerText = "N/A";
        document.getElementById(`meta${num}`).innerText = "N/A";

        if (data.Ratings && data.Ratings.length > 0) {
            data.Ratings.forEach(rating => {
                if (rating.Source === "Internet Movie Database") {
                    document.getElementById(`imdb${num}`).innerText = "⭐ " + rating.Value;
                } else if (rating.Source === "Rotten Tomatoes") {
                    document.getElementById(`rotten${num}`).innerText = "🍅 " + rating.Value;
                } else if (rating.Source === "Metacritic") {
                    document.getElementById(`meta${num}`).innerText = "Ⓜ️ " + rating.Value;
                }
            });
        }
    } else {
        alert("Movie not found for column " + num);
    }
}