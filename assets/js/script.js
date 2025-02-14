// Configuración de la API y paginación
const API_CONFIG = {
    url: 'https://imdb8.p.rapidapi.com/auto-complete?q=spiderman',
    options: {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'f6af5477c0msh4567f9868946092p107311jsnc6c70c226bfc',
            'x-rapidapi-host': 'imdb8.p.rapidapi.com'
        }
    }
};

const ITEMS_PER_PAGE = 4;
let currentPage = 1;
let allMovies = [];
let filteredMovies = [];

// Función para obtener datos de la API
async function fetchMovies() {
    try {
        const response = await fetch(API_CONFIG.url, API_CONFIG.options);
        const data = await response.json();
        
        return data.d.map(item => ({
            id: item.id,
            title: item.l,
            protagonists: item.s || "No disponible",
            year: item.y || "No disponible",
            image: item.i?.imageUrl || "https://via.placeholder.com/150",
            type: item.q || "Desconocido",
            rank: item.rank || 999999,
            duration: item.yr || "No disponible",
            // Agregamos más información para el modal
            description: `Una película de Spider-Man protagonizada por ${item.s || "No disponible"}`,
            rating: item.rank ? `${item.rank}/10` : "No disponible"
        }));
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        throw error;
    }
}

// Función para mostrar el modal con la información de la película
function showMovieModal(movie) {
    const modalElement = document.getElementById('movieModal');
    if (!modalElement) return;

    // Obtener referencias a los elementos del modal
    const modalTitle = document.getElementById('modalTitle');
    const modalPoster = document.getElementById('modalPoster');
    const modalDescription = document.getElementById('modalDescription');
    const modalDirector = document.getElementById('modalDirector');
    const modalDuration = document.getElementById('modalDuration');
    const modalRating = document.getElementById('modalRating');

    // Actualizar el contenido del modal
    if (modalTitle) modalTitle.textContent = movie.title;
    if (modalPoster) {
        modalPoster.src = movie.image;
        modalPoster.alt = `Poster de ${movie.title}`;
    }
    if (modalDescription) modalDescription.textContent = movie.description;
    if (modalDirector) modalDirector.textContent = movie.director;
    if (modalDuration) modalDuration.textContent = movie.duration;
    if (modalRating) modalRating.textContent = movie.rating;

    // Mostrar el modal usando Bootstrap
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}
$(document).ready(function() {
    // Inicializar Select2
    $('#sortSelect').select2({
        width: '100%', // Ancho completo
        placeholder: 'Ordenar por...', // Texto de placeholder
        allowClear: true, // Permite borrar la selección
        dropdownCssClass: 'rounded-menu', // Clase CSS personalizada para el menú
        minimumResultsForSearch: Infinity, // Desactiva la barra de búsqueda
    });

    // Vincular el evento de cambio al select
    $('#sortSelect').on('change', function() {
        const selectedValue = $(this).val(); // Obtener el valor seleccionado
        if (selectedValue) {
            sortMovies(selectedValue); // Llamar a la función de ordenamiento
        }
    });
});

// Función para ordenar películas
function sortMovies(sortType) {
    const scrollPosition = window.scrollY; // Guardar la posición actual del scroll

    switch (sortType) {
        case 'rank-asc':
            filteredMovies.sort((a, b) => a.rank - b.rank);
            break;
        case 'rank-desc':
            filteredMovies.sort((a, b) => b.rank - a.rank);
            break;
        case 'title-asc':
            filteredMovies.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
            break;
        case 'title-desc':
            filteredMovies.sort((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()));
            break;
        case 'year-newest':
            filteredMovies.sort((a, b) => {
                const yearA = a.year === "No disponible" ? 0 : parseInt(a.year);
                const yearB = b.year === "No disponible" ? 0 : parseInt(b.year);
                return yearB - yearA;
            });
            break;
        case 'year-oldest':
            filteredMovies.sort((a, b) => {
                const yearA = a.year === "No disponible" ? 0 : parseInt(a.year);
                const yearB = b.year === "No disponible" ? 0 : parseInt(b.year);
                return yearA - yearB;
            });
            break;
    }

    currentPage = 1; // Reiniciar la paginación
    displayMoviesWithPagination(); // Mostrar las películas ordenadas

    // Restaurar la posición del scroll
    window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
    });
}
// Función para mostrar las películas con paginación
function displayMoviesWithPagination() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const moviesToShow = filteredMovies.slice(startIndex, endIndex);
    
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    
    const scrollPosition = window.scrollY;
    
    gallery.innerHTML = '';

    if (filteredMovies.length === 0) {
        gallery.innerHTML = `
            <div class="col-12 text-center">
                <p class="no-results">No se encontraron resultados para tu búsqueda.</p>
            </div>
        `;
        return;
    }

    // Modifica esta parte en la función displayMoviesWithPagination
moviesToShow.forEach(movie => {
    const movieCard = `
        <div class="col-md-3 col-sm-6 movie-wrapper" data-movie-id="${movie.id}">
            <img src="${movie.image}" 
                 class="movie-poster" 
                 alt="${movie.title}" 
                 onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'"
                 style="cursor: pointer;">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-year">${movie.year}</div>
            </div>
        </div>
    `;
    gallery.innerHTML += movieCard;
});

// Y actualiza los event listeners para que funcionen con la nueva estructura
const movieWrappers = document.querySelectorAll('.movie-wrapper');
movieWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => {
        const movieId = wrapper.getAttribute('data-movie-id');
        const movie = filteredMovies.find(m => m.id === movieId);
        if (movie) {
            showMovieModal(movie);
        }
    });
});

    // Restaurar la posición del scroll
    window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
    });

    updatePaginationControls();
}

// Función para actualizar los controles de paginación
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    let paginationHTML = `
        <nav aria-label="Navegación de páginas">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Anterior">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Siguiente">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    `;

    paginationContainer.innerHTML = paginationHTML;
    setupPaginationListeners();
}

// Configurar event listeners para la paginación
function setupPaginationListeners() {
    const paginationLinks = document.querySelectorAll('.page-link');
    paginationLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(e.target.closest('.page-link').dataset.page);
            if (!isNaN(newPage) && newPage !== currentPage && newPage > 0) {
                currentPage = newPage;
                displayMoviesWithPagination();
            }
        });
    });
}

// Función para configurar la búsqueda
function setupSearchListeners() {
    const searchBar = document.getElementById('searchBar');
    const searchButton = document.querySelector('.btn-search');

    function performSearch() {
        const searchTerm = searchBar.value.toLowerCase();
        filteredMovies = allMovies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.protagonists.toLowerCase().includes(searchTerm)
        );
        
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect && sortSelect.value) {
            sortMovies(sortSelect.value);
        }
        
        currentPage = 1;
        displayMoviesWithPagination();
    }

    if (searchBar) {
        searchBar.addEventListener('input', performSearch);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
}

// Función para configurar todos los event listeners
function setupEventListeners() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => sortMovies(e.target.value));
    }

    setupSearchListeners();
}

// Función para inicializar la galería
async function initializeGallery() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    
    try {
        if (loadingElement) loadingElement.classList.remove('d-none');
        if (errorElement) errorElement.classList.add('d-none');

        allMovies = await fetchMovies();
        filteredMovies = [...allMovies];
        
        displayMoviesWithPagination();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing gallery:', error);
        if (errorElement) errorElement.classList.remove('d-none');
    } finally {
        if (loadingElement) loadingElement.classList.add('d-none');
    }
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const icon = darkModeToggle.querySelector('i');
  
    body.classList.toggle('dark-mode');
    
    
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');

        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      
        localStorage.setItem('darkMode', 'disabled');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#darkModeToggle i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    if (!mainContainer.getAttribute('data-theme')) {
        // Establecer el modo oscuro por defecto
        mainContainer.setAttribute('data-theme', 'dark');
    }
    initializeGallery();  // Asegúrate de que esta función exista si es necesario
});
