// js/app.js
let listings = [];
let filtered = [];

// Загрузка данных
fetch('./data/listings.json')
  .then(r => r.json())
  .then(data => {
    listings = data;
    filtered = data;
    renderListings();
    updateResultsCount();
  });

// Функция отрисовки объявлений
function renderListings() {
  const container = document.getElementById('listings');
  container.innerHTML = filtered.map(item => `
    <div class="col-md-6 col-lg-4">
      <div class="card">
        ${item.market_diff < -5 ? '<span class="badge badge-market bg-success">Выгодно</span>' : ''}
        ${item.market_diff > 5 ? '<span class="badge badge-market bg-danger">Дорого</span>' : ''}
        <img src="${item.photos[0]}" class="card-img-top" alt="${item.title}">
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
        <div class="card-footer bg-white border-0 pt-0">
          <div class="d-grid gap-2">
            <button class="btn btn-outline-primary btn-sm">
              <i class="bi bi-heart"></i> В избранное
            </button>
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

// Стандартная сортировка
document.getElementById('sortStandard').addEventListener('change', e => {
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
  if (e.target.value === 'bestValue') 
    filtered.sort((a,b) => Math.abs(a.market_diff) - Math.abs(b.market_diff));
  renderListings();
});

// Показать/скрыть кастомный диапазон отклонения
document.getElementById('marketFilter').addEventListener('change', e => {
  const customRange = document.getElementById('customRange');
  customRange.style.display = e.target.value === 'custom' ? 'block' : 'none';
  
  // Применение фильтров
  if (e.target.value === 'all') filtered = listings;
  if (e.target.value === 'undermarket') filtered = listings.filter(a => a.market_diff < -5);
  if (e.target.value === 'overmarket') filtered = listings.filter(a => a.market_diff > 5);
  if (e.target.value === 'market') filtered = listings.filter(a => Math.abs(a.market_diff) <= 5);
  
  renderListings();
});

// Инициализация кастомного диапазона
document.getElementById('minDiff')?.addEventListener('change', applyCustomRange);
document.getElementById('maxDiff')?.addEventListener('change', applyCustomRange);

function applyCustomRange() {
  const min = parseInt(document.getElementById('minDiff').value) || -100;
  const max = parseInt(document.getElementById('maxDiff').value) || 100;
  
  filtered = listings.filter(a => a.market_diff >= min && a.market_diff <= max);
  renderListings();
}