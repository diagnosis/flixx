const global ={
    currentPage : window.location.pathname,
    apiKey: '4e44d9029b1270a757cddc766a1bcb63',
    apiBase: 'https://api.themoviedb.org/3',
    endpoint: {
        popularMovies: '/movie/popular',
        popularShows: '/tv/popular'
    },
    pageNum:1,
    totalPages:1
};

//highlight active link
function highlightActiveLink(){
    const links = document.querySelectorAll('nav a');
    links.forEach( link =>{
        if(link.getAttribute('href') === global.currentPage){
            link.classList.add('active');
        }
    })
}
//load spiiner
function showSpinner(){
    const spinner = document.querySelector('.spinner');
    spinner.classList.toggle('show');
}
//populate popular movies

const popularConfig = {
    movies: {
        endpoint: global.endpoint.popularMovies,
        containerId: 'popular-movies',
        renderFn: renderCards
    },
    shows: {
        endpoint: global.endpoint.popularShows,
        containerId: 'popular-shows',
        renderFn: renderCards
    }
}
async function populateTvShowDetails() {
    const params = new URLSearchParams(window.location.search);
    const showId = params.get('id');
    if (!showId) return;

    try {
        const response = await fetch(`${global.apiBase}/tv/${showId}?api_key=${global.apiKey}&language=en-US`);
        if (!response.ok) throw new Error('Failed to fetch show details');
        const show = await response.json();

        renderShowDetails(show);
        displayBackgroundImage(show.backdrop_path)

    }

    catch (error) {
        console.error(error);
        document.getElementById('show-details').innerHTML =
            '<p class="text-red-500">Unable to load show details. Please try again later.</p>';
    }
}
async function populateMovieDetails() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');
    if (!movieId) return;

    try {
        const response = await fetch(`${global.apiBase}/movie/${movieId}?api_key=${global.apiKey}&language=en-US`);
        if (!response.ok) throw new Error('Failed to fetch movie details');
        const movie = await response.json();

        renderMovieDetails(movie);
        displayBackgroundImage(movie.backdrop_path)
    } catch (error) {
        console.error(error);
        document.getElementById('movie-details').innerHTML =
            '<p class="text-red-500">Unable to load movie details. Please try again later.</p>';
    }
}
function renderShowDetails(show) {
    const {
        name,
        overview,
        first_air_date,
        vote_average,
        poster_path,
        genres,
        status,
        homepage,
        production_companies
    } = show;

    const container = document.getElementById('show-details');
    container.innerHTML = `
    <div class="details-top flex space-x-8">
      <img src="https://image.tmdb.org/t/p/w500${poster_path}" alt="">      
      <div>
        <h2>${name}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${vote_average} / 10
        </p>
        <p class="text-gray-500">Release Date: ${first_air_date}</p>
        <p class="mt-4">${overview}</p>
        <h5 class="mt-6 font-semibold">Genres</h5>
        <ul class="list-disc list-inside">
          ${genres.map(g => `<li>${g.name}</li>`).join('')}
        </ul>
        <a href="${homepage}" target="_blank" class="btn mt-4">Visit Show Homepage</a>
      </div>
    </div>
    <div class="details-bottom mt-12">
      <h2 class="text-2xl font-bold mb-4">Show Info</h2>
      <ul class="space-y-2">
        <li><strong>Status:</strong> ${status}</li>
      </ul>
      <h4 class="mt-6 font-semibold">Production Companies</h4>
      <p>${production_companies.map(pc => pc.name).join(', ')}</p>
    </div>
  `;
}


/**
 * Render a movie's details in the #movie-details container.
 *
 * The function takes a movie object with the following properties:
 * - title: string
 * - overview: string
 * - release_date: string
 * - vote_average: number
 * - poster_path: string
 * - genres: array of objects with a `name` property
 * - budget: number
 * - revenue: number
 * - runtime: number
 * - status: string
 * - homepage: string
 * - production_companies: array of objects with a `name` property
 *
 * The function will render the movie's details in the #movie-details container,
 * including the title, overview, genres, budget, revenue, runtime, status,
 * and production companies.
 */
function renderMovieDetails(movie) {
    const {
        title,
        overview,
        release_date,
        vote_average,
        poster_path,
        genres,
        budget,
        revenue,
        runtime,
        status,
        homepage,
        production_companies
    } = movie;

    const container = document.getElementById('movie-details');
    container.innerHTML = `
    <div class="details-top flex space-x-8">
      <img
        src="${poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : 'images/no-image.jpg'}"
        alt="${title}"
        class="w-48 rounded"
      />
      <div>
        <h2 class="text-3xl font-bold">${title}</h2>
        <p><i class="fas fa-star text-yellow-500"></i> ${vote_average} / 10</p>
        <p class="text-gray-500">Release Date: ${release_date}</p>
        <p class="mt-4">${overview}</p>
        <h5 class="mt-6 font-semibold">Genres</h5>
        <ul class="list-disc list-inside">
          ${genres.map(g => `<li>${g.name}</li>`).join('')}
        </ul>
        <a href="${homepage}" target="_blank" class="btn mt-4">Visit Movie Homepage</a>
      </div>
    </div>
    <div class="details-bottom mt-12">
      <h2 class="text-2xl font-bold mb-4">Movie Info</h2>
      <ul class="space-y-2">
        <li><strong>Budget:</strong> $${budget.toLocaleString()}</li>
        <li><strong>Revenue:</strong> $${revenue.toLocaleString()}</li>
        <li><strong>Runtime:</strong> ${runtime} minutes</li>
        <li><strong>Status:</strong> ${status}</li>
      </ul>
      <h4 class="mt-6 font-semibold">Production Companies</h4>
      <p>${production_companies.map(pc => pc.name).join(', ')}</p>
    </div>
  `;
}



/**
 * Populate the popular movies/shows section of the page with data from the TMDB API.
 * @param {string} type - The type of content to populate, either 'movies' or 'shows'.
 * @throws {Error} If the API request fails.
 */
async function populatePopular(type) {
    const { endpoint, containerId, renderFn } = popularConfig[type]
    const container = document.getElementById(containerId)
    container.innerHTML = ''  // clear placeholder cards

    const response = await fetch(`${global.apiBase}${endpoint}?api_key=${global.apiKey}&language=en-US&page=1`)
    if (!response.ok) throw new Error(`Failed to load popular ${type}`)

    const { results } = await response.json()
    renderFn(results, container,type,8)
}

//render popular shows



//display back image
function displayBackgroundImage(path) {
    if (!path) return;

    const container = document.body;
    if (!container) return;

    // Make sure container is positioned so overlay sits behind
    container.style.position = 'relative';

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        backgroundImage: `url(https://image.tmdb.org/t/p/original${path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'absolute',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        zIndex: '-1',
        opacity: '0.2'
    });

    container.prepend(overlay);
}

async function addSwiper() {
    const res = await fetch(`${global.apiBase}/movie/now_playing?api_key=${global.apiKey}&language=en-US&page=1`);
    const  {results}  = await res.json();
    // Populate slides

    const wrapper = document.querySelector('.swiper .swiper-wrapper');
    wrapper.innerHTML = results.slice(0, 6)
        .map(movie => `
      <div class="swiper-slide">
        <a href="movie-details.html?id=${movie.id}">
          <img src="${movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : './images/no-image.jpg'}" 
               alt="${movie.title}" />
        </a>
        <h4 class="swiper-rating">
          <i class="fas fa-star text-secondary"></i> ${movie.vote_average} / 10
        </h4>
      </div>
    `).join('');

    // Initialize Swiper
    new Swiper('.swiper', {
        direction: 'horizontal',
        slicePerView: 1,
        spaceBetween: 30,
        freeMode: true,
        loop: true,
        autoplay: {
            delay: 4000,
            disableWhenWindowInActive: false
        },
        breakpoints:{
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 40
            },
            1200: {
                slidesPerView: 4,
                spaceBetween: 50
            }
        },
        scrollbar: {
            el: '.swiper-scrollbar'
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        }
    });
}

//pouplate search results
async function populateSearchResults() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const type = urlParams.get('type');
    const searchTerm = urlParams.get('search-term');
    if(!searchTerm) {

        const container = document.getElementById('search-results');
        container.innerHTML = '';
        container.innerHTML = `<p class="text-red-500">Please enter a search term</p>`
        showAlert('Please enter a search term', 'alert-error');
        return
    }
    const response = await fetch(`${global.apiBase}/search/${type}?api_key=${global.apiKey}&language=en-US&query=${searchTerm}&page=${global.pageNum || 1}&include_adult=false`);
    const {total_results, page,total_pages,results } = await response.json();

    // Remove existing header if present
    const oldHeader = document.getElementById('search-header');
    if (oldHeader) oldHeader.remove();

    const displayResult = document.createElement('div');
    displayResult.id = 'search-header';
    displayResult.style.textAlign = 'center';
    displayResult.style.margin = '2rem 0';
    displayResult.innerHTML = `<h2>${results.length} of ${total_results} results for “${searchTerm}”</h2>`;

    document.getElementById('search-results-wrapper').insertAdjacentElement('beforebegin', displayResult);

    global.totalPages = total_pages
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    results.forEach(item => {

        const isMovie = type === 'movie';
        const id = item.id;
        const title = isMovie ? item.title : item.name;
        const date = isMovie ? item.release_date : item.first_air_date;
        const imgSrc = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'images/no-image.jpg';
        const page = isMovie ? 'movie-details.html' : 'tv-details.html';
        const label = isMovie ? 'Release' : 'Aired';

        container.innerHTML += `
        <div class="card">
          <a href="${page}?id=${id}">
            <img src="${imgSrc}" class="card-img-top" alt="${title}" />
          </a>
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">
              <small class="text-muted">${label}: ${date}</small>
            </p>
          </div>
        </div>
      `;
    });
    if(global.currentPage === '/search.html'){
        updatePaginationUI()
    }
}
function renderCards(results, container, type, size) {
    results.slice(0, size).forEach(item => {
        const isMovie = type === 'movies'
        const id       = item.id
        const title    = isMovie ? item.title : item.name
        const date     = isMovie ? item.release_date : item.first_air_date
        const imgSrc   = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'images/no-image.jpg'
        const page     = isMovie ? 'movie-details.html' : 'tv-details.html'
        const label    = isMovie ? 'Release' : 'Aired'

        container.innerHTML += `
      <div class="card">
        <a href="${page}?id=${id}">
          <img src="${imgSrc}" class="card-img-top" alt="${title}" />
        </a>
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <p class="card-text">
            <small class="text-muted">${label}: ${date}</small>
          </p>
        </div>
      </div>
    `
    })
}

//show alert
function showAlert(message, className) {
    const alert = document.createElement('div');
    alert.className = `alert ${className}`;
    alert.appendChild(document.createTextNode(message));
    const container = document.querySelector('#alert');
    container.appendChild(alert)

    setTimeout(() => {
        alert.remove()
    }, 3000)
}
function setupPagination() {
    document.getElementById('next').onclick = async () => {
        global.pageNum++;
        showSpinner()
        await populateSearchResults();
        showSpinner()
    }
    document.getElementById('prev').onclick = async () => {
        global.pageNum--;
        await populateSearchResults();
    }
}

function updatePaginationUI() {
    document.querySelector('.page-counter').textContent = `Page ${global.pageNum} of ${global.totalPages}`;
    document.getElementById('prev').disabled = global.pageNum === 1;
    document.getElementById('next').disabled = global.pageNum === global.totalPages;
}


//init application
function init(){
    switch(global.currentPage){
        case '/':
            homePage();
            addSwiper()
            break;
        case '/shows.html':
            shows()
            break;
        case '/movie-details.html':
            movieDetails()
            break;
        case '/tv-details.html':
            tvShowDetails()
            break;
        case '/search.html':
            search()
            break;
    }
    highlightActiveLink()
    if(global.currentPage === '/search.html'){
    setupPagination()
    }

}
async function homePage() {
    await showSpinner();
    await populatePopular('movies')
    await showSpinner();

}
async function shows() {
    await showSpinner();
    await populatePopular('shows');
    await showSpinner();
}
async function movieDetails() {
    await showSpinner();
    await populateMovieDetails();
    await showSpinner()
}
async function tvShowDetails() {
    await showSpinner();
    await populateTvShowDetails();
    await showSpinner()
}
async function search() {
    await showSpinner();
    await populateSearchResults();
    await showSpinner()
}

init()