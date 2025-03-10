import * as React from 'react';
import { MeshConfig, updateMeshConfiguration, getDefaultMeshConfig, resetToDefaultConfigurations, meshConfigurations, loadMeshConfigurations } from '../config/meshConfig';
import * as BABYLON from 'babylonjs';

interface MeshConfigurationScreenProps {
    isOpen: boolean;
    onClose: () => void;
    meshes: BABYLON.AbstractMesh[];
    selectedMesh: BABYLON.AbstractMesh | null;
    onConfigUpdate: (meshName: string, config: MeshConfig) => void;
}

const MeshConfigurationScreen: React.FC<MeshConfigurationScreenProps> = ({
    isOpen,
    onClose,
    meshes,
    selectedMesh,
    onConfigUpdate
}) => {
    const [meshList, setMeshList] = React.useState<BABYLON.AbstractMesh[]>([]);
    const [currentMesh, setCurrentMesh] = React.useState<BABYLON.AbstractMesh | null>(null);
    const [config, setConfig] = React.useState<MeshConfig | null>(null);
    const [categories] = React.useState<string[]>([
        'default', 'fire-safety', 'acmv', 'operations', 'security', 'electrical'
    ]);
    const [saveStatus, setSaveStatus] = React.useState<string | null>(null);
    const [savedConfigCount, setSavedConfigCount] = React.useState<number>(0);
    const [loadedConfigs, setLoadedConfigs] = React.useState<MeshConfig[]>([]);

    // Load configurations when component mounts
    React.useEffect(() => {
        const loadConfigs = async () => {
            const configs = await loadMeshConfigurations();
            setLoadedConfigs(configs);
            setSavedConfigCount(configs.length);
        };
        loadConfigs();
    }, []);

    // Initialize component with meshes and selected mesh
    React.useEffect(() => {
        setMeshList(meshes);
        if (selectedMesh) {
            handleMeshSelect(selectedMesh);
        }
    }, [meshes, selectedMesh]);

    // Handle mesh selection
    const handleMeshSelect = async (mesh: BABYLON.AbstractMesh) => {
        setCurrentMesh(mesh);
        setSaveStatus(null);
        
        // Check if this mesh has a saved configuration
        const existingConfig = loadedConfigs.find(c => c.meshName === mesh.name);
        
        // Get existing config or create a temporary default one (not saved until user clicks Save)
        const configToUse = existingConfig || getDefaultMeshConfig(mesh.name);
        
        setConfig(configToUse);
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (config) {
            setConfig({
                ...config,
                [name]: value
            });
        }
    };

    // Save configuration
    const handleSave = async () => {
        if (config && currentMesh) {
            const updatedConfigs = await updateMeshConfiguration(config);
            setLoadedConfigs(updatedConfigs);
            onConfigUpdate(currentMesh.name, config);
            
            // Update mesh metadata
            if (currentMesh.metadata) {
                currentMesh.metadata.config = config;
                currentMesh.metadata.buildingLabel = config.buildingLabel;
                currentMesh.metadata.capsuleColor = config.capsuleColor;
                currentMesh.metadata.glowColor = config.glowColor;
            } else {
                currentMesh.metadata = {
                    config,
                    buildingLabel: config.buildingLabel,
                    capsuleColor: config.capsuleColor,
                    glowColor: config.glowColor
                };
            }
            
            setSaveStatus(`Configuration saved for ${currentMesh.name}`);
            setSavedConfigCount(updatedConfigs.length);
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    // Apply to all meshes - with confirmation
    const handleApplyToAll = async () => {
        if (!config) return;
        
        if (window.confirm('Are you sure you want to apply this configuration to all meshes? This will override any existing configurations.')) {
            let updatedCount = 0;
            const updatedConfigs: MeshConfig[] = [];
            
            for (const mesh of meshList) {
                const meshConfig = {
                    ...config,
                    meshName: mesh.name
                };
                const result = await updateMeshConfiguration(meshConfig);
                updatedConfigs.push(...result);
                onConfigUpdate(mesh.name, meshConfig);
                updatedCount++;
                
                // Update mesh metadata
                if (mesh.metadata) {
                    mesh.metadata.config = meshConfig;
                    mesh.metadata.buildingLabel = meshConfig.buildingLabel;
                    mesh.metadata.capsuleColor = meshConfig.capsuleColor;
                    mesh.metadata.glowColor = meshConfig.glowColor;
                } else {
                    mesh.metadata = {
                        config: meshConfig,
                        buildingLabel: meshConfig.buildingLabel,
                        capsuleColor: meshConfig.capsuleColor,
                        glowColor: meshConfig.glowColor
                    };
                }
            }
            
            setLoadedConfigs(updatedConfigs);
            setSaveStatus(`Configuration applied to all ${updatedCount} meshes`);
            setSavedConfigCount(updatedConfigs.length);
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    // Reset to default configurations
    const handleResetDefaults = async () => {
        if (window.confirm('Are you sure you want to reset all configurations to defaults? This cannot be undone.')) {
            const defaultConfigs = await resetToDefaultConfigurations();
            setLoadedConfigs(defaultConfigs);
            setSavedConfigCount(defaultConfigs.length);
            
            // Update any currently loaded meshes that match default configs
            meshList.forEach(mesh => {
                const defaultConfig = defaultConfigs.find(c => c.meshName === mesh.name);
                if (defaultConfig) {
                    onConfigUpdate(mesh.name, defaultConfig);
                }
            });
            
            // If a mesh is selected, update its config display
            if (currentMesh) {
                const updatedConfig = defaultConfigs.find(c => c.meshName === currentMesh.name) || 
                    getDefaultMeshConfig(currentMesh.name);
                setConfig(updatedConfig);
            }
            
            setSaveStatus('All configurations reset to defaults');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    // Export configurations
    const handleExportConfigs = () => {
        try {
            const dataStr = JSON.stringify(loadedConfigs, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'mesh-configurations.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            setSaveStatus('Configurations exported successfully');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Error exporting configurations:', error);
            setSaveStatus('Error exporting configurations');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    // Import configurations
    const handleImportConfigs = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedConfigs = JSON.parse(e.target?.result as string);
                
                if (Array.isArray(importedConfigs) && importedConfigs.every(config => 
                    typeof config === 'object' && 
                    'meshName' in config && 
                    'capsuleColor' in config && 
                    'glowColor' in config && 
                    'buildingLabel' in config && 
                    'category' in config
                )) {
                    // Valid configuration format
                    const updatedConfigs: MeshConfig[] = [];
                    for (const config of importedConfigs) {
                        const result = await updateMeshConfiguration(config);
                        updatedConfigs.push(...result);
                    }
                    
                    setLoadedConfigs(updatedConfigs);
                    setSavedConfigCount(updatedConfigs.length);
                    
                    // Update any currently loaded meshes that match imported configs
                    meshList.forEach(mesh => {
                        const importedConfig = importedConfigs.find(c => c.meshName === mesh.name);
                        if (importedConfig) {
                            onConfigUpdate(mesh.name, importedConfig);
                        }
                    });
                    
                    // If a mesh is selected, update its config display
                    if (currentMesh) {
                        const updatedConfig = updatedConfigs.find(c => c.meshName === currentMesh.name) || 
                            getDefaultMeshConfig(currentMesh.name);
                        setConfig(updatedConfig);
                    }
                    
                    setSaveStatus(`Imported ${importedConfigs.length} configurations`);
                } else {
                    setSaveStatus('Invalid configuration format');
                }
            } catch (error) {
                console.error('Error importing configurations:', error);
                setSaveStatus('Error importing configurations');
            }
            
            // Clear the input
            event.target.value = '';
            
            setTimeout(() => setSaveStatus(null), 3000);
        };
        
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="mesh-config-screen">
            <div className="mesh-config-container">
                <div className="mesh-config-header">
                    <h2>Mesh Configuration</h2>
                    <div className="config-actions">
                        <span className="config-count">
                            {savedConfigCount} saved configurations
                        </span>
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>
                </div>
                
                <div className="config-management">
                    <button className="export-button" onClick={handleExportConfigs}>
                        Export Configurations
                    </button>
                    <label className="import-button">
                        Import Configurations
                        <input 
                            type="file" 
                            accept=".json" 
                            style={{ display: 'none' }} 
                            onChange={handleImportConfigs}
                        />
                    </label>
                    <button className="reset-button" onClick={handleResetDefaults}>
                        Reset to Defaults
                    </button>
                </div>
                
                <div className="mesh-list-section">
                    <h3>Available Meshes</h3>
                    <p className="config-instructions">
                        Select a mesh from the list below to configure its appearance. 
                        Changes will only be applied when you click "Save Configuration".
                        <strong> Configurations are saved to the database and will persist between sessions.</strong>
                    </p>
                    <div className="mesh-list">
                        {meshList.map((mesh, index) => {
                            const isConfigured = loadedConfigs.some(c => c.meshName === mesh.name);
                            return (
                                <div 
                                    key={index} 
                                    className={`mesh-item ${currentMesh?.name === mesh.name ? 'selected' : ''}`}
                                    onClick={() => handleMeshSelect(mesh)}
                                >
                                    <span className="mesh-item-name">{mesh.name}</span>
                                    {isConfigured && (
                                        <span className="mesh-item-configured" title="This mesh has a saved configuration">✓</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {config && (
                    <div className="config-form">
                        <h3>Configure {currentMesh?.name}</h3>
                        
                        <div className="form-group">
                            <label>Building Label:</label>
                            <input 
                                type="text" 
                                name="buildingLabel" 
                                value={config.buildingLabel} 
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Capsule Color:</label>
                            <div className="color-input-container">
                                <input 
                                    type="color" 
                                    name="capsuleColor" 
                                    value={config.capsuleColor} 
                                    onChange={handleInputChange}
                                />
                                <input 
                                    type="text" 
                                    name="capsuleColor" 
                                    value={config.capsuleColor} 
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Glow Color:</label>
                            <div className="color-input-container">
                                <input 
                                    type="color" 
                                    name="glowColor" 
                                    value={config.glowColor} 
                                    onChange={handleInputChange}
                                />
                                <input 
                                    type="text" 
                                    name="glowColor" 
                                    value={config.glowColor} 
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Category:</label>
                            <select 
                                name="category" 
                                value={config.category} 
                                onChange={handleInputChange}
                            >
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {saveStatus && (
                            <div className="save-status">
                                {saveStatus}
                            </div>
                        )}
                        
                        <div className="button-group">
                            <button className="save-button" onClick={handleSave}>
                                Save Configuration
                            </button>
                            <button className="apply-all-button" onClick={handleApplyToAll}>
                                Apply to All Meshes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeshConfigurationScreen; 