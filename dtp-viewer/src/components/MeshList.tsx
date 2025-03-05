import * as React from 'react';
import * as BABYLON from 'babylonjs';

interface MeshListProps {
    meshes: BABYLON.AbstractMesh[];
    currentCamera: BABYLON.ArcRotateCamera | BABYLON.UniversalCamera | null;
    scene: BABYLON.Scene | null;
}

const MeshList: React.FC<MeshListProps> = ({ meshes, currentCamera, scene }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [selectedMeshId, setSelectedMeshId] = React.useState<string | null>(null);
    const [originalMaterials] = React.useState(new Map<string, BABYLON.Material | null>());

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const focusOnMesh = (mesh: BABYLON.AbstractMesh) => {
        if (!currentCamera || !scene || !(currentCamera instanceof BABYLON.ArcRotateCamera)) return;

        // Remove highlight from previously selected mesh
        if (selectedMeshId && selectedMeshId !== mesh.id) {
            const prevMesh = meshes.find(m => m.id === selectedMeshId);
            if (prevMesh) {
                const originalMaterial = originalMaterials.get(prevMesh.id);
                if (originalMaterial) {
                    prevMesh.material = originalMaterial;
                }
            }
        }

        // Highlight selected mesh
        setSelectedMeshId(mesh.id);
        if (!originalMaterials.has(mesh.id)) {
            originalMaterials.set(mesh.id, mesh.material);
        }

        const highlightMaterial = new BABYLON.StandardMaterial("highlightMat", scene);
        highlightMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1);
        highlightMaterial.alpha = 0.7;
        mesh.material = highlightMaterial;

        // Get mesh bounding box info
        const boundingBox = mesh.getBoundingInfo().boundingBox;
        const center = boundingBox.centerWorld;
        const size = boundingBox.maximumWorld.subtract(boundingBox.minimumWorld);
        const maxDimension = Math.max(size.x, size.y, size.z);

        // Calculate ideal camera position
        const distance = maxDimension * 2;
        
        // Create animations for smooth transition
        const positionAnimation = new BABYLON.Animation(
            "cameraPosition",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const targetAnimation = new BABYLON.Animation(
            "cameraTarget",
            "target",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const newPosition = new BABYLON.Vector3(
            center.x + distance,
            center.y + distance * 0.5,
            center.z + distance
        );

        positionAnimation.setKeys([
            {
                frame: 0,
                value: currentCamera.position.clone()
            },
            {
                frame: 60,
                value: newPosition
            }
        ]);

        targetAnimation.setKeys([
            {
                frame: 0,
                value: currentCamera.target.clone()
            },
            {
                frame: 60,
                value: center
            }
        ]);

        scene.beginDirectAnimation(
            currentCamera,
            [positionAnimation, targetAnimation],
            0,
            60,
            false,
            1,
            () => {
                currentCamera.radius = distance;
            }
        );
    };

    // Cleanup effect for removing highlights when component unmounts
    React.useEffect(() => {
        return () => {
            meshes.forEach(mesh => {
                const originalMaterial = originalMaterials.get(mesh.id);
                if (originalMaterial) {
                    mesh.material = originalMaterial;
                }
            });
        };
    }, []);

    return (
        <div className={`mesh-list ${!isExpanded ? 'collapsed' : ''}`}>
            <div className="mesh-list-header" onClick={toggleExpand}>
                <h3>Asset list</h3>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
            </div>
            {isExpanded && (
                <div className="mesh-items">
                    {meshes.map((mesh, index) => (
                        <div 
                            key={mesh.id} 
                            className={`mesh-item ${selectedMeshId === mesh.id ? 'selected' : ''}`}
                            onClick={() => focusOnMesh(mesh)}
                        >
                            <span className="mesh-number">{index + 1}</span>
                            <span className="mesh-name">
                                {mesh.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MeshList; 