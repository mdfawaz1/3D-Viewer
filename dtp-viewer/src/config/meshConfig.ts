export interface MeshConfig {
    meshName: string;
    capsuleColor: string;
    glowColor: string;
    buildingLabel: string;
    category: string;
}

// Initial default configurations
const defaultConfigurations: MeshConfig[] = [
    {
        meshName: 'G-__559191_G-__559191_Material',
        capsuleColor: '#10B981',
        glowColor: '#00FF00',
        buildingLabel: 'Building',
        category: 'fire-safety'
    },
    {
        meshName: 'G-__564663_G-__564663_Material',
        capsuleColor: '#EF4444',
        glowColor: '#FF0000',
        buildingLabel: 'Factory',
        category: 'acmv'
    },
    {
        meshName: 'G-__562197_G-__562197_Material',
        capsuleColor: '#F97316',
        glowColor: '#FFA500',
        buildingLabel: 'Warehouse',
        category: 'operations'
    },
    {
        meshName: 'New York_primitive131',
        capsuleColor: '#F97316',
        glowColor: '#FFA500',
        buildingLabel: 'Warehouse',
        category: 'operations'
    },
    {
        meshName: 'node9654',
        capsuleColor: '#F97316',
        glowColor: '#FFA500',
        buildingLabel: 'Warehouse',
        category: 'operations'
    },
    {
        meshName: 'node6437',
        capsuleColor: '#10B981',
        glowColor: '#00FF00',
        buildingLabel: 'Warehouse',
        category: 'operations'
    },
    {
        meshName: "building1",
        buildingLabel: "Building 1",
        capsuleColor: "#00C4FF",
        glowColor: "#00C4FF",
        category: "fire-safety"
    },
    {
        meshName: "LOD3_055",
        buildingLabel: "Building 2",
        capsuleColor: "#FF4400",
        glowColor: "#FF4400",
        category: "acmv"
    }
];

// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Store configurations in memory
export let meshConfigurations: MeshConfig[] = [];

// Load configurations from the server
export const loadMeshConfigurations = async (): Promise<MeshConfig[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/mesh-configs`);
        if (!response.ok) {
            throw new Error('Failed to fetch configurations');
        }
        meshConfigurations = await response.json();
        return meshConfigurations;
    } catch (error) {
        console.error('Error loading mesh configurations:', error);
        return [...defaultConfigurations];
    }
};

// Initialize configurations
loadMeshConfigurations().catch(console.error);

// Function to update or add a mesh configuration
export const updateMeshConfiguration = async (config: MeshConfig): Promise<MeshConfig[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/mesh-configs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            throw new Error('Failed to update configuration');
        }

        // Reload configurations from server
        return await loadMeshConfigurations();
    } catch (error) {
        console.error('Error updating mesh configuration:', error);
        return meshConfigurations;
    }
};

// Function to get default configuration for a new mesh
export const getDefaultMeshConfig = (meshName: string): MeshConfig => {
    return {
        meshName,
        capsuleColor: '#3B82F6', // Default blue color
        glowColor: '#60A5FA',
        buildingLabel: meshName.split('_')[0] || 'Building',
        category: 'default'
    };
};

// Function to reset configurations to defaults
export const resetToDefaultConfigurations = async (): Promise<MeshConfig[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/mesh-configs/reset`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to reset configurations');
        }

        meshConfigurations = await response.json();
        return meshConfigurations;
    } catch (error) {
        console.error('Error resetting mesh configurations:', error);
        return [...defaultConfigurations];
    }
}; 