document.addEventListener('DOMContentLoaded', () => {
  fetchInventoryData();
});

async function fetchInventoryData() {
  try {
    const response =await fetch('/api/inventory-data');
    if (!response.ok) {
      throw new Error('Failed to fetch inventory data');
    }

    const data = await response.json();
    displayInventoryData(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

function displayInventoryData(data) {
  const main = document.querySelector('main');
  data.forEach(entry => {
    const article = document.createElement('article');
    const timestamp = new Date(entry.timestamp).toLocaleString();

    article.innerHTML = `
      <h2>${timestamp}</h2>
      <table>
        <thead>
          <tr>
            <th>Price</th>
            <th>GPU</th>
            <th>ValueRatio</th>
            <th>gpuBench</th>
            <th>cpuBench</th>
          </tr>
        </thead>
        <tbody>
          ${entry.items.map(item => `
            <tr>
              <td>${item.Price}</td>
              <td>${item.GPU}</td>
              <td>${item.ValueRatio}</td>
              <td>${item.gpuBench}</td>
              <td>${item.cpuBench}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    main.appendChild(article);
  });
}
