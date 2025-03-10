import * as React from 'react';
import './CircularMenu.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFireExtinguisher,
    faFan,
    faCogs,
    faCubes,
    faDesktop
} from '@fortawesome/free-solid-svg-icons';

interface CircularMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  position: { x: number; y: number };
  selectedItem: string | null;
  onItemClick: (itemId: string) => void;
}

const CircularMenu: React.FC<CircularMenuProps> = ({ isOpen, onToggle, position, selectedItem, onItemClick }) => {
  
  const handleClick = (itemId: string, url?: string) => {
    if (url) {
      window.location.href = url;
    } else {
      onItemClick(itemId);
    }
  };

  return (
    <div
      className="menu-container"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <nav className="menu">
        <input
          type="checkbox"
          className="menu-open"
          name="menu-open"
          id="menu-open"
          checked={isOpen}
          onChange={onToggle}
        />
        <label className="menu-open-button" htmlFor="menu-open">
          <span className="lines line-1"></span>
          <span className="lines line-2"></span>
          <span className="lines line-3"></span>
        </label>
        
        <a href="#" className={`menu-item item-1 ${selectedItem === 'fire-safety' ? 'selected' : ''}`} 
           onClick={(e) => { e.preventDefault(); handleClick('fire-safety'); }}>
          <FontAwesomeIcon icon={faFireExtinguisher} />
        </a>
        <a href="#" className={`menu-item item-2 ${selectedItem === 'acmv' ? 'selected' : ''}`}
           onClick={(e) => { e.preventDefault(); handleClick('acmv'); }}>
          <FontAwesomeIcon icon={faFan} />
        </a>
        <a href="#" className={`menu-item item-3 ${selectedItem === 'operations' ? 'selected' : ''}`}
           onClick={(e) => { e.preventDefault(); handleClick('operations'); }}>
          <FontAwesomeIcon icon={faCogs} />
        </a>
        <a href="#" className={`menu-item item-4 ${selectedItem === 'smart-bim' ? 'selected' : ''}`}
           onClick={(e) => { e.preventDefault(); handleClick('smart-bim', 'https://b4.smartbim.ivivacloud.com/Apps/smartbim/home?view=Airport%20Gate%20D5'); }}>
          <FontAwesomeIcon icon={faCubes} />
        </a>
        <a href="#" className={`menu-item item-5 ${selectedItem === 'gui' ? 'selected' : ''}`}
           onClick={(e) => { e.preventDefault(); handleClick('gui'); }}>
          <FontAwesomeIcon icon={faDesktop} />
        </a>
        <a href="#" className={`menu-item item-6 ${selectedItem === 'gui' ? 'selected' : ''}`}
           onClick={(e) => { e.preventDefault(); handleClick('gui'); }}>
          <FontAwesomeIcon icon={faDesktop} />
        </a>
      </nav>
    </div>
  );
};

export default CircularMenu;