import * as React from 'react';
import './BottomNavbar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faShield,
  faBell,
  faFire,
  faLightbulb,
  faTemperatureHalf,
  faBolt,
  faWrench,
  faCamera,
  faKey,
  faVideo,
  faUserSecret,
  faExclamationTriangle,
  faUserNinja,
  faGears,
  faCircleInfo,
  faFireExtinguisher,
  faDroplet,
  faPersonRunning,
  faDoorOpen,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface NavItem {
  label: string;
  items: Array<{
    label: string;
    icon: IconDefinition;
  }>;
  icon: IconDefinition;
}

interface SelectedItem {
  main: string;
  sub: string;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    items: [
      { label: 'Lighting', icon: faLightbulb },
      { label: 'HVAC', icon: faTemperatureHalf },
      { label: 'Energy', icon: faBolt },
      { label: 'Maintenance', icon: faWrench }
    ],
    icon: faHome
  },
  {
    label: 'Security',
    items: [
      { label: 'Cameras', icon: faCamera },
      { label: 'Access Control', icon: faKey },
      { label: 'Surveillance', icon: faVideo },
      { label: 'Guards', icon: faUserSecret }
    ],
    icon: faShield
  },
  {
    label: 'Alarms',
    items: [
      { label: 'Emergency', icon: faExclamationTriangle },
      { label: 'Intrusion', icon: faUserNinja },
      { label: 'Technical', icon: faGears },
      { label: 'System Status', icon: faCircleInfo }
    ],
    icon: faBell
  },
  {
    label: 'Fire',
    items: [
      { label: 'Detectors', icon: faFireExtinguisher },
      { label: 'Sprinklers', icon: faDroplet },
      { label: 'Evacuation', icon: faPersonRunning },
      { label: 'Fire Exits', icon: faDoorOpen }
    ],
    icon: faFire
  }
];

const BottomNavbar: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<SelectedItem | null>(null);
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
    }, 100);
  };

  const handleSubItemClick = (mainItem: string, subItem: string) => {
    setSelectedItem({ main: mainItem, sub: subItem });
    setActiveDropdown(null);
  };

  const handleMainIconClick = (mainItem: string) => {
    if (selectedItem?.main === mainItem) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="bottom-navbar">
      {navItems.map((item) => (
        <div 
          key={item.label} 
          className={`nav-item ${selectedItem?.main === item.label ? 'selected' : ''}`}
          onMouseEnter={() => handleMouseEnter(item.label)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="nav-label">
            <span className="nav-icon" onClick={() => handleMainIconClick(item.label)} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={item.icon} size="lg" />
            </span>
            {selectedItem?.main === item.label ? (
              <>
                <FontAwesomeIcon icon={faChevronRight} className="flow-arrow" />
                <FontAwesomeIcon icon={item.items.find(subItem => subItem.label === selectedItem.sub)?.icon || item.icon} className="submenu-icon" />
                {selectedItem.sub}
              </>
            ) : (
              item.label
            )}
          </span>
          {activeDropdown === item.label && (
            <div 
              className="dropdown-menu"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              {item.items.map((subItem) => (
                <div 
                  key={subItem.label} 
                  className="dropdown-item"
                  onClick={() => handleSubItemClick(item.label, subItem.label)}
                >
                  <FontAwesomeIcon icon={subItem.icon} className="submenu-icon" />
                  {subItem.label}
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