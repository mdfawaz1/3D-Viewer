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
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${color}`,
        animation: 'fade-in 0.3s ease-in-out',
        overflow: 'hidden',
      }}
    >
      {/* Color section with icon */}
      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            backgroundColor: color,
            borderRadius: '50%',
            filter: 'blur(8px)',
            opacity: 0.6,
          }}
        />
        <svg
          style={{ 
            width: '20px', 
            height: '20px', 
            color: color,
            position: 'relative',
            zIndex: 1
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m4 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4"
          />
        </svg>
      </div>

      {/* Name section */}
      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
          {label} {buildingNumber}
        </span>
        <button
          onClick={() => console.log('Capsule clicked')}
          style={{
            color: '#9CA3AF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
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
    </div>
  );
};

export default MeshCapsule; 