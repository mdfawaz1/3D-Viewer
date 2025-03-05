import React from 'react';

interface MeshCapsuleProps {
  buildingNumber?: number;
  color?: string;
  label?: string;
}

const MeshCapsule: React.FC<MeshCapsuleProps> = ({ 
  buildingNumber = 1, 
  color = '#10B981',
  label = 'Building'
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        backgroundColor: 'white',
        borderRadius: '9999px',
        boxShadow: `0 4px 6px ${color}33`,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: `1px solid ${color}`,
        animation: 'fade-in 0.3s ease-in-out',
      }}
    >
      <div
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: color,
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite',
          marginTop:'12px'
        }}
      />
      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
        {label} {buildingNumber}
      </span>
      <button
        onClick={() => console.log('Capsule clicked')}
        style={{
          marginLeft: '8px',
          color: '#9CA3AF',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          top: '2px',
        }}
      >
        <svg
          style={{ width: '16px', height: '16px' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default MeshCapsule; 