class ChartComponent {
  constructor() {
    this.chartInstance = null;
  }

  componentDidMount() {
    // Wait for DOM to be ready
    if (!document.body) {
      setTimeout(() => this.componentDidMount(), 100);
      return;
    }

    const container = document.createElement('div');
    container.className = 'chart-container';
    container.style.position = 'fixed';
    container.style.top = '210px';
    container.style.left = '10px';
    container.style.width = '200px';
    container.style.height = '200px';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    container.style.borderRadius = '8px';
    container.style.padding = '10px';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    container.style.zIndex = '1000';

    document.body.appendChild(container);

    // Initialize chart only after container is added to DOM
    if (typeof Chart !== 'undefined') {
      this.createChart(container);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => this.createChart(container);
      document.head.appendChild(script);
    }
  }

  createChart(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [{
          label: 'Sample Data',
          data: [12, 19, 3, 5, 2],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}