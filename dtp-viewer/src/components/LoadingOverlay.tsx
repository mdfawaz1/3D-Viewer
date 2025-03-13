import * as React from 'react';

const LoadingOverlay: React.FC = () => {
    const [progress, setProgress] = React.useState(0);
    const [coordinates, setCoordinates] = React.useState({ x: 0, y: 0, z: 0 });

    React.useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev >= 100 ? 0 : prev + 4;
                setCoordinates({
                    x: Math.floor(Math.sin(newProgress * 0.1) * 1000),
                    y: Math.floor(Math.cos(newProgress * 0.1) * 1000),
                    z: Math.floor(Math.tan(newProgress * 0.05) * 500),
                });
                return newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-overlay">
            <div className="loading-hud">
                <div className="hud-top">
                    <div className="hud-corner top-left">
                        <div className="corner-bracket"></div>
                        <div className="corner-content">
                            <div className="corner-text">HUMAN CRTCTRM - 57</div>
                            <div className="corner-subtext">LOADING REF: 0x{Math.floor(progress * 2.55).toString(16).padStart(2, '0')}</div>
                        </div>
                    </div>
                    <div className="hud-center">
                        <div className="center-bracket left"></div>
                        <div className="center-content">
                            <div className="center-line"></div>
                            <div className="loading-status">
                                <div className="status-text">INITIALIZING MODEL TRANSFER</div>
                                <div className="coordinates">
                                    <span>X: {coordinates.x}</span>
                                    <span>Y: {coordinates.y}</span>
                                    <span>Z: {coordinates.z}</span>
                                </div>
                            </div>
                        </div>
                        <div className="center-bracket right"></div>
                    </div>
                    <div className="hud-corner top-right">
                        <div className="corner-bracket"></div>
                        <div className="corner-content">
                            <div className="corner-text">XD-1</div>
                            <div className="corner-subtext">U-3</div>
                        </div>
                    </div>
                </div>

                <div className="hud-center-content">
                    <div className="scanning-container">
                        <div className="scanning-grid">
                            <div className="grid-background"></div>
                            <div className="grid-lines horizontal"></div>
                            <div className="grid-lines vertical"></div>
                            <div className="scan-circle"></div>
                            <div className="scan-line"></div>
                            <div className="target-marks">
                                <div className="target top"></div>
                                <div className="target right"></div>
                                <div className="target bottom"></div>
                                <div className="target left"></div>
                            </div>
                        </div>
                        <div className="scan-data">
                            <div className="data-line">SCANNING VERTEX DATA</div>
                            <div className="data-line">BUFFER: {(progress * 1024).toFixed(0)} KB</div>
                            <div className="data-line">STATUS: ACTIVE</div>
                        </div>
                    </div>
                    <div className="progress-container">
                        <div className="progress-track">
                            <div className="progress-fill" style={{ 
                                width: `${Math.min(progress, 100)}%`,
                                transition: 'width 30ms linear'
                            }}>
                                <div className="progress-glow"></div>
                            </div>
                            <div className="progress-markers">
                                {[0, 25, 50, 75, 100].map(mark => (
                                    <div key={mark} className="marker" style={{ left: `${mark}%` }}>
                                        <div className="marker-line"></div>
                                        <div className="marker-text">{mark}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="progress-text">
                            <span className="label">LOADING PROGRESS:</span>
                            <span className="value">{Math.min(Math.floor(progress), 100).toString().padStart(2, '0')}%</span>
                        </div>
                    </div>
                </div>

                <div className="hud-bottom">
                    <div className="system-info">
                        <div className="info-section">
                            <div className="info-header">SYSTEM STATUS</div>
                            <div className="info-line">MEMORY ALLOCATION: ACTIVE</div>
                            <div className="info-line">RENDER ENGINE: INITIALIZING</div>
                            <div className="info-line">BUFFER STATUS: STREAMING</div>
                        </div>
                        <div className="info-section">
                            <div className="info-header">PROCESS LOG</div>
                            <div className="info-line">{'>>'} Vertex buffer initialized</div>
                            <div className="info-line">{'>>'} Material cache ready</div>
                            <div className="info-line">{'>>'} Awaiting geometry data</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay; 