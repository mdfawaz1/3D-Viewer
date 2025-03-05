import * as React from 'react';
import './BottomNavbar.scss';

interface NavItem {
  label: string;
  items: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Security',
    items: ['Cameras', 'Access Control', 'Surveillance', 'Guards']
  },
  {
    label: 'Home',
    items: ['Lighting', 'HVAC', 'Energy', 'Maintenance']
  },
  {
    label: 'Alarms',
    items: ['Emergency', 'Intrusion', 'Technical', 'System Status']
  },
  {
    label: 'Fire',
    items: ['Detectors', 'Sprinklers', 'Evacuation', 'Fire Exits']
  }
];

const BottomNavbar: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100); // Small delay before closing
  };

  return (
    <div className="bottom-navbar">
      {navItems.map((item) => (
        <div 
          key={item.label} 
          className="nav-item"
          onMouseEnter={() => handleMouseEnter(item.label)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="nav-label">{item.label}</span>
          {activeDropdown === item.label && (
            <div 
              className="dropdown-menu"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              {item.items.map((subItem) => (
                <div 
                  key={subItem} 
                  className="dropdown-item"
                  onClick={() => {
                    console.log(`Clicked: ${subItem}`);
                    // Add your click handler here
                  }}
                >
                  {subItem}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BottomNavbar; 