let parsedData = [];
let headers = [];

document.getElementById('csvFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    delimiter: ';',
    dynamicTyping: true,
    complete: function(results) {
      parsedData = results.data;
      headers = results.meta.fields;
      populateSelects();
      renderTable();
    }
  });
});

function populateSelects() {
  const selects = ['x1','y1','y2','x2','y3','y4'];
  selects.forEach(id => {
    const select = document.getElementById(id);
    select.innerHTML = id === 'y2' || id === 'y4' ? '<option value="">None</option>' : '';
    headers.forEach(h => {
      const option = document.createElement('option');
      option.value = h;
      option.textContent = h;
      select.appendChild(option);
    });
    select.onchange = drawCharts;
  });
  drawCharts();
}

function renderTable() {
  const container = document.getElementById('tableContainer');
  const table = document.createElement('table');
  const thead = table.createTHead();
  const row = thead.insertRow();

  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    row.appendChild(th);
  });

  const tbody = table.createTBody();
  parsedData.slice(0, 50).forEach(rowData => {
    const tr = tbody.insertRow();
    headers.forEach(h => {
      const td = tr.insertCell();
      td.textContent = rowData[h];
    });
  });

  container.innerHTML = "";
  container.appendChild(table);
}

function drawCharts() {
  drawLineChart('chart1', 'x1', 'y1', 'y2');
  drawLineChart('chart2', 'x2', 'y3', 'y4');
  drawDistribution();
}

function drawLineChart(canvasId, xSel, y1Sel, y2Sel) {
  const xKey = document.getElementById(xSel).value;
  const y1Key = document.getElementById(y1Sel).value;
  const y2Key = document.getElementById(y2Sel).value;

  if (!xKey || !y1Key) return;

  const x = parsedData.map(d => d[xKey]);
  const y1 = parsedData.map(d => d[y1Key]);
  const y2 = y2Key ? parsedData.map(d => d[y2Key]) : null;

  const ctx = document.getElementById(canvasId).getContext('2d');
  if (window[canvasId]) window[canvasId].destroy();

  window[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: x,
      datasets: [
        {
          label: y1Key,
          data: y1,
          borderColor: 'cyan',
          yAxisID: 'y',
        },
        y2 ? {
          label: y2Key,
          data: y2,
          borderColor: 'orange',
          yAxisID: 'y1',
        } : null
      ].filter(Boolean)
    },
    options: {
      responsive: true,
      scales: {
        y: { type: 'linear', position: 'left' },
        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
      }
    }
  });
}

function drawDistribution() {
  const key = "current_in";
  if (!headers.includes(key)) return;

  const bins = [0, 30, 60, 90, 120];
  const labels = ["0–30", "30–60", "60–90", "90–120", "120+"];
  const counts = [0, 0, 0, 0, 0];

  parsedData.forEach(d => {
    const val = d[key];
    if (val == null) return;
    if (val < 30) counts[0]++;
    else if (val < 60) counts[1]++;
    else if (val < 90) counts[2]++;
    else if (val < 120) counts[3]++;
    else counts[4]++;
  });

  const total = counts.reduce((a, b) => a + b, 0);
  const percentages = counts.map(c => (c / total * 100).toFixed(1));

  const ctx = document.getElementById("distChart").getContext("2d");
  if (window.distChart) window.distChart.destroy();

  window.distChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Percentage",
        data: percentages,
        backgroundColor: "#00e676",
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "%" } }
      }
    }
  });
}
