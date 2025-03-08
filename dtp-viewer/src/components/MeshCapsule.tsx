import React, { useEffect, useState, useRef } from 'react';
import CircularMenu from './CircularMenu';

interface MeshCapsuleProps {
  buildingNumber?: number;
  color?: string;
  label?: string;
  status?: 'active' | 'inactive' | 'warning';
  position?: { x: number; y: number };
  functionId?: string;
}

const MeshCapsule: React.FC<MeshCapsuleProps> = ({ 
  buildingNumber = 1, 
  color = '#10B981',
  label = 'STAT.RG',
  status = 'active',
  position = { x: 50, y: 50 },
  functionId = 'FUN_01'
}) => {
  const [rotation, setRotation] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [scanLine, setScanLine] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const circularComponentRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
const handleItemClick = (itemId: string) => {
  setSelectedItem(itemId);
  // Add any additional logic you need when an item is clicked
  // For example, you might want to handle different actions based on the selected item
};
  // Rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => (prev + 0.05) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Scan line animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Calculate pulse effect values
  const pulseScale = 1 + Math.sin(pulse * Math.PI * 2) * 0.03;
  const pulseOpacity = 0.7 + Math.sin(pulse * Math.PI * 2) * 0.3;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (circularComponentRef.current) {
      const rect = circularComponentRef.current.getBoundingClientRect();
      setMenuPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
      setMenuOpen(!menuOpen);
    }
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: `${position.y}%`,
          left: `${position.x}%`,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Function ID */}
          {/* <div
            style={{
              position: 'absolute',
              top: '-30px',
              color: '#000',
              fontSize: '10px',
              fontWeight: 'bold',
              opacity: 0.7,
            }}
          >
            {functionId}
          </div> */}
          
          {/* Label with glossy effect */}
          <div
            style={{
              backgroundColor: '#000000',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '2px',
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              marginBottom: '4px',
              zIndex: 2,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 0 10px rgba(0,0,0,0.5), 0 0 5px ${color}80`,
            }}
          >
            {/* Glossy overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0))',
              borderRadius: '2px 2px 0 0',
            }} />
            
            {/* Scan line */}
            <div style={{
              position: 'absolute',
              top: `${scanLine}%`,
              left: 0,
              width: '100%',
              height: '1px',
              backgroundColor: `${color}80`,
              opacity: 0.7,
            }} />
            
            {label}
          </div>

          {/* Status indicators with glow */}
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            marginBottom: '4px',
            alignSelf: 'flex-start',
            marginLeft: '4px',
            zIndex: 2,
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: status === 'active' ? color : '#374151',
              borderRadius: '50%',
              boxShadow: status === 'active' ? `0 0 8px ${color}` : 'none',
              opacity: pulseOpacity,
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#000000',
              borderRadius: '50%',
              border: '1px solid #333',
            }} />
          </div>

          {/* Slanted connecting line with glow */}
          <div style={{
            position: 'absolute',
            top: '26px',
            // left: '50%',
            width: '1px',
            height: '40px', // Shorter line
            background: `linear-gradient(to bottom, #000, ${color})`,
            boxShadow: `0 0 3px ${color}80`,
            zIndex: 1,
            transform: 'rotate(30deg)', // Slant the line
            transformOrigin: 'top',
          }} />

          {/* Main circular component - positioned at the end of the line */}
          <div
            ref={circularComponentRef}
            onClick={handleClick}
            style={{
              position: 'absolute',
              top: '55px',
              width: '80px',
              height: '80px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2,
              transform: `scale(${pulseScale})`,
              transition: 'transform 0.1s ease-in-out',
              cursor: 'pointer',
            }}
          >
            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              boxShadow: `0 0 15px ${color}80`,
              opacity: 0.5,
            }} />
            
            {/* Outer ring with rotation */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                border: `2px solid ${color}`,
                borderRadius: '50%',
                transform: `rotate(${rotation}deg)`,
                boxShadow: `0 0 5px ${color}`,
              }}
            >
              {/* Ring markers */}
              {[0, 90, 180, 270].map((angle) => (
                <div
                  key={angle}
                  style={{
                    position: 'absolute',
                    width: angle % 180 === 0 ? '8px' : '4px',
                    height: '2px',
                    backgroundColor: color,
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(40px)`,
                    boxShadow: `0 0 3px ${color}`,
                  }}
                />
              ))}
            </div>

            {/* Center dot with glow */}
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#000',
                borderRadius: '50%',
                position: 'relative',
                boxShadow: `0 0 8px ${color}`,
              }}
            >
              {/* Direction indicator */}
              <div
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '2px',
                  backgroundColor: color,
                  top: '50%',
                  left: '100%',
                  transform: 'translateY(-50%)',
                  boxShadow: `0 0 3px ${color}`,
                }}
              />
            </div>

            {/* Inner ring with glossy effect */}
            <div
              style={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                border: `1px solid ${color}`,
                borderRadius: '50%',
                opacity: 0.8,
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent)`,
              }}
            />
            
            {/* Additional dashed lines on sides of circle with glow */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              width: '16px',
              height: '2px',
              backgroundColor: color,
              boxShadow: `0 0 3px ${color}`,
            }} />
            <div style={{
              position: 'absolute',
              left: '-20px',
              width: '16px',
              height: '2px',
              backgroundColor: color,
              boxShadow: `0 0 3px ${color}`,
            }} />
            
            {/* Data points around the circle */}
            {[45, 135, 225, 315].map((angle) => (
              <div
                key={`data-${angle}`}
                style={{
                  position: 'absolute',
                  width: '2px',
                  height: '2px',
                  backgroundColor: color,
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(30px)`,
                  boxShadow: `0 0 2px ${color}`,
                  opacity: Math.random() > 0.5 ? 1 : 0.5, // Flickering effect
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {menuOpen && (
<CircularMenu
  isOpen={menuOpen}
  onToggle={() => setMenuOpen(!menuOpen)}
  position={menuPosition}
  selectedItem={selectedItem}  // Add this
  onItemClick={handleItemClick}  // Add this
/>
      )}
    </>
  );
};

export default MeshCapsule; 