'use strict';

const e = React.createElement;

let buildingCount = 0;

class CapsuleComponent extends React.Component {
  constructor(props) {
    super(props);
    this.buildingNumber = ++buildingCount;
    this.state = { active: false };
  }

  render() {
    return e(
      'div',
      {
        style: {
          position: 'fixed',
          backgroundColor: 'white',
          borderRadius: '9999px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #10B981',
          animation: 'fade-in 0.3s ease-in-out',
        },
      },
      e('div', {
        style: {
          width: '12px',
          height: '12px',
          backgroundColor: '#10B981',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite',
        },
      }),
      e(
        'span',
        { style: { fontSize: '14px', fontWeight: '500', color: '#374151' } },
        `Building ${this.buildingNumber}`
      ),
      e(
        'button',
        {
          onClick: () => console.log('Capsule clicked'),
          style: {
            marginLeft: '8px',
            color: '#9CA3AF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            top: '2px',
          },
        },
        e(
          'svg',
          {
            style: { width: '16px', height: '16px' },
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
          },
          e('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          })
        )
      )
    );
  }
}

// Find all DOM containers, and render Capsule components into them.
document.querySelectorAll('.capsule_component_container')
  .forEach(domContainer => {
    const root = ReactDOM.createRoot(domContainer);
    root.render(
      e(CapsuleComponent, {})
    );
  });