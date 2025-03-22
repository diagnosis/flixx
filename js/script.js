const global ={
    currentPage : window.location.pathname,
    apiKey: '4e44d9029b1270a757cddc766a1bcb63',
    apiBase: 'https://api.themoviedb.org/3',
    endpoint: {
        popularMovies: '/movie/popular',
        popularShows: '/tv/popular'
    }
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
function renderCards(results, container, type, size) {
    const firstSize = results.slice(0, size);
    firstSize.forEach(({ id, name, poster_path, first_air_date }) => {
        container.innerHTML += `
      <div class="card">
        <a href="${type}-details.html?id=${id}">
          <img
            src="${poster_path
            ? `https://image.tmdb.org/t/p/w500${poster_path}`
            : 'images/no-image.jpg'}"
            class="card-img-top"
            alt="${name}"
          />
        </a>
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <p class="card-text">
            <small class="text-muted">Aired: ${first_air_date}</small>
          </p>
        </div>
      </div>
    `;
    });
}

//init application
function init(){
    console.log(global.currentPage);
    switch(global.currentPage){
        case '/':
            homePage();
            break;
        case '/shows.html':
            shows()
            break;
        case '/movie-details.html':
            console.log('movie details page')
            break;
        case '/tv-details.html':
            console.log('tv details page')
            break;
    }
    highlightActiveLink()
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

init()