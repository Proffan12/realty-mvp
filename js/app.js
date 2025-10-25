// js/app.js
let listings = [];
let filtered = [];
let activeRoomFilter = 'all';

// Загрузка данных
fetch('./data/listings.json')
  .then(r => r.json())
  .then(data => {
    listings = data;
    filtered = [...data]; // создаем копию
    renderListings();
    updateResultsCount();
    updateStatistics();
  })
  .catch(error => {
    console.error('Ошибка загрузки данных:', error);
    document.getElementById('listings').innerHTML = 
      '<div class="col-12"><div class="alert alert-danger">Ошибка загрузки данных</div></div>';
  });

// Функция отрисовки объявлений
function renderListings() {
  const container = document.getElementById('listings');
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i> Объявления не найдены. Попробуйте изменить фильтры.
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map(item => `
    <div class="col-md-6 col-lg-4">
      <div class="card">
        ${item.market_diff < -5 ? '<span class="badge badge-market bg-success">Выгодно</span>' : ''}
        ${item.market_diff > 5 ? '<span class="badge badge-market bg-danger">Дорого</span>' : ''}
        <img src="${item.photos[0]}" class="card-img-top" alt="${item.title}" 
             onerror="this.src='https://via.placeholder.com/400x300/6c757d/FFFFFF?text=Нет+изображения'">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          <p class="card-text text-muted">
            <i class="bi bi-geo-alt"></i> ${item.address}
          </p>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="price-tag">${item.price.toLocaleString()} ₽</span>
            <small class="text-muted">${Math.round(item.price / item.area).toLocaleString()} ₽/м²</small>
          </div>
          <div class="d-flex justify-content-between">
            <small class="text-muted">
              <i class="bi bi-arrows-fullscreen"></i> ${item.area} м²
            </small>
            <small class="text-muted">
              <i class="bi bi-building"></i> ${item.rooms} комн.
            </small>
          </div>
          <div class="mt-2">
            <small class="${item.market_diff > 0 ? 'market-diff-positive' : 'market-diff-negative'}">
              <i class="bi ${item.market_diff > 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-left'}"></i>
              ${item.market_diff > 0 ? '+' : ''}${item.market_diff}% от рынка
            </small>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  updateResultsCount();
}

// Обновление счетчика результатов
function updateResultsCount() {
  document.getElementById('resultsCount').textContent = filtered.length;
}

// Обновление статистики
function updateStatistics() {
  document.getElementById('totalListings').textContent = listings.length;
  const goodDeals = listings.filter(item => item.market_diff < -5).length;
  document.getElementById('goodDeals').textContent = goodDeals;
}

// Фильтрация по комнатам
function setupRoomFilters() {
  const roomButtons = document.querySelectorAll('.room-btn');
  roomButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Убираем активный класс у всех кнопок
      roomButtons.forEach(b => b.classList.remove('active'));
      // Добавляем активный класс текущей кнопке
      this.classList.add('active');
      
      activeRoomFilter = this.getAttribute('data-rooms');
      applyAllFilters();
    });
  });
}

// Применение всех фильтров
function applyAllFilters() {
  filtered = [...listings];
  
  // Фильтрация по комнатам
  if (activeRoomFilter !== 'all') {
    const roomCount = parseInt(activeRoomFilter);
    if (roomCount === 4) {
      filtered = filtered.filter(item => item.rooms >= 4);
    } else {
      filtered = filtered.filter(item => item.rooms === roomCount);
    }
  }
  
  // Фильтрация по цене
  const minPrice = parseInt(document.getElementById('minPrice').value);
  const maxPrice = parseInt(document.getElementById('maxPrice').value);
  
  if (!isNaN(minPrice)) {
    filtered = filtered.filter(item => item.price >= minPrice);
  }
  if (!isNaN(maxPrice)) {
    filtered = filtered.filter(item => item.price <= maxPrice);
  }
  
  // Фильтрация по площади
  const minArea = parseInt(document.getElementById('minArea').value);
  const maxArea = parseInt(document.getElementById('maxArea').value);
  
  if (!isNaN(minArea)) {
    filtered = filtered.filter(item => item.area >= minArea);
  }
  if (!isNaN(maxArea)) {
    filtered = filtered.filter(item => item.area <= maxArea);
  }
  
  renderListings();
}

// Стандартная сортировка
document.getElementById('sortStandard').addEventListener('change', e => {
  if (e.target.value === 'default') return;
  
  if (e.target.value === 'priceAsc') filtered.sort((a,b) => a.price - b.price);
  if (e.target.value === 'priceDesc') filtered.sort((a,b) => b.price - a.price);
  if (e.target.value === 'areaAsc') filtered.sort((a,b) => a.area - b.area);
  if (e.target.value === 'areaDesc') filtered.sort((a,b) => b.area - a.area);
  
  renderListings();
});

// AI сортировка
document.getElementById('sortAI').addEventListener('change', e => {
  if (e.target.value === 'marketDiffAsc') 
    filtered.sort((a,b) => Math.abs(a.market_diff) - Math.abs(b.market_diff));
  if (e.target.value === 'marketDiffDesc') 
    filtered.sort((a,b) => Math.abs(b.market_diff) - Math.abs(a.market_diff));
  if (e.target.value === 'undermarketAsc') 
    filtered.sort((a,b) => a.market_diff - b.market_diff);
  if (e.target.value === 'undermarketDesc') 
    filtered.sort((a,b) => b.market_diff - a.market_diff);
  
  renderListings();
});

// Фильтрация по отклонению от рынка
document.getElementById('marketFilter').addEventListener('change', e => {
  if (e.target.value === 'all') filtered = [...listings];
  if (e.target.value === 'undermarket') filtered = listings.filter(a => a.market_diff < -5);
  if (e.target.value === 'overmarket') filtered = listings.filter(a => a.market_diff > 5);
  if (e.target.value === 'market') filtered = listings.filter(a => Math.abs(a.market_diff) <= 5);
  
  // Применяем также фильтры по комнатам, цене и площади
  applyAllFilters();
});

// Обработчики для полей ввода (цена и площадь)
document.getElementById('minPrice').addEventListener('input', applyAllFilters);
document.getElementById('maxPrice').addEventListener('input', applyAllFilters);
document.getElementById('minArea').addEventListener('input', applyAllFilters);
document.getElementById('maxArea').addEventListener('input', applyAllFilters);

// Инициализация фильтров по комнатам после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  setupRoomFilters();
});