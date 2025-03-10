export interface StoredModel {
    id?: string;
    _id?: string;
    name: string;
    preview: string;
    path: string;
    lastModified: number;
}

class FileSystemService {
    private readonly API_URL = 'http://localhost:3000/api'; // Adjust this to your backend URL

    async initializeStorage(): Promise<void> {
        try {
            // Check if API is accessible
            await fetch(`${this.API_URL}/health`);
        } catch (error) {
            console.error('Error connecting to backend:', error);
        }
    }

    async saveModel(file: File, preview: string): Promise<StoredModel> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('preview', preview);
        formData.append('name', file.name);

        try {
            const response = await fetch(`${this.API_URL}/models`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const modelData: StoredModel = await response.json();
            return modelData;
        } catch (error) {
            console.error('Error saving model:', error);
            throw error;
        }
    }

    async loadStoredModels(): Promise<StoredModel[]> {
        try {
            const response = await fetch(`${this.API_URL}/models`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const models = await response.json();
            // Map MongoDB _id to id for consistency
            return models.map((model: StoredModel) => ({
                ...model,
                id: model._id // Ensure id is always available
            }));
        } catch (error) {
            console.error('Error loading models:', error);
            return [];
        }
    }

    async loadFile(path: string): Promise<File | null> {
        try {
            const response = await fetch(`${this.API_URL}/models/file/${path}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            return new File([blob], path.split('_').pop() || 'model');
        } catch (error) {
            console.error('Error loading file:', error);
            return null;
        }
    }

    async deleteModel(id: string): Promise<boolean> {
        console.log('FileSystemService: Deleting model with ID:', id);
        
        if (!id) {
            console.error('FileSystemService: No model ID provided for deletion');
            return false;
        }

        try {
            const url = `${this.API_URL}/models/${encodeURIComponent(id)}`;
            console.log('FileSystemService: Sending DELETE request to:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('FileSystemService: Delete response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('FileSystemService: Error deleting model:', errorData);
                return false;
            }

            return true;
        } catch (error) {
            console.error('FileSystemService: Error in deleteModel:', error);
            return false;
        }
    }
}

export const fileSystemService = new FileSystemService(); 