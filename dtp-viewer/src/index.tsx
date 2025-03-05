import * as React from "react";
import { registerWidget, registerLink, registerUI, IContextProvider, } from './uxp';
import { TitleBar, FilterPanel, WidgetWrapper, Button } from "uxp/components";
import './styles.scss';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import PropertyPanel, { getMeshProperties, type MeshProperties } from './components/PropertyPanel';
import ControlSettings from './components/ControlSettings';
import UploadModal from './components/UploadModal';
import { fileSystemService, StoredModel } from './services/FileSystemService';
import { ModelIcon } from './components/ModelIcon';
import MeshCapsule from './components/MeshCapsule';
import * as ReactDOM from 'react-dom';
import { meshConfigurations } from './config/meshConfig';
import BuildingWidgets from './components/BuildingWidgets';
import NavigationWidget from './components/NavigationWidget';
import MeshList from './components/MeshList';
import LoadingOverlay from './components/LoadingOverlay';

interface IWidgetProps {
    uxpContext?: IContextProvider,
    instanceId?: string
}

interface LoadedModel {
    name: string;
    preview: string;
    file: File;
}

// Add this type assertion function
const asMesh = (mesh: BABYLON.AbstractMesh): BABYLON.Mesh => {
    return mesh as BABYLON.Mesh;
};

// Add this type definition
type Root = {
    render(component: React.ReactElement): void;
};

// Add this helper function at the top level
const createRootHelper = (container: HTMLElement) => {
    if ((ReactDOM as any).createRoot) {
        // React 18
        return (ReactDOM as any).createRoot(container);
    } else {
        // React 17 and below
        return {
            render(component: React.ReactElement) {
                ReactDOM.render(component, container);
            }
        };
    }
};

// Add this at the top level
interface SavedView {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
}

const ThreeDViewerWidget: React.FunctionComponent<IWidgetProps> = (props: IWidgetProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = React.useState<BABYLON.Engine | null>(null);
    const [scene, setScene] = React.useState<BABYLON.Scene | null>(null);
    const [currentScene, setCurrentScene] = React.useState<BABYLON.Scene | null>(null);
    const [currentCamera, setCurrentCamera] = React.useState<BABYLON.ArcRotateCamera | BABYLON.UniversalCamera | null>(null);
    const [loadedMeshes, setLoadedMeshes] = React.useState<BABYLON.AbstractMesh[]>([]);
    const [resetCameraBtn, setResetCameraBtn] = React.useState<HTMLButtonElement | null>(null);
    const [toggleInspectorBtn, setToggleInspectorBtn] = React.useState<HTMLButtonElement | null>(null);
    const [selectedProperties, setSelectedProperties] = React.useState<MeshProperties | null>(null);
    const [selectedMesh, setSelectedMesh] = React.useState<BABYLON.AbstractMesh | null>(null);
    const [isPanelVisible, setPanelVisible] = React.useState(false);
    const [cameraSensitivity, setCameraSensitivity] = React.useState(1);
    const [zoomSpeed, setZoomSpeed] = React.useState(1);
    const [isUploadModalOpen, setUploadModalOpen] = React.useState(true);
    const [loadedModelsList, setLoadedModelsList] = React.useState<StoredModel[]>([]);
    const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const [selectedBuildingId, setSelectedBuildingId] = React.useState<string | null>(null);
    const [selectedNavItem, setSelectedNavItem] = React.useState<string | null>(null);
    const [currentModelId, setCurrentModelId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const initialCameraPosition = new BABYLON.Vector3(0, 5, -10); // Set your initial camera position
    const initialCameraTarget = BABYLON.Vector3.Zero(); // Set your initial camera target

    React.useEffect(() => {
        if (canvasRef.current) {
            const newEngine = new BABYLON.Engine(canvasRef.current, true);
            setEngine(newEngine);
            const newScene = new BABYLON.Scene(newEngine);
            setScene(newScene);
            newScene.clearColor = new BABYLON.Color4(0.97, 0.97, 0.95, 1);

            const camera = new BABYLON.ArcRotateCamera("arcCam", Math.PI, Math.PI / 3, 10, BABYLON.Vector3.Zero(), newScene);
            camera.lowerBetaLimit = 0.1;
            camera.upperBetaLimit = Math.PI / 2;
            camera.lowerRadiusLimit = 5;
            camera.upperRadiusLimit = 950;
            camera.attachControl(canvasRef.current, true);
            setCurrentCamera(camera);

            const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), newScene);
            light.intensity = 0.7;

            newEngine.runRenderLoop(() => {
                newScene.render();
            });

            return () => {
                newEngine.dispose();
            };
        }
    }, []);

    const generatePreview = async (file: File): Promise<string> => {
        const previewEngine = new BABYLON.Engine(previewCanvasRef.current!, true);
        const previewScene = new BABYLON.Scene(previewEngine);
        
        // Setup preview scene
        const camera = new BABYLON.ArcRotateCamera(
            "previewCamera",
            Math.PI / 2,
            Math.PI / 3,
            10,
            BABYLON.Vector3.Zero(),
            previewScene
        );
        const light = new BABYLON.HemisphericLight(
            "previewLight",
            new BABYLON.Vector3(0, 1, 0),
            previewScene
        );

        // Load the model
        await BABYLON.SceneLoader.ImportMeshAsync("", "", file, previewScene);
        
        // Render one frame
        previewScene.render();
        
        // Get the preview image
        const preview = previewCanvasRef.current!.toDataURL();
        
        // Cleanup
        previewEngine.dispose();
        
        return preview;
    };

    React.useEffect(() => {
        // Load stored models when component mounts
        const loadStoredModels = async () => {
            await fileSystemService.initializeStorage();
            const models = await fileSystemService.loadStoredModels();
            setLoadedModelsList(models);
        };
        loadStoredModels();
    }, []);

    const handleFileSelect = async (file: File) => {
        const preview = await generatePreview(file);
        const modelData = await fileSystemService.saveModel(file, preview);
        setLoadedModelsList(prev => [...prev, modelData]);
        handleFileUpload(file);
        setUploadModalOpen(false);
    };

    const handleModelSelect = async (modelData: StoredModel) => {
        console.log('Selected model:', modelData);
        const file = await fileSystemService.loadFile(modelData.path);
        if (file) {
            setIsLoading(true);
            setCurrentModelId(modelData.id);
            await new Promise(resolve => setTimeout(resolve, 100));
            await handleFileUpload(file);
            setUploadModalOpen(false);
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (fileExtension === 'glb' || fileExtension === 'gltf' || fileExtension === 'obj') {
            if (scene) {
                try {
                    setIsLoading(true);

                    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", file, scene);
                    const newLoadedMeshes = result.meshes.filter(m => m.name !== "__root__");
                    setLoadedMeshes(newLoadedMeshes);

                    // Wait for meshes to be fully loaded
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Calculate model bounds first
                    const { center, size } = calculateModelBounds(newLoadedMeshes);
                    
                    // Get the key based on the loaded mesh name
                    const meshKey = newLoadedMeshes.length > 0 ? newLoadedMeshes[0].name : null;
                    console.log('Loaded mesh key:', meshKey);

                    if (meshKey && currentCamera instanceof BABYLON.ArcRotateCamera) {
                        const allSavedViews = JSON.parse(localStorage.getItem('modelViews') || '{}');
                        console.log('All saved views:', allSavedViews);
                        
                        const savedView = allSavedViews[meshKey];
                        console.log('Found saved view for mesh:', savedView);

                        if (savedView) {
                            // Apply saved view
                            currentCamera.position = new BABYLON.Vector3(
                                savedView.position.x,
                                savedView.position.y,
                                savedView.position.z
                            );
                            currentCamera.target = new BABYLON.Vector3(
                                savedView.target.x,
                                savedView.target.y,
                                savedView.target.z
                            );
                        } else {
                            // Only set default camera position if there's no saved view
                            const distanceFactor = 2;
                            currentCamera.position = new BABYLON.Vector3(
                                center.x,
                                center.y + size.y * 0.7,
                                center.z + Math.max(size.x, size.z) * distanceFactor
                            );
                            currentCamera.target = center;
                            currentCamera.radius = Math.max(size.x, size.z) * distanceFactor;
                        }
                    }

                    // Setup mesh overlays and other features
                    const canvasContainer = canvasRef.current?.parentElement;
                    if (!canvasContainer) return;

                    newLoadedMeshes.forEach((mesh, index) => {
                        const meshConfig = meshConfigurations.find(config => config.meshName === mesh.name);
                        
                        if (meshConfig) {
                            const overlayDiv = document.createElement('div');
                            overlayDiv.style.position = 'absolute';
                            overlayDiv.style.zIndex = '1';
                            canvasContainer.appendChild(overlayDiv);

                            // Store metadata with the mesh for later updates
                            mesh.metadata = {
                                overlayDiv,
                                buildingNumber: index + 1,
                                buildingLabel: meshConfig.buildingLabel,
                                capsuleColor: meshConfig.capsuleColor,
                                glowColor: meshConfig.glowColor
                            };

                            const root = createRootHelper(overlayDiv);
                            root.render(React.createElement(MeshCapsule, { 
                                buildingNumber: index + 1,
                                color: meshConfig.capsuleColor,
                                label: meshConfig.buildingLabel
                            }));

                            // Update overlay position in render loop
                            scene.registerBeforeRender(() => {
                                if (mesh && overlayDiv && currentCamera) {
                                    const meshPosition = mesh.getBoundingInfo().boundingBox.centerWorld;
                                    const screenPosition = BABYLON.Vector3.Project(
                                        meshPosition,
                                        BABYLON.Matrix.Identity(),
                                        scene.getTransformMatrix(),
                                        currentCamera.viewport.toGlobal(
                                            engine!.getRenderWidth(),
                                            engine!.getRenderHeight()
                                        )
                                    );

                                    overlayDiv.style.left = `${screenPosition.x}px`;
                                    overlayDiv.style.top = `${screenPosition.y - 70}px`;
                                }
                            });

                            // Apply glow effect with configured color
                            const glowLayer = new BABYLON.GlowLayer("glow", scene);
                            glowLayer.intensity = 0.2;
                            glowLayer.addIncludedOnlyMesh(asMesh(mesh));
                            
                            // Convert hex color to BABYLON.Color3
                            const glowColor = BABYLON.Color3.FromHexString(meshConfig.glowColor);
                            glowLayer.customEmissiveColorSelector = function(
                                mesh: BABYLON.Mesh, 
                                subMesh: BABYLON.SubMesh, 
                                material: BABYLON.Material, 
                                result: BABYLON.Color4
                            ): void {
                                result.set(glowColor.r, glowColor.g, glowColor.b, 1.0);
                            };
                        }
                    });

                } catch (error) {
                    console.error("Error loading model:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        } else {
            alert("Please upload a valid .glb, .gltf, or .obj file.");
        }
    };

    const calculateModelBounds = (meshes: BABYLON.AbstractMesh[]) => {
        let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        let max = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

        meshes.forEach(mesh => {
            const boundingInfo = mesh.getBoundingInfo();
            const boundingBox = boundingInfo.boundingBox;

            min = BABYLON.Vector3.Minimize(min, boundingBox.minimum);
            max = BABYLON.Vector3.Maximize(max, boundingBox.maximum);
        });

        const center = BABYLON.Vector3.Center(min, max);
        const size = max.subtract(min);

        return { center, size };
    };

    const updateMeshColors = (mesh: BABYLON.AbstractMesh, capsuleColor: string, glowColor: string) => {
        // Update capsule color
        const overlayDiv = mesh.metadata?.overlayDiv;
        if (overlayDiv) {
            const root = createRootHelper(overlayDiv);
            root.render(React.createElement(MeshCapsule, { 
                buildingNumber: mesh.metadata?.buildingNumber,
                color: capsuleColor,
                label: mesh.metadata?.buildingLabel
            }));
        }

        // Update glow color
        if (scene) {
            const glowLayer = scene.getGlowLayerByName("glow");
            if (glowLayer) {
                const newGlowColor = BABYLON.Color3.FromHexString(glowColor);
                glowLayer.customEmissiveColorSelector = function(
                    mesh: BABYLON.Mesh, 
                    subMesh: BABYLON.SubMesh, 
                    material: BABYLON.Material, 
                    result: BABYLON.Color4
                ): void {
                    result.set(newGlowColor.r, newGlowColor.g, newGlowColor.b, 1.0);
                };
            }
        }
    };

    const handleMeshClick = (mesh: BABYLON.AbstractMesh) => {
        const properties = getMeshProperties(mesh);
        setSelectedProperties(properties);
        setSelectedMesh(mesh);
        setPanelVisible(true);
        setSelectedBuildingId(mesh.metadata?.buildingLabel || null);

        // Remove random color change code and keep only the highlight effect
        const originalMaterial = mesh.material;
        const highlightMaterial = new BABYLON.StandardMaterial("highlightMat", scene);
        highlightMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1);
        mesh.material = highlightMaterial;

        setTimeout(() => {
            mesh.material = originalMaterial;
        }, 1000);
    };

    // Add this function to handle double click
    const handleDoubleClick = async (mesh: BABYLON.AbstractMesh) => {
        try {
            const newModelFile = await fileSystemService.loadFile('1741094349528_valentine-new.glb');
            if (newModelFile && scene) {
                // Create fade out animation for old meshes
                const fadeOutAnimation = new BABYLON.Animation(
                    "fadeOut",
                    "visibility",
                    60,
                    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                );
                fadeOutAnimation.setKeys([
                    { frame: 0, value: 1 },
                    { frame: 30, value: 0 }
                ]);

                // Fade out old meshes and their capsules
                const fadePromises = loadedMeshes.map(oldMesh => {
                    return new Promise<void>(resolve => {
                        // Fade out capsule
                        if (oldMesh.metadata?.overlayDiv) {
                            oldMesh.metadata.overlayDiv.style.transition = 'opacity 0.5s';
                            oldMesh.metadata.overlayDiv.style.opacity = '0';
                        }

                        // Fade out mesh
                        scene!.beginDirectAnimation(
                            oldMesh,
                            [fadeOutAnimation],
                            0,
                            30,
                            false,
                            1,
                            () => {
                                if (oldMesh.metadata?.overlayDiv) {
                                    oldMesh.metadata.overlayDiv.remove();
                                }
                                oldMesh.dispose();
                                resolve();
                            }
                        );
                    });
                });

                // Wait for all fades to complete
                await Promise.all(fadePromises);

                // Load new model
                const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", newModelFile, scene);
                const newMeshes = result.meshes.filter(m => m.name !== "__root__");

                // Set initial visibility to 0
                newMeshes.forEach(mesh => mesh.visibility = 0);

                // Check for saved view first
                const meshKey = newMeshes.length > 0 ? newMeshes[0].name : null;
                const allSavedViews = JSON.parse(localStorage.getItem('modelViews') || '{}');
                const savedView = meshKey ? allSavedViews[meshKey] : null;

                // Calculate bounds for fallback position
                const { center, size } = calculateModelBounds(newMeshes);
                
                // Create new ArcRotateCamera at the saved or default position
                const newCamera = new BABYLON.ArcRotateCamera(
                    "arcCam",
                    Math.PI,
                    Math.PI / 3,
                    10,
                    savedView ? new BABYLON.Vector3(
                        savedView.target.x,
                        savedView.target.y,
                        savedView.target.z
                    ) : center,
                    scene
                );

                // Set camera limits
                newCamera.lowerBetaLimit = 0.1;
                newCamera.upperBetaLimit = Math.PI / 2;
                newCamera.lowerRadiusLimit = 5;
                newCamera.upperRadiusLimit = 950;

                if (savedView) {
                    // Set the saved position directly
                    newCamera.position = new BABYLON.Vector3(
                        savedView.position.x,
                        savedView.position.y,
                        savedView.position.z
                    );
                } else {
                    // Set default position
                    newCamera.position = new BABYLON.Vector3(
                        center.x,
                        center.y + size.y * 0.7,
                        center.z + Math.max(size.x, size.z) * 2
                    );
                }

                // Attach control and set as active camera
                newCamera.attachControl(canvasRef.current!, true);
                scene.activeCamera = newCamera;
                setCurrentCamera(newCamera);

                // Create fade in animation for new meshes
                const fadeInAnimation = new BABYLON.Animation(
                    "fadeIn",
                    "visibility",
                    60,
                    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                );
                fadeInAnimation.setKeys([
                    { frame: 0, value: 0 },
                    { frame: 30, value: 1 }
                ]);

                // Fade in new meshes and create their capsules
                const canvasContainer = canvasRef.current?.parentElement;
                if (canvasContainer) {
                    newMeshes.forEach((mesh, index) => {
                        // Start fade in animation
                        scene!.beginDirectAnimation(
                            mesh,
                            [fadeInAnimation],
                            0,
                            30,
                            false,
                            1
                        );

                        // Create capsule with fade in
                        const meshConfig = meshConfigurations.find(config => config.meshName === mesh.name);
                        if (meshConfig) {
                            const overlayDiv = document.createElement('div');
                            overlayDiv.style.position = 'absolute';
                            overlayDiv.style.zIndex = '1';
                            overlayDiv.style.opacity = '0';
                            overlayDiv.style.transition = 'opacity 0.5s';
                            canvasContainer.appendChild(overlayDiv);

                            // Store metadata
                            mesh.metadata = {
                                overlayDiv,
                                buildingNumber: index + 1,
                                buildingLabel: meshConfig.buildingLabel,
                                capsuleColor: meshConfig.capsuleColor,
                                glowColor: meshConfig.glowColor
                            };

                            const root = createRootHelper(overlayDiv);
                            root.render(React.createElement(MeshCapsule, { 
                                buildingNumber: index + 1,
                                color: meshConfig.capsuleColor,
                                label: meshConfig.buildingLabel
                            }));

                            // Add glow effect
                            const glowLayer = new BABYLON.GlowLayer("glow", scene);
                            glowLayer.intensity = 0.2;
                            glowLayer.addIncludedOnlyMesh(asMesh(mesh));
                            
                            // Convert hex color to BABYLON.Color3
                            const glowColor = BABYLON.Color3.FromHexString(meshConfig.glowColor);
                            glowLayer.customEmissiveColorSelector = function(
                                mesh: BABYLON.Mesh, 
                                subMesh: BABYLON.SubMesh, 
                                material: BABYLON.Material, 
                                result: BABYLON.Color4
                            ): void {
                                result.set(glowColor.r, glowColor.g, glowColor.b, 1.0);
                            };

                            // Fade in capsule
                            setTimeout(() => {
                                overlayDiv.style.opacity = '1';
                            }, 100);

                            // Setup position updates
                            scene!.registerBeforeRender(() => {
                                if (mesh && overlayDiv && currentCamera) {
                                    const meshPosition = mesh.getBoundingInfo().boundingBox.centerWorld;
                                    const screenPosition = BABYLON.Vector3.Project(
                                        meshPosition,
                                        BABYLON.Matrix.Identity(),
                                        scene!.getTransformMatrix(),
                                        currentCamera.viewport.toGlobal(
                                            engine!.getRenderWidth(),
                                            engine!.getRenderHeight()
                                        )
                                    );

                                    overlayDiv.style.left = `${screenPosition.x}px`;
                                    overlayDiv.style.top = `${screenPosition.y - 70}px`;
                                }
                            });
                        }
                    });
                }

                setLoadedMeshes(newMeshes);
            }
        } catch (error) {
            console.error("Error loading new model:", error);
        }
    };

    // Modify the useEffect for mesh click handling
    React.useEffect(() => {
        if (scene) {
            loadedMeshes.forEach(mesh => {
                mesh.actionManager = new BABYLON.ActionManager(scene);
                
                // Single click action
                mesh.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPickTrigger,
                        () => handleMeshClick(mesh)
                    )
                );

                // Double click action
                mesh.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnDoublePickTrigger,
                        () => handleDoubleClick(mesh)
                    )
                );
            });
        }
    }, [scene, loadedMeshes]);

    const handleNavigationClick = (itemId: string) => {
        setSelectedNavItem(itemId);
        
        // Find meshes related to this category and highlight them
        if (scene && loadedMeshes) {
            loadedMeshes.forEach(mesh => {
                const meshConfig = meshConfigurations.find(config => 
                    config.meshName === mesh.name && 
                    config.category === itemId
                );
                
                if (meshConfig) {
                    // Highlight the mesh
                    const highlightMaterial = new BABYLON.StandardMaterial("highlightMat", scene);
                    highlightMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1);
                    highlightMaterial.alpha = 0.5;
                    
                    const originalMaterial = mesh.material;
                    mesh.material = highlightMaterial;

                    setTimeout(() => {
                        mesh.material = originalMaterial;
                    }, 1000);
                }
            });
        }
    };

    const saveCurrentView = () => {
        if (!currentCamera || !scene) {
            console.log('No camera or scene available');
            return;
        }
        
        // Get all saved views from localStorage
        const allSavedViews = JSON.parse(localStorage.getItem('modelViews') || '{}');
        
        // Store the current camera position and target
        const position = currentCamera.position.clone();
        const target = currentCamera instanceof BABYLON.ArcRotateCamera 
            ? currentCamera.target.clone() 
            : BABYLON.Vector3.Zero();

        // Save view for current model
        const currentModelKey = getCurrentModelKey();
        console.log('Saving view for model:', currentModelKey);
        console.log('Current camera position:', position);
        console.log('Current camera target:', target);

        if (currentModelKey) {
            allSavedViews[currentModelKey] = {
                position: { x: position.x, y: position.y, z: position.z },
                target: { x: target.x, y: target.y, z: target.z }
            };

            // Save all views back to localStorage
            localStorage.setItem('modelViews', JSON.stringify(allSavedViews));
            console.log('Saved views:', allSavedViews);
            alert('View position saved for current model!');
        }
    };

    // Modify getCurrentModelKey to prioritize mesh name
    const getCurrentModelKey = (): string | null => {
        // Always use the first mesh's name if available
        if (loadedMeshes.length > 0) {
            const meshName = loadedMeshes[0].name;
            console.log('Using mesh name as key:', meshName);
            return meshName;
        }
        
        // Fallback to model ID if no mesh is available
        if (currentModelId) {
            console.log('Using model ID as key:', currentModelId);
            return currentModelId;
        }
        
        return null;
    };

    return (
        <WidgetWrapper>
            <div className="canvas-container">
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
            
            <button 
                className="upload-button"
                onClick={() => setUploadModalOpen(true)}
            >
                <ModelIcon />
                 Models
            </button>

            <button 
                className="save-view-button"
                onClick={saveCurrentView}
                style={{
                    position: 'fixed',
                    top: '80px',
                    right: '20px',
                    zIndex: 1000,
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                Save View
            </button>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onFileSelect={handleFileSelect}
                loadedModels={loadedModelsList}
                onModelSelect={handleModelSelect}
            />

            {isPanelVisible && (
                <PropertyPanel 
                    properties={selectedProperties}
                    onClose={() => setPanelVisible(false)}
                    scene={scene}
                    mesh={selectedMesh}
                    updateMeshColors={updateMeshColors}
                />
            )}
            <ControlSettings 
                scene={scene}
                currentCamera={currentCamera}
                setCurrentCamera={setCurrentCamera}
                canvasRef={canvasRef}
                loadedMeshes={loadedMeshes}
            />
            <canvas 
                ref={previewCanvasRef} 
                style={{ display: 'none' }} 
                width={200} 
                height={200} 
            />
            <BuildingWidgets selectedBuilding={selectedBuildingId} />
            <NavigationWidget 
                onItemClick={handleNavigationClick}
                selectedItem={selectedNavItem}
                selectedBuilding={selectedBuildingId}
            />
            <MeshList 
                meshes={loadedMeshes}
                currentCamera={currentCamera}
                scene={scene}
            />
            {isLoading && <LoadingOverlay />}
        </WidgetWrapper>
    );
};

/**
 * Register as a Widget
 */
registerWidget({
    id: "3D_viewer",
    widget: ThreeDViewerWidget,
    configs: {
        layout: {
            // w: 12,
            // h: 12,
            // minH: 12,
            // minW: 12
        }
    }
});

/**
 * Register as a Sidebar Link
 */
/*
registerLink({
    id: "3D_viewer",
    label: "3D_viewer",
    // click: () => alert("Hello"),
    component: ThreeDViewerWidget
});
*/

/**
 * Register as a UI
 */

 
registerUI({
    id:"3d_viewerlink",
    component: ThreeDViewerWidget,
    showDefaultHeader: false,
});
