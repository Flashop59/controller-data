let data = [];
let headers = [];

document.getElementById('csvFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    complete: function (results) {
      data = results.data;
      headers = results.meta.fields;
      populateTable();
      populateDropdowns();
      drawDistributionChart();
    }
  });
});

function populateTable() {
  const container = document.getElementById('tableContainer');
  let html = '<table><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';

  data.slice(0, 100).forEach(row => {
    html += '<tr>';
    headers.forEach(h => html += `<td>${row[h]}</td>`);
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function populateDropdowns() {
  const selects = ['x1', 'y1', 'y2', 'x2', 'y3', 'y4'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = headers.map(h => `<option value="${h}">${h}</option>`).join('');
    if (id === 'y2' || id === 'y4') sel.innerHTML = '<option value="">None</option>' + sel.innerHTML;
    sel.addEventListener('change', drawCharts);
  });
  drawCharts();
}

function drawCharts() {
  drawChart('chart1', 'x1', 'y1', 'y2');
  drawChart('chart2', 'x2', 'y3', 'y4');
}

function drawChart(canvasId, xId, y1Id, y2Id) {
  const xKey = document.getElementById(xId).value;
  const y1Key = document.getElementById(y1Id).value;
  const y2Key = document.getElementById(y2Id).value;

  const labels = data.map(row => parseFloat(row[xKey]));
  const y1Data = data.map(row => parseFloat(row[y1Key]));
  const y2Data = y2Key ? data.map(row => parseFloat(row[y2Key])) : null;

  const ctx = document.getElementById(canvasId).getContext('2d');
  if (window[canvasId]) window[canvasId].destroy();

  window[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: y1Key,
          data: y1Data,
          borderColor: '#00e676',
          fill: false,
        },
        y2Data && {
          label: y2Key,
          data: y2Data,
          borderColor: '#03a9f4',
          fill: false,
        }
      ].filter(Boolean)
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: xKey } },
        y: { title: { display: true, text: 'Value' } }
      }
    }
  });
}

function drawDistributionChart() {
  const counts = [0, 0, 0, 0, 0];
  data.forEach(row => {
    const val = parseFloat(row['current_in']);
    if (val <= 30) counts[0]++;
    else if (val <= 60) counts[1]++;
    else if (val <= 90) counts[2]++;
    else if (val <= 120) counts[3]++;
    else counts[4]++;
  });

  const total = counts.reduce((a, b) => a + b, 0);
  const percentages = counts.map(c => (c / total * 100).toFixed(2));

  const ctx = document.getElementById('distChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0-30', '30-60', '60-90', '90-120', '120+'],
      datasets: [{
        label: '% of Samples',
        data: percentages,
        backgroundColor: '#ff9100'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { title: { display: true, text: '%' } }
      }
    }
  });
}
