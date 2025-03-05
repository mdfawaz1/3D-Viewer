import React from 'react';
import * as BABYLON from 'babylonjs';

interface MeshProperties {
    "Basic Properties": {
        Name: string;
        "Unique ID": number;
        Visible: boolean;
        Enabled: boolean;
        Pickable: boolean;
    };
    Transform: {
        Position: string;
        Rotation: string;
        Scaling: string;
    };
    Geometry: {
        "Vertices Count": number;
        "Faces Count": number;
        "Bounding Box Min": string;
        "Bounding Box Max": string;
    };
    Material?: {
        Name: string;
        Type: string;
        Alpha: number;
    };
}

interface PropertyPanelProps {
    properties: MeshProperties | null;
    onClose: () => void;
    scene: BABYLON.Scene | null;
    mesh: BABYLON.AbstractMesh | null;
    updateMeshColors: (mesh: BABYLON.AbstractMesh, capsuleColor: string, glowColor: string) => void;
}

const getMeshProperties = (mesh: BABYLON.AbstractMesh): MeshProperties => {
    const pos = mesh.position;
    const rot = mesh.rotation;
    const scale = mesh.scaling;
    const bbox = mesh.getBoundingInfo().boundingBox;
    const properties: MeshProperties = {
        "Basic Properties": {
            "Name": mesh.name,
            "Unique ID": mesh.uniqueId,
            "Visible": mesh.isVisible,
            "Enabled": mesh.isEnabled(),
            "Pickable": mesh.isPickable
        },
        Transform: {
            "Position": `X: ${pos.x.toFixed(3)}, Y: ${pos.y.toFixed(3)}, Z: ${pos.z.toFixed(3)}`,
            "Rotation": `X: ${rot.x.toFixed(3)}, Y: ${rot.y.toFixed(3)}, Z: ${rot.z.toFixed(3)}`,
            "Scaling": `X: ${scale.x.toFixed(3)}, Y: ${scale.y.toFixed(3)}, Z: ${scale.z.toFixed(3)}`
        },
        Geometry: {
            "Vertices Count": mesh.getTotalVertices(),
            "Faces Count": (mesh.getTotalIndices() / 3) || 0,
            "Bounding Box Min": `X: ${bbox.minimum.x.toFixed(3)}, Y: ${bbox.minimum.y.toFixed(3)}, Z: ${bbox.minimum.z.toFixed(3)}`,
            "Bounding Box Max": `X: ${bbox.maximum.x.toFixed(3)}, Y: ${bbox.maximum.y.toFixed(3)}, Z: ${bbox.maximum.z.toFixed(3)}`
        }
    };
    if (mesh.material) {
        properties.Material = {
            "Name": mesh.material.name,
            "Type": mesh.material.getClassName(),
            "Alpha": mesh.material.alpha
        };
    }
    return properties;
};

const PropertyPanel: React.FC<PropertyPanelProps> = ({ properties, onClose, scene, mesh, updateMeshColors }) => {
    if (!properties) return null;

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(properties, null, 2));
        const link = document.createElement('a');
        link.setAttribute("href", dataStr);
        link.setAttribute("download", properties["Basic Properties"]["Name"] + "_properties.json");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleCapsuleColorChange = (color: string) => {
        if (mesh?.metadata) {
            updateMeshColors(mesh, color, mesh.metadata.glowColor);
            mesh.metadata.capsuleColor = color;
        }
    };

    const handleGlowColorChange = (color: string) => {
        if (mesh?.metadata) {
            updateMeshColors(mesh, mesh.metadata.capsuleColor, color);
            mesh.metadata.glowColor = color;
        }
    };

    const renderProperties = () => {
        return Object.entries(properties).map(([category, props]: [string, any]) => (
            <div key={category} className="property-section">
                <div className="property-category">{category}</div>
                <div className="property-grid">
                    {Object.entries(props).map(([key, value]: [string, any]) => (
                        <div key={key} className="property-row">
                            <span className="property-label">{key}</span>
                            <span className="property-value">{String(value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <div className="property-panel">
            <div className="property-panel-header">
                <span className="panel-title">Properties</span>
                <button className="close-button" onClick={onClose}>×</button>
            </div>
            <div className="property-panel-content">
                {renderProperties()}
                {mesh?.metadata && (
                    <div className="property-section">
                        <div className="property-category">Colors</div>
                        <div className="color-controls">
                            <div className="color-row">
                                <input 
                                    type="color" 
                                    value={mesh.metadata.capsuleColor}
                                    onChange={(e) => handleCapsuleColorChange(e.target.value)}
                                />
                                <span className="color-label">Capsule</span>
                            </div>
                            <div className="color-row">
                                <input 
                                    type="color" 
                                    value={mesh.metadata.glowColor}
                                    onChange={(e) => handleGlowColorChange(e.target.value)}
                                />
                                <span className="color-label">Glow</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="property-panel-footer">
                <button className="export-button" onClick={handleExport}>
                    <span>↓</span>Export
                </button>
            </div>
        </div>
    );
};

export { PropertyPanel as default, getMeshProperties, type MeshProperties }; 