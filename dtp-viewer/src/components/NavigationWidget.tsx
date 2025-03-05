import * as React from 'react';
import './NavigationWidget.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFireExtinguisher,
    faFan,
    faCogs,
    faCubes,
    faDesktop
} from '@fortawesome/free-solid-svg-icons';

interface NavigationItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    url?: string;  // Add URL property
}

const navigationItems: NavigationItem[] = [
    {
        id: 'fire-safety',
        icon: <FontAwesomeIcon icon={faFireExtinguisher} />,
        label: 'Fire and Safety'
    },
    {
        id: 'acmv',
        icon: <FontAwesomeIcon icon={faFan} />,
        label: 'ACMV'
    },
    {
        id: 'operations',
        icon: <FontAwesomeIcon icon={faCogs} />,
        label: 'Operations'
    },
    {
        id: 'smart-bim',
        icon: <FontAwesomeIcon icon={faCubes} />,
        label: 'Smart BIM',
        url: 'https://demo.iviva.cloud/Apps/smartbim/home'
    },
    {
        id: 'gui',
        icon: <FontAwesomeIcon icon={faDesktop} />,
        label: 'GUI'
    }
];

interface NavigationWidgetProps {
    onItemClick: (itemId: string) => void;
    selectedItem: string | null;
    selectedBuilding: string | null;
}

const NavigationWidget: React.FC<NavigationWidgetProps> = ({ onItemClick, selectedItem, selectedBuilding }) => {
    if (!selectedBuilding) return null;

    const handleClick = (item: NavigationItem) => {
        if (item.url) {
            window.open(item.url, '_blank');
        } else {
            onItemClick(item.id);
        }
    };

    return (
        <div className="navigation-widget">
            {navigationItems.map((item) => (
                <div
                    key={item.id}
                    className={`navigation-item ${selectedItem === item.id ? 'selected' : ''}`}
                    onClick={() => handleClick(item)}
                >
                    <div className="icon-container">
                        {item.icon}
                    </div>
                    <span className="label">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default NavigationWidget; 