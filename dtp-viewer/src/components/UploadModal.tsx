import * as React from "react";
import { Modal } from "uxp/components";
import { fileSystemService, StoredModel } from '../services/FileSystemService';
import { ModelIcon } from './ModelIcon';
import './UploadModal.css';
interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: File) => void;
    loadedModels: StoredModel[];
    onModelSelect: (modelData: StoredModel) => void;
    onModelDelete?: (modelId: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
    isOpen, 
    onClose, 
    onFileSelect,
    loadedModels,
    onModelSelect,
    onModelDelete 
}) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (isValidFileType(file)) {
                onFileSelect(file);
            } else {
                alert("Please upload a valid .glb, .gltf, or .obj file.");
            }
        }
    };

    const isValidFileType = (file: File) => {
        const validTypes = ['.glb', '.gltf', '.obj'];
        return validTypes.some(type => file.name.toLowerCase().endsWith(type));
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length) {
            const file = files[0];
            if (isValidFileType(file)) {
                onFileSelect(file);
            } else {
                alert("Please upload a valid .glb, .gltf, or .obj file.");
            }
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteModel = async (e: React.MouseEvent, model: StoredModel) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Full model data:', model);
        
        // Get the ID from either id or _id field
        const modelId = model.id || model._id;
        
        if (!modelId) {
            console.error('Invalid model data:', model);
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete "${model.name}"?`)) {
            try {
                console.log('Calling deleteModel with ID:', modelId);
                const success = await fileSystemService.deleteModel(modelId);
                console.log('Delete operation result:', success);
                
                if (success) {
                    if (onModelDelete) {
                        onModelDelete(modelId);
                    }
                    console.log('Model deleted successfully');
                } else {
                    console.error('Failed to delete model');
                    alert('Failed to delete the model. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting model:', error);
                alert('Failed to delete the model. Please try again.');
            }
        }
    };

    return (
        <Modal
            show={isOpen}
            onClose={onClose}
            title="3D Model Library"
            className="upload-modal"
        >
            <div className="upload-modal-content">
                <div className="modal-layout">
                    <div className="models-list">
                        <h3>My Models</h3>
                        <div className="models-grid">
                            {loadedModels.map((model) => {
                                const modelId = model.id || model._id;
                                console.log('Rendering model:', model);
                                return (
                                    <div 
                                        key={modelId} 
                                        className="model-card"
                                        onClick={() => onModelSelect(model)}
                                    >
                                        <button 
                                            className="delete-button"
                                            onClick={(e) => handleDeleteModel(e, model)}
                                            type="button"
                                            style={{ zIndex: 10 }}
                                            title="Delete model"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                        <div className="model-preview">
                                            <img src={model.preview} alt={model.name} />
                                        </div>
                                        <div className="model-info">
                                            <span className="model-name">{model.name}</span>
                                            <span className="model-date">
                                                {new Date(model.lastModified).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="upload-sidebar">
                        <div 
                            className={`upload-section ${isDragging ? 'dragging' : ''}`}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleBrowseClick}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".glb,.gltf,.obj"
                                onChange={handleFileUpload}
                                className="file-input"
                            />
                            <div className="upload-dropzone">
                                <div className="upload-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <p className="upload-text">
                                    Drag and drop your 3D model here<br />
                                    <span>or</span><br />
                                    <button className="browse-button">Browse Files</button>
                                </p>
                                <p className="file-types">Supported formats: .glb, .gltf, .obj</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default UploadModal;

