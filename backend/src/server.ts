import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import Grid from 'gridfs-stream';
import cors from 'cors';
import { GridFSBucket } from 'mongodb';

const app = express();
const port = 3000;

// Add this near the top, after imports
mongoose.set('strictQuery', false);

// MongoDB connection
const mongoURI = 'mongodb://127.0.0.1:27017/3d-models';
let gfs: Grid.Grid;
let gridfsBucket: GridFSBucket;

mongoose.connect(mongoURI).then(() => {
    console.log('MongoDB connected successfully');
    
    // Initialize GridFS bucket
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
    });
    
    // Initialize GridFS stream
    // @ts-ignore
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
    
    console.log('GridFS initialized');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Create GridFS storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            filename: `${Date.now()}_${file.originalname}`,
            bucketName: 'uploads'
        };
    },
    options: {
        useUnifiedTopology: true
    }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Upload model
app.post('/api/models', upload.single('file'), async (req, res) => {
    try {
        const { preview } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Uploading file:', {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        });

        // Wait a moment for GridFS to finish saving
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify the file was saved in GridFS
        if (!gfs) {
            throw new Error('GridFS not initialized');
        }

        const savedFile = await gfs.files.findOne({ filename: file.filename });
        console.log('Saved file in GridFS:', savedFile);

        if (!savedFile) {
            throw new Error('File not saved to GridFS');
        }

        const model = await ModelMetadata.create({
            name: file.originalname,
            preview,
            path: file.filename,
            lastModified: Date.now()
        });

        console.log('Created model metadata:', model);
        res.status(201).json(model);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading model' });
    }
});

// Get all models
app.get('/api/models', async (req, res) => {
    try {
        const models = await ModelMetadata.find();
        res.json(models);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching models' });
    }
});

// Get model file
app.get('/api/models/file/:filename', async (req, res) => {
    try {
        if (!gridfsBucket) {
            return res.status(500).json({ error: 'Database connection not ready' });
        }

        console.log('Requested filename:', req.params.filename);

        // List all files in GridFS for debugging
        const allFiles = await gfs.files.find().toArray();
        console.log('All files in GridFS:', allFiles.map(f => f.filename));

        const file = await gfs.files.findOne({ filename: req.params.filename });
        console.log('Found file:', file);

        if (!file) {
            return res.status(404).json({ 
                error: 'File not found',
                requestedFilename: req.params.filename,
                availableFiles: allFiles.map(f => f.filename)
            });
        }

        res.set('Content-Type', file.contentType || 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

        // Use GridFSBucket for streaming with openDownloadStream
        const downloadStream = gridfsBucket.openDownloadStream(file._id);
        downloadStream.pipe(res);

        downloadStream.on('error', (error: Error) => {
            console.error('Stream error:', error);
            res.status(500).json({ error: 'Error streaming file' });
        });
    } catch (error) {
        console.error('File fetch error:', error);
        res.status(500).json({ error: 'Error fetching file' });
    }
});

// Delete model
app.delete('/api/models/:id', async (req, res) => {
    try {
        if (!gfs) {
            return res.status(500).json({ error: 'Database connection not ready' });
        }

        const model = await ModelMetadata.findById(req.params.id);
        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }

        await gfs.files.deleteOne({ filename: model.path });
        await ModelMetadata.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'Model deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Error deleting model' });
    }
});

// Debug endpoint to list all files in GridFS
app.get('/api/debug/files', async (req, res) => {
    try {
        if (!gfs) {
            return res.status(500).json({ error: 'Database connection not ready' });
        }

        const files = await gfs.files.find().toArray();
        res.json({
            filesCount: files.length,
            files: files.map(f => ({
                filename: f.filename,
                size: f.length,
                uploadDate: f.uploadDate
            }))
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ error: 'Error listing files' });
    }
});

// MongoDB Model Schema
const ModelMetadataSchema = new mongoose.Schema({
    name: String,
    preview: String,
    path: String,
    lastModified: Number
});

const ModelMetadata = mongoose.model('ModelMetadata', ModelMetadataSchema);

// Default mesh configurations
const defaultConfigurations = [
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

// MeshConfig Schema
const MeshConfigSchema = new mongoose.Schema({
    meshName: { type: String, required: true, unique: true },
    capsuleColor: { type: String, required: true },
    glowColor: { type: String, required: true },
    buildingLabel: { type: String, required: true },
    category: { type: String, required: true }
});

const MeshConfig = mongoose.model('MeshConfig', MeshConfigSchema);

// Get all mesh configurations
app.get('/api/mesh-configs', async (req, res) => {
    try {
        const configs = await MeshConfig.find();
        res.json(configs);
    } catch (error) {
        console.error('Error fetching mesh configs:', error);
        res.status(500).json({ error: 'Error fetching mesh configurations' });
    }
});

// Update or create mesh configuration
app.post('/api/mesh-configs', async (req, res) => {
    try {
        const config = req.body;
        const updatedConfig = await MeshConfig.findOneAndUpdate(
            { meshName: config.meshName },
            config,
            { new: true, upsert: true }
        );
        res.json(updatedConfig);
    } catch (error) {
        console.error('Error updating mesh config:', error);
        res.status(500).json({ error: 'Error updating mesh configuration' });
    }
});

// Reset to default configurations
app.post('/api/mesh-configs/reset', async (req, res) => {
    try {
        await MeshConfig.deleteMany({});
        await MeshConfig.insertMany(defaultConfigurations);
        const configs = await MeshConfig.find();
        res.json(configs);
    } catch (error) {
        console.error('Error resetting mesh configs:', error);
        res.status(500).json({ error: 'Error resetting mesh configurations' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 