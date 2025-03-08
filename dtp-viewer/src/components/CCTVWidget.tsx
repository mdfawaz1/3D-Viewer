import React from 'react';
import './CCTVWidget.scss';

interface CCTVCamera {
    id: string;
    name: string;
    thumbnail: string;
}

const CCTVWidget: React.FC = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isTeamView, setIsTeamView] = React.useState(false);
    const [cameras] = React.useState<CCTVCamera[]>([
        {
            id: '162631',
            name: 'Cluster 1 - East',
            thumbnail: '/src/assets/adh.jpeg'
        },
        {
            id: '162632',
            name: 'Cluster 1 - South',
            thumbnail: '/src/assets/fhf.jpg'
        },
        {
            id: '162633',
            name: 'Cluster 1 - West',
            thumbnail: '/src/assets/jf.jpeg'
        },
        {
            id: '162634',
            name: 'Cluster 1 - North',
            thumbnail: '/src/assets/jfg.jpeg'
        },
        {
            id: '162635',
            name: 'City Hub Carpark',
            thumbnail: '/src/assets/adh.jpeg'
        },
        {
            id: '162636',
            name: 'City Hub Entrance',
            thumbnail: '/src/assets/adh.jpeg'
        }
    ]);

    const filteredCameras = cameras.filter(camera =>
        camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.id.includes(searchQuery)
    );

    const handleToggle = () => {
        setIsTeamView(!isTeamView);
    };

    return (
        <div className="cctv-widget">
            <div className="border-top"></div>
            <div className="border-bottom"></div>
            <div className="gradient-overlay"></div>
            <div className="left-glow"></div>
            
            <div className="cctv-header">
                <div className="cctv-title">
                    <span className="camera-icon">🎥</span>
                    CCTV
                </div>
                <div className="team-toggle">
                    Team 
                    <div 
                        className={`toggle-switch ${isTeamView ? 'active' : ''}`}
                        onClick={handleToggle}
                    />
                    CCTV
                </div>
            </div>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by camera ID or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="camera-grid">
                {filteredCameras.map(camera => (
                    <div key={camera.id} className="camera-item">
                        <div className="camera-thumbnail">
                            <img src={camera.thumbnail} alt={camera.name} />
                            <div className="expand-icon">⤢</div>
                        </div>
                        <div className="camera-info">
                            <div className="camera-name">{camera.name}</div>
                            <div className="camera-id">IDT #{camera.id}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CCTVWidget; 