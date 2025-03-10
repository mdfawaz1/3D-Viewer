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
    const [currentPage, setCurrentPage] = React.useState(1);
    const [featuredCamera, setFeaturedCamera] = React.useState('162635'); // City Hub Carpark as default
    const [cameras] = React.useState<CCTVCamera[]>([
        {
            id: '162631',
            name: 'Cluster 1 - East',
            thumbnail: '/src/assets/video245.mp4'
        },
        {
            id: '162632',
            name: 'Cluster 1 - South',
            thumbnail: '/src/assets/video246.mp4'
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
            thumbnail: '/src/assets/video247.mp4'
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

    const getFeaturedCamera = () => {
        return cameras.find(cam => cam.id === featuredCamera);
    };

    const getOtherCameras = () => {
        return cameras.filter(cam => cam.id !== featuredCamera);
    };

    const renderCameraView = (camera: CCTVCamera, isFeatured: boolean = false) => (
        <div className={`camera-item ${isFeatured ? 'featured' : ''}`}>
            <div className="camera-thumbnail">
                {camera.thumbnail.endsWith('.mp4') ? (
                    <video 
                        src={camera.thumbnail}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px'
                        }}
                    />
                ) : (
                    <img src={camera.thumbnail} alt={camera.name} />
                )}
                <div className="expand-icon">⤢</div>
            </div>
            <div className="camera-info">
                <div className="camera-name">{camera.name}</div>
                <div className="camera-id">IDT #{camera.id}</div>
            </div>
        </div>
    );

    return (
        <div className="cctv-widget">
            <div className="border-top"></div>
            <div className="border-bottom"></div>
            <div className="gradient-overlay"></div>
            <div className="left-glow"></div>
            
            <div className="cctv-header">
                <div className="cctv-title">
                    <span className="camera-icon"><img src="./src/assets/cam.png" alt="camera icon" style={{ marginBottom: '-14px' }} /></span>
                    CCTV
                </div>
                <div className="team-toggle">
                    <span style={{ opacity: isTeamView ? 1 : 0.5 }}>Team</span>
                    <div 
                        className={`toggle-switch ${isTeamView ? 'active' : ''}`}
                        onClick={handleToggle}
                    />
                    <span style={{ opacity: !isTeamView ? 1 : 0.5 }}>CCTV</span>
                </div>
            </div>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search Camera ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        fontFamily: 'sf-pro-display-medium',
                        fontSize: '12px',
                    }}
                />
            </div>

            <div className="alerted-section">
                <h3>Alerted CCTV</h3>
                {getFeaturedCamera() && renderCameraView(getFeaturedCamera()!, true)}
            </div>

            <div className="camera-row">
                {getOtherCameras().slice(0, 2).map(camera => renderCameraView(camera))}
            </div>
            <div className="camera-row">
                {getOtherCameras().slice(3, 5).map(camera => renderCameraView(camera))}
            </div>

            <div className="pagination">
                {[1, 2, 3, 10].map(page => (
                    <div 
                        key={page} 
                        className={`page-dot ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CCTVWidget; 