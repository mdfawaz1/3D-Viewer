
export interface StoredModel {
    id: string;
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
            return await response.json();
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
        try {
            const response = await fetch(`${this.API_URL}/models/${id}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting model:', error);
            return false;
        }
    }
}

export const fileSystemService = new FileSystemService(); 