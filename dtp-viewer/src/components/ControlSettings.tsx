import React, { useState, useEffect } from 'react';
import * as BABYLON from 'babylonjs';
import './ControlSettings.scss';

interface ControlSettingsProps {
    scene: BABYLON.Scene | null;
    currentCamera: BABYLON.ArcRotateCamera | BABYLON.UniversalCamera | null;
    setCurrentCamera: (camera: BABYLON.ArcRotateCamera | BABYLON.UniversalCamera | null) => void;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    loadedMeshes: BABYLON.AbstractMesh[];
    onCameraLimitsChange?: (limits: {
        yawMin: number;
        yawMax: number;
        pitchMin: number;
        pitchMax: number;
        zoomMin: number;
        zoomMax: number;
    }) => void;
}

const ControlSettings: React.FC<ControlSettingsProps> = ({
    scene,
    currentCamera,
    setCurrentCamera,
    canvasRef,
    loadedMeshes,
    onCameraLimitsChange
}) => {
    const [sensitivity, setSensitivity] = useState(1);
    const [zoomSpeed, setZoomSpeed] = useState(1);
    const [fppMovementSpeed, setFppMovementSpeed] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const [moveInterval, setMoveInterval] = useState<NodeJS.Timeout | null>(null);
    const [yawLimits, setYawLimits] = useState({ min: -2 * Math.PI, max: 2 * Math.PI });
    const [pitchLimits, setPitchLimits] = useState({ min: 0, max: Math.PI });
    const [zoomLimits, setZoomLimits] = useState({ min: 1, max: 2000 });
    const [showCameraLimits, setShowCameraLimits] = useState(false);
    const [isAutoRotating, setIsAutoRotating] = useState(false);
    const [autoRotateSpeed, setAutoRotateSpeed] = useState(1);
    const [autoRotateInterval, setAutoRotateInterval] = useState<NodeJS.Timeout | null>(null);

    const calculateModelBounds = (meshes: BABYLON.AbstractMesh[]) => {
        let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        let max = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        meshes.forEach(mesh => {
            const boundingInfo = mesh.getBoundingInfo();
            const boundingBox = boundingInfo.boundingBox;
            min = BABYLON.Vector3.Minimize(min, boundingBox.minimum);
            max = BABYLON.Vector3.Maximize(max, boundingBox.maximum);
        });
        return {
            center: BABYLON.Vector3.Center(min, max),
            size: max.subtract(min)
        };
    };

    const refocusCanvas = () => {
        if (canvasRef.current) {
            canvasRef.current.focus();
        }
    };

    const handleSensitivityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setSensitivity(value);
        if (currentCamera && currentCamera instanceof BABYLON.ArcRotateCamera) {
            currentCamera.angularSensibilityX = value * 100;
        }
        setTimeout(refocusCanvas, 0);
    };

    const handleZoomSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setZoomSpeed(value);
        if (currentCamera && currentCamera instanceof BABYLON.ArcRotateCamera) {
            currentCamera.wheelPrecision = 0.15 / value;
        }
        setTimeout(refocusCanvas, 0);
    };

    const handleFppMovementSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setFppMovementSpeed(value);
        if (currentCamera && currentCamera instanceof BABYLON.UniversalCamera) {
            currentCamera.speed = value * 2;
        }
        setTimeout(refocusCanvas, 0);
    };

    const handleResetCamera = () => {
        if (currentCamera && loadedMeshes.length) {
            const { center, size } = calculateModelBounds(loadedMeshes);
            const distanceFactor = 2;

            currentCamera.position = new BABYLON.Vector3(
                center.x,
                center.y + size.y * 0.7,
                center.z + Math.max(size.x, size.z) * distanceFactor
            );

            if (currentCamera instanceof BABYLON.ArcRotateCamera) {
                currentCamera.target = center;
                currentCamera.radius = Math.max(size.x, size.z) * distanceFactor;
            } else if (currentCamera instanceof BABYLON.UniversalCamera) {
                currentCamera.setTarget(center);
            }
        }
        refocusCanvas();
    };

    const handleToggleInspector = () => {
        if (scene) {
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            } else {
                scene.debugLayer.show({ embedMode: true });
            }
        }
        refocusCanvas();
    };

    const setupArcRotateCamera = (position: BABYLON.Vector3, target: BABYLON.Vector3) => {
        if (!scene) return null;
        const camera = new BABYLON.ArcRotateCamera(
            "arcCam",
            Math.PI,
            Math.PI / 3,
            10,
            target,
            scene
        );
        camera.position = position;

        // Apply current limits
        camera.lowerAlphaLimit = yawLimits.min;
        camera.upperAlphaLimit = yawLimits.max;
        camera.lowerBetaLimit = pitchLimits.min;
        camera.upperBetaLimit = pitchLimits.max;
        camera.lowerRadiusLimit = zoomLimits.min;
        camera.upperRadiusLimit = zoomLimits.max;

        camera.attachControl(canvasRef.current, true);
        return camera;
    };

    const setupUniversalCamera = (position: BABYLON.Vector3, target: BABYLON.Vector3) => {
        if (!scene) return null;
        const camera = new BABYLON.UniversalCamera("univCam", position, scene);
        camera.setTarget(target);
        camera.attachControl(canvasRef.current, true);
        
        camera.angularSensibility = 1050;
        camera.speed = fppMovementSpeed;
        
        // Set both WASD and arrow keys for movement
        camera.keysUp = [87, 38];      // W and UP arrow
        camera.keysDown = [83, 40];    // S and DOWN arrow
        camera.keysLeft = [65, 37];    // A and LEFT arrow
        camera.keysRight = [68, 39];   // D and RIGHT arrow
        
        return camera;
    };

    const handleSwitchCamera = () => {
        if (!currentCamera || !scene) return;
        
        if (currentCamera instanceof BABYLON.ArcRotateCamera) {
            const pos = currentCamera.position.clone();
            const target = currentCamera.target.clone();
            const newCam = setupUniversalCamera(pos, target);
            if (newCam) {
                currentCamera.dispose();
                setCurrentCamera(newCam);
            }
        } else {
            const pos = currentCamera.position.clone();
            const target = currentCamera.getTarget();
            const newCam = setupArcRotateCamera(pos, target);
            if (newCam) {
                currentCamera.dispose();
                setCurrentCamera(newCam);
            }
        }
        refocusCanvas();
    };

    const handleInitiateFPP = () => {
        if (!currentCamera || !scene || currentCamera instanceof BABYLON.UniversalCamera) return;
        
        const pos = currentCamera.position.clone();
        const target = currentCamera.target.clone();
        const newCam = setupUniversalCamera(pos, target);
        if (newCam) {
            currentCamera.dispose();
            setCurrentCamera(newCam);
        }
        refocusCanvas();
    };

    const handleMoveUp = () => {
        if (!currentCamera) return;
        if (currentCamera instanceof BABYLON.UniversalCamera) {
            currentCamera.position.y += 1.5;
        } else if (currentCamera instanceof BABYLON.ArcRotateCamera) {
            currentCamera.target = currentCamera.target.add(
                new BABYLON.Vector3(0, 0.5, 0)
            );
        }
    };

    const handleMoveDown = () => {
        if (!currentCamera) return;
        if (currentCamera instanceof BABYLON.UniversalCamera) {
            currentCamera.position.y -= 1.5;
        } else if (currentCamera instanceof BABYLON.ArcRotateCamera) {
            currentCamera.target = currentCamera.target.add(
                new BABYLON.Vector3(0, -0.5, 0)
            );
        }
    };

    const startMove = (direction: 'up' | 'down') => {
        if (moveInterval) return;
        
        const moveFunction = direction === 'up' ? handleMoveUp : handleMoveDown;
        moveFunction();
        
        const interval = setInterval(moveFunction, 16);
        setMoveInterval(interval);
    };

    const stopMove = () => {
        if (moveInterval) {
            clearInterval(moveInterval);
            setMoveInterval(null);
        }
    };

    const updateCameraLimits = (
        type: 'yaw' | 'pitch' | 'zoom',
        limit: 'min' | 'max',
        value: number
    ) => {
        if (!currentCamera || !(currentCamera instanceof BABYLON.ArcRotateCamera)) {
            console.log('No ArcRotateCamera available');
            return;
        }

        // Force value to be a number
        value = Number(value);
        if (isNaN(value)) return;

        console.log(`Updating ${type} ${limit} to ${value}`);

        switch (type) {
            case 'yaw':
                const newYawLimits = { ...yawLimits };
                newYawLimits[limit] = value;
                setYawLimits(newYawLimits);
                
                if (limit === 'min') {
                    currentCamera.lowerAlphaLimit = value;
                } else {
                    currentCamera.upperAlphaLimit = value;
                }
                break;

            case 'pitch':
                const newPitchLimits = { ...pitchLimits };
                newPitchLimits[limit] = value;
                setPitchLimits(newPitchLimits);
                
                if (limit === 'min') {
                    currentCamera.lowerBetaLimit = value;
                } else {
                    currentCamera.upperBetaLimit = value;
                }
                break;

            case 'zoom':
                const newZoomLimits = { ...zoomLimits };
                newZoomLimits[limit] = value;
                setZoomLimits(newZoomLimits);
                
                if (limit === 'min') {
                    currentCamera.lowerRadiusLimit = value;
                } else {
                    currentCamera.upperRadiusLimit = value;
                }
                break;
        }

        // Force camera to update
        currentCamera.rebuildAnglesAndRadius();
    };

    const adjustValue = (
        type: 'yaw' | 'pitch' | 'zoom',
        limit: 'min' | 'max',
        increment: boolean,
        step: number
    ) => {
        if (!currentCamera || !(currentCamera instanceof BABYLON.ArcRotateCamera)) return;

        let currentValue: number;
        let newValue: number;

        switch (type) {
            case 'yaw':
                currentValue = limit === 'min' ? yawLimits.min : yawLimits.max;
                newValue = increment ? currentValue + (step * Math.PI / 180) : currentValue - (step * Math.PI / 180);
                // Allow full rotation range
                newValue = Math.max(-2 * Math.PI, Math.min(2 * Math.PI, newValue));
                break;
            case 'pitch':
                currentValue = limit === 'min' ? pitchLimits.min : pitchLimits.max;
                newValue = increment ? currentValue + (step * Math.PI / 180) : currentValue - (step * Math.PI / 180);
                // Allow full vertical rotation
                newValue = Math.max(0, Math.min(Math.PI, newValue));
                break;
            case 'zoom':
                currentValue = limit === 'min' ? zoomLimits.min : zoomLimits.max;
                newValue = increment ? currentValue + step : currentValue - step;
                // Increased zoom range
                newValue = Math.max(1, Math.min(2000, newValue));
                break;
            default:
                return;
        }

        updateCameraLimits(type, limit, newValue);
    };

    const handleAutoRotateSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setAutoRotateSpeed(value);
        
        // If currently rotating, update the interval with new speed
        if (isAutoRotating && currentCamera instanceof BABYLON.ArcRotateCamera) {
            if (autoRotateInterval) {
                clearInterval(autoRotateInterval);
            }
            const interval = setInterval(() => {
                currentCamera.alpha += 0.01 * value;
                // Reset alpha when it completes a full rotation
                if (currentCamera.alpha >= 2 * Math.PI) {
                    currentCamera.alpha -= 2 * Math.PI;
                }
            }, 16);
            setAutoRotateInterval(interval);
        }
        
        setTimeout(refocusCanvas, 0);
    };

    const toggleAutoRotate = () => {
        if (isAutoRotating) {
            // Stop auto-rotation
            if (autoRotateInterval) {
                clearInterval(autoRotateInterval);
                setAutoRotateInterval(null);
            }
        } else {
            // Start auto-rotation
            if (currentCamera instanceof BABYLON.ArcRotateCamera) {
                const interval = setInterval(() => {
                    currentCamera.alpha += 0.01 * autoRotateSpeed;
                    // Reset alpha when it completes a full rotation
                    if (currentCamera.alpha >= 2 * Math.PI) {
                        currentCamera.alpha -= 2 * Math.PI;
                    }
                }, 16);
                setAutoRotateInterval(interval);
            }
        }
        setIsAutoRotating(!isAutoRotating);
        refocusCanvas();
    };

    const renderCameraLimitsControls = () => (
        <div className="camera-limits-controls">
            <div className="limits-header" onClick={() => setShowCameraLimits(!showCameraLimits)}>
                <h4>Camera Limits</h4>
                <span>{showCameraLimits ? '▼' : '▶'}</span>
            </div>
            
            {showCameraLimits && (
                <div className="limits-content">
                    <div className="limit-group">
                        <h5>Yaw (Horizontal Rotation)</h5>
                        <div className="limit-inputs">
                            <div className="limit-control">
                                <span>Min: {Math.round(yawLimits.min * 180 / Math.PI)}°</span>
                                <div className="button-group">
                                    <button onClick={() => adjustValue('yaw', 'min', false, 15)}>-15°</button>
                                    <button onClick={() => adjustValue('yaw', 'min', false, 5)}>-5°</button>
                                    <button onClick={() => adjustValue('yaw', 'min', true, 5)}>+5°</button>
                                    <button onClick={() => adjustValue('yaw', 'min', true, 15)}>+15°</button>
                                </div>
                            </div>
                            <div className="limit-control">
                                <span>Max: {Math.round(yawLimits.max * 180 / Math.PI)}°</span>
                                <div className="button-group">
                                    <button onClick={() => adjustValue('yaw', 'max', false, 15)}>-15°</button>
                                    <button onClick={() => adjustValue('yaw', 'max', false, 5)}>-5°</button>
                                    <button onClick={() => adjustValue('yaw', 'max', true, 5)}>+5°</button>
                                    <button onClick={() => adjustValue('yaw', 'max', true, 15)}>+15°</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="limit-group">
                        <h5>Pitch (Vertical Rotation)</h5>
                        <div className="limit-inputs">
                            <div className="limit-control">
                                <span>Min: {Math.round(pitchLimits.min * 180 / Math.PI)}°</span>
                                <div className="button-group">
                                    <button onClick={() => adjustValue('pitch', 'min', false, 5)}>-5°</button>
                                    <button onClick={() => adjustValue('pitch', 'min', false, 1)}>-1°</button>
                                    <button onClick={() => adjustValue('pitch', 'min', true, 1)}>+1°</button>
                                    <button onClick={() => adjustValue('pitch', 'min', true, 5)}>+5°</button>
                                </div>
                            </div>
                            <div className="limit-control">
                                <span>Max: {Math.round(pitchLimits.max * 180 / Math.PI)}°</span>
                                <div className="button-group">
                                    <button onClick={() => adjustValue('pitch', 'max', false, 5)}>-5°</button>
                                    <button onClick={() => adjustValue('pitch', 'max', false, 1)}>-1°</button>
                                    <button onClick={() => adjustValue('pitch', 'max', true, 1)}>+1°</button>
                                    <button onClick={() => adjustValue('pitch', 'max', true, 5)}>+5°</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="limit-group">
                        <h5>Zoom Distance</h5>
                        <div className="limit-inputs">
                            <div className="limit-control">
                                <span>Min: {zoomLimits.min}</span>
                                <div className="button-group">
                                    <button onClick={() => adjustValue('zoom', 'min', false, 50)}>-50</button>
                                    <button onClick={() => adjustValue('zoom', 'min', false, 5)}>-5</button>
                                    <button onClick={() => adjustValue('zoom', 'min', true, 5)}>+5</button>
                                    <button onClick={() => adjustValue('zoom', 'min', true, 50)}>+50</button>
                                </div>
                            </div>
                            <div className="limit-control">
                                <span>Max: {zoomLimits.max}</span>
                                <div className="button-group">
                                    <button onClick={() => adjustValue('zoom', 'max', false, 50)}>-50</button>
                                    <button onClick={() => adjustValue('zoom', 'max', false, 5)}>-5</button>
                                    <button onClick={() => adjustValue('zoom', 'max', true, 5)}>+5</button>
                                    <button onClick={() => adjustValue('zoom', 'max', true, 50)}>+50</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderAutoRotateControls = () => (
        <div className="auto-rotate-controls">
            <div className="auto-rotate-header">
                <button 
                    onClick={toggleAutoRotate}
                    className={isAutoRotating ? 'active' : ''}
                >
                    {isAutoRotating ? '⏹' : '⟳'} Auto-Rotate
                </button>
                <div className="speed-control">
                    <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={autoRotateSpeed}
                        onChange={handleAutoRotateSpeedChange}
                        onMouseDown={(e) => e.stopPropagation()}
                        disabled={!isAutoRotating}
                    />
                    <span>{autoRotateSpeed.toFixed(1)}x</span>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        if (currentCamera && currentCamera instanceof BABYLON.ArcRotateCamera) {
            // Get current camera limits
            const currentLimits = {
                yaw: {
                    min: currentCamera.lowerAlphaLimit ?? -2 * Math.PI,
                    max: currentCamera.upperAlphaLimit ?? 2 * Math.PI
                },
                pitch: {
                    min: currentCamera.lowerBetaLimit ?? 0,
                    max: currentCamera.upperBetaLimit ?? Math.PI
                },
                zoom: {
                    min: currentCamera.lowerRadiusLimit ?? 1,
                    max: currentCamera.upperRadiusLimit ?? 2000
                }
            };

            // Update state with current camera limits
            setYawLimits(currentLimits.yaw);
            setPitchLimits(currentLimits.pitch);
            setZoomLimits(currentLimits.zoom);

            // Apply limits to camera
            currentCamera.lowerAlphaLimit = currentLimits.yaw.min;
            currentCamera.upperAlphaLimit = currentLimits.yaw.max;
            currentCamera.lowerBetaLimit = currentLimits.pitch.min;
            currentCamera.upperBetaLimit = currentLimits.pitch.max;
            currentCamera.lowerRadiusLimit = currentLimits.zoom.min;
            currentCamera.upperRadiusLimit = currentLimits.zoom.max;
        }
    }, [currentCamera]);

    useEffect(() => {
        return () => {
            if (moveInterval) {
                clearInterval(moveInterval);
            }
            if (autoRotateInterval) {
                clearInterval(autoRotateInterval);
            }
        };
    }, [moveInterval, autoRotateInterval]);

    return (
        <div className={`control-settings ${isExpanded ? 'expanded' : ''}`} 
            onMouseDown={(e) => e.preventDefault()}
        >
            <div className="pill" 
                onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                    refocusCanvas();
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '20px', height: '20px', marginRight: '8px'}}>
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                <h3>Control Settings</h3>
            </div>
            {isExpanded && (
                <div className="settings-options">
                    {currentCamera instanceof BABYLON.ArcRotateCamera ? (
                        <>
                            <div>
                                <label onMouseDown={(e) => e.stopPropagation()}>
                                    Camera Sensitivity:
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="5"
                                        step="0.1"
                                        value={sensitivity}
                                        onChange={handleSensitivityChange}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    />
                                    {sensitivity}
                                </label>
                            </div>
                            <div>
                                <label onMouseDown={(e) => e.stopPropagation()}>
                                    Zoom Speed:
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="5"
                                        step="0.1"
                                        value={zoomSpeed}
                                        onChange={handleZoomSpeedChange}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    />
                                    {zoomSpeed}
                                </label>
                            </div>
                            {renderAutoRotateControls()}
                        </>
                    ) : (
                        <div>
                            <label onMouseDown={(e) => e.stopPropagation()}>
                                Movement Speed:
                                <input
                                    type="range"
                                    min="0.1"
                                    max="5"
                                    step="0.1"
                                    value={fppMovementSpeed}
                                    onChange={handleFppMovementSpeedChange}
                                    onMouseDown={(e) => e.stopPropagation()}
                                />
                                {fppMovementSpeed}
                            </label>
                            <div className="control-hint">
                                Use WASD or Arrow Keys to move, Mouse to look around
                            </div>
                        </div>
                    )}
                    <div className="button-controls">
                        <button onClick={(e) => {
                            e.preventDefault();
                            handleResetCamera();
                        }}>Reset Camera</button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            handleToggleInspector();
                        }}>Toggle Inspector</button>
                    </div>
                    <div className="button-controls">
                        <button onClick={(e) => {
                            e.preventDefault();
                            handleSwitchCamera();
                        }}>Switch Camera</button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            handleInitiateFPP();
                        }}>Initiate FPP</button>
                    </div>
                    <div className="button-controls movement-controls">
                        <button 
                            onMouseDown={() => startMove('up')}
                            onMouseUp={stopMove}
                            onMouseLeave={stopMove}
                            onTouchStart={() => startMove('up')}
                            onTouchEnd={stopMove}
                        >
                            Move Up
                        </button>
                        <button 
                            onMouseDown={() => startMove('down')}
                            onMouseUp={stopMove}
                            onMouseLeave={stopMove}
                            onTouchStart={() => startMove('down')}
                            onTouchEnd={stopMove}
                        >
                            Move Down
                        </button>
                    </div>
                    {currentCamera instanceof BABYLON.ArcRotateCamera && renderCameraLimitsControls()}
                </div>
            )}
        </div>
    );
};

export default ControlSettings; 