let listings = [];
let filtered = [];

fetch('./data/listings.json')
  .then(r => r.json())
  .then(data => {
    listings = data;
    filtered = data;
    renderListings();
  });

function renderListings() {
  const container = document.getElementById('listings');
  container.innerHTML = filtered.map(item => `
    <div class="card">
      <img src="${item.photos[0]}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>${item.address}</p>
      <p>Цена: ${item.price.toLocaleString()} ₽</p>
      <p>Отклонение от рынка: ${item.market_diff}%</p>
    </div>
  `).join('');
}

// Пример сортировки
document.getElementById('sortStandard').addEventListener('change', e => {
  if (e.target.value === 'priceAsc') filtered.sort((a,b)=>a.price-b.price);
  if (e.target.value === 'priceDesc') filtered.sort((a,b)=>b.price-a.price);
  renderListings();
});

document.getElementById('sortAI').addEventListener('change', e => {
  if (e.target.value === 'marketDiffAsc') filtered.sort((a,b)=>Math.abs(a.market_diff)-Math.abs(b.market_diff));
  if (e.target.value === 'marketDiffDesc') filtered.sort((a,b)=>Math.abs(b.market_diff)-Math.abs(a.market_diff));
  if (e.target.value === 'undermarket') filtered = listings.filter(a=>a.market_diff<0);
  if (e.target.value === 'overmarket') filtered = listings.filter(a=>a.market_diff>0);
  renderListings();
});
