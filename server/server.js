// server/server.js

// --- 1. Dependencies ---
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Required for connecting from the React client

const app = express();
const PORT = 3000;

// --- 2. Middleware ---
// Enable CORS for the client running on a different port (e.g., 5173)
const corsOptions = {
    origin: 'http://localhost:5173', // Adjust if your client port changes
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // Body parser for application/json

// --- 3. MongoDB Connection ---
// !!! IMPORTANT: REPLACE THIS WITH YOUR ACTUAL MONGODB CONNECTION STRING !!!
const MONGO_URI = 'mongodb://localhost:27017/cognitive_canvas_db'; 
// Example Atlas URI: 'mongodb+srv://user:password@clustername.mongodb.net/cognitive_canvas_db?retryWrites=true&w=majority'

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connection successful.');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        // Exit process with failure
        process.exit(1); 
    });

// --- 4. Mongoose Schema and Model ---
const thoughtSchema = new mongoose.Schema({
    text: { 
        type: String, 
        required: true,
        trim: true
    },
    // The position property will be used later for Mind-Map POC
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Thought = mongoose.model('Thought', thoughtSchema);

// --- 5. REST API Endpoints (Routes) ---

// POST /api/thoughts (CREATE)
app.post('/api/thoughts', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Thought text is required.' });
        }
        
        const newThought = new Thought({ text });
        await newThought.save();
        
        res.status(201).json(newThought); 
    } catch (error) {
        console.error('Error creating thought:', error);
        res.status(500).json({ message: 'Server error: Could not save thought.' });
    }
});

// GET /api/thoughts (READ ALL)
app.get('/api/thoughts', async (req, res) => {
    try {
        // Fetch all thoughts, sort by creation date descending
        const thoughts = await Thought.find().sort({ createdAt: -1 });
        res.status(200).json(thoughts);
    } catch (error) {
        console.error('Error fetching thoughts:', error);
        res.status(500).json({ message: 'Server error: Could not retrieve thoughts.' });
    }
});

// PUT /api/thoughts/:id (UPDATE)
app.put('/api/thoughts/:id', async (req, res) => {
    try {
        const { text } = req.body;
        const thoughtId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(thoughtId)) {
            return res.status(400).json({ message: 'Invalid Thought ID.' });
        }
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Thought text is required for update.' });
        }
        
        const updatedThought = await Thought.findByIdAndUpdate(
            thoughtId,
            { text },
            { new: true, runValidators: true } // {new: true} returns the updated document
        );

        if (!updatedThought) {
            return res.status(404).json({ message: 'Thought not found.' });
        }
        
        res.status(200).json(updatedThought);
    } catch (error) {
        console.error('Error updating thought:', error);
        res.status(500).json({ message: 'Server error: Could not update thought.' });
    }
});

// DELETE /api/thoughts/:id (DELETE)
app.delete('/api/thoughts/:id', async (req, res) => {
    try {
        const thoughtId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(thoughtId)) {
            return res.status(400).json({ message: 'Invalid Thought ID.' });
        }
        
        const deletedThought = await Thought.findByIdAndDelete(thoughtId);

        if (!deletedThought) {
            return res.status(404).json({ message: 'Thought not found.' });
        }
        
        // Respond with the ID of the deleted item
        res.status(200).json({ _id: thoughtId, message: 'Thought deleted successfully.' });
    } catch (error) {
        console.error('Error deleting thought:', error);
        res.status(500).json({ message: 'Server error: Could not delete thought.' });
    }
});


// --- 6. Server Initialization ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Client will connect to this server from http://localhost:5173`);
});
