class ChartComponent {
  constructor() {
    this.chartInstance = null;
  }

  componentDidMount() {
    // Create a small container div for the chart
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '200px';
    container.style.left = '10px';
    container.style.width = '200px';
    container.style.height = '150px';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    container.style.borderRadius = '8px';
    container.style.padding = '10px';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    container.style.zIndex = '1000';

    // Add container to body
    document.body.appendChild(container);

    // Create the canvas inside the container
    const chartCanvas = document.createElement('canvas');
    chartCanvas.style.width = '100%';
    chartCanvas.style.height = '100%';
    container.appendChild(chartCanvas);

    // Load Chart.js if not already loaded
    if (typeof Chart !== 'undefined') {
      this.createChart(chartCanvas);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => this.createChart(chartCanvas);
      document.head.appendChild(script);
    }
  }

  createChart(canvas) {
    const ctx = canvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Page A', 'Page B', 'Page C', 'Page D', 'Page E', 'Page F', 'Page G'],
        datasets: [
          {
            label: 'UV',
            data: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
            fill: true,
            backgroundColor: 'rgba(136, 132, 216, 0.2)',
            borderColor: 'rgba(136, 132, 216, 1)',
            borderWidth: 1
          },
          {
            label: 'PV',
            data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
            fill: true,
            backgroundColor: 'rgba(130, 202, 157, 0.2)',
            borderColor: 'rgba(130, 202, 157, 1)',
            borderWidth: 1
          },
          {
            label: 'AMT',
            data: [2400, 2210, 2290, 2000, 2181, 2500, 2100],
            fill: true,
            backgroundColor: 'rgba(255, 198, 88, 0.2)',
            borderColor: 'rgba(255, 198, 88, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 10
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 10
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  }
}