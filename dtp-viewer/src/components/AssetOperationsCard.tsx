import React from 'react';
import './AssetOperationsCard.scss';

interface AssetOperationsCardProps {
    assetCount?: number;
    openTickets?: number;
    criticalActions?: number;
    imageUrl?: string;
    description?: string;
}

const AssetOperationsCard: React.FC<AssetOperationsCardProps> = ({
    assetCount = 0,
    openTickets = 0,
    criticalActions = 0,
    imageUrl = '',
    description = ''
}) => {
    return (
        <div className="asset-operations-card">
            {/* Standard Header UI */}
            <div className="card-header">
                <div className="header-content">
                    <div className="icon-container">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h2>Asset Operations</h2>
                </div>
                <div className="header-line"></div>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
                <div className="stat-item">
                    <span className="stat-value">{assetCount}</span>
                    <span className="stat-label">Assets</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{openTickets}</span>
                    <span className="stat-label">Open Tickets</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{criticalActions}</span>
                    <span className="stat-label">Critical Actions</span>
                </div>
            </div>

            {/* Image + Description Card */}
            <div className="asset-detail-section">
                <div className="asset-image">
                    <img src={imageUrl || './src/assets/build.jpg'} alt="Asset" />
                </div>
                <div className="asset-description">
                    <p>{description}</p>
                </div>
            </div>
        </div>
    );
};

export default AssetOperationsCard; 