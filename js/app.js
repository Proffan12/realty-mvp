// js/app.js
let listings = [];
let filtered = [];
let activeRoomFilter = 'all';
let activeTypeFilter = 'all';
let currentViewMode = 'grid';

// Функция для обработки ошибок загрузки изображений
function handleImageError(img) {
  console.log('Ошибка загрузки изображения:', img.src);
  img.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
  img.alt = 'Изображение не загружено';
}

// Загрузка данных
fetch('./data/listings.json')
  .then(r => {
    if (!r.ok) throw new Error('Ошибка сети');
    return r.json();
  })
  .then(data => {
    listings = data;
    filtered = [...data];
    renderListings();
    updateResultsCount();
    updateStatistics();
    
    // Добавляем обработчики ошибок для изображений после рендера
    setTimeout(() => {
      document.querySelectorAll('.card-img-top').forEach(img => {
        img.addEventListener('error', () => handleImageError(img));
      });
    }, 100);
  })
  .catch(error => {
    console.error('Ошибка загрузки данных:', error);
    document.getElementById('listings').innerHTML = 
      '<div class="col-12"><div class="alert alert-danger">Ошибка загрузки данных. Проверьте подключение к интернету.</div></div>';
  });

// Функция отрисовки объявлений
function renderListings() {
  const container = document.getElementById('listings');
  
  if (currentViewMode === 'list') {
    container.classList.add('list-view');
  } else {
    container.classList.remove('list-view');
  }
  
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
  
  container.innerHTML = filtered.map(item => {
    const imageUrl = item.photos[0];
    
    if (currentViewMode === 'list') {
      return `
        <div class="col-md-6 col-lg-12">
          <div class="card">
            ${item.market_diff < -5 ? '<span class="badge badge-market bg-success">Выгодно</span>' : ''}
            ${item.market_diff > 5 ? '<span class="badge badge-market bg-danger">Дорого</span>' : ''}
            <img src="${imageUrl}" class="card-img-top" alt="${item.title}" 
                 onerror="handleImageError(this)">
            <div class="card-body">
              <div class="row">
                <div class="col-md-8">
                  <h5 class="card-title">${item.title}</h5>
                  <p class="card-text text-muted">
                    <i class="bi bi-geo-alt"></i> ${item.address}
                  </p>
                  <div class="d-flex justify-content-between mb-2">
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
                    <small class="text-muted">
                      <i class="bi bi-house"></i> ${getTypeText(item.type)}
                    </small>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="mt-2">
                    <span class="${item.market_diff > 0 ? 'market-diff-positive' : 'market-diff-negative'} fs-5">
                      <i class="bi ${item.market_diff > 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-left'}"></i>
                      ${item.market_diff > 0 ? '+' : ''}${item.market_diff}% от рынка
                    </span>
                  </div>
                  <button class="btn btn-outline-primary mt-3">
                    <i class="bi bi-heart"></i> В избранное
                  </button>
                  <button class="btn btn-primary mt-2">
                    <i class="bi bi-telephone"></i> Позвонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="col-md-6 col-lg-4">
          <div class="card">
            ${item.market_diff < -5 ? '<span class="badge badge-market bg-success">Выгодно</span>' : ''}
            ${item.market_diff > 5 ? '<span class="badge badge-market bg-danger">Дорого</span>' : ''}
            <img src="${imageUrl}" class="card-img-top" alt="${item.title}" 
                 onerror="handleImageError(this)">
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
                <small class="text-muted">
                  <i class="bi bi-house"></i> ${getTypeText(item.type)}
                </small>
              </div>
              <div class="mt-2">
                <small class="${item.market_diff > 0 ? 'market-diff-positive' : 'market-diff-negative'}">
                  <i class="bi ${item.market_diff > 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-left'}"></i>
                  ${item.market_diff > 0 ? '+' : ''}${item.market_diff}% от рынка
                </small>
              </div>
            </div>
            <div class="card-footer bg-white border-0 pt-0">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-heart"></i> В избранное
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }).join('');
  
  updateResultsCount();
}

// Остальной код остается таким же...
function getTypeText(type) {
  const typeMap = {
    'apartment': 'Квартира',
    'house': 'Дом',
    'new': 'Новостройка'
  };
  return typeMap[type] || type;
}

function updateResultsCount() {
  document.getElementById('resultsCount').textContent = filtered.length;
}

function updateStatistics() {
  document.getElementById('totalListings').textContent = listings.length;
  const goodDeals = listings.filter(item => item.market_diff < -5).length;
  document.getElementById('goodDeals').textContent = goodDeals;
}

// Настройка фильтров по комнатам
function setupRoomFilters() {
  const roomButtons = document.querySelectorAll('.room-btn');
  roomButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      roomButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      activeRoomFilter = this.getAttribute('data-rooms');
      applyAllFilters();
    });
  });
}

// Настройка фильтров по типу недвижимости
function setupTypeFilters() {
  const typeButtons = document.querySelectorAll('.type-btn');
  typeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      typeButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      activeTypeFilter = this.getAttribute('data-type');
      applyAllFilters();
    });
  });
}

// Настройка переключения видов
function setupViewMode() {
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(btn => {
    btn.addEventListener('change', function() {
      if (this.id === 'gridView' && this.checked) {
        currentViewMode = 'grid';
      } else if (this.id === 'listView' && this.checked) {
        currentViewMode = 'list';
      }
      renderListings();
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
  
  // Фильтрация по типу недвижимости
  if (activeTypeFilter !== 'all') {
    filtered = filtered.filter(item => item.type === activeTypeFilter);
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

// Обработчики для кнопок применения фильтров
document.getElementById('applyFilters').addEventListener('click', applyAllFilters);
document.getElementById('applyAIFilters').addEventListener('click', applyAllFilters);

// Обработчики для полей ввода (цена и площадь)
document.getElementById('minPrice').addEventListener('input', applyAllFilters);
document.getElementById('maxPrice').addEventListener('input', applyAllFilters);
document.getElementById('minArea').addEventListener('input', applyAllFilters);
document.getElementById('maxArea').addEventListener('input', applyAllFilters);

// Кнопка "Еще фильтры" (пока не функциональна)
document.getElementById('btnMoreFilters').addEventListener('click', function() {
  alert('Функция "Еще фильтры" в разработке');
});

// Инициализация фильтров после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  setupRoomFilters();
  setupTypeFilters();
  setupViewMode();
});