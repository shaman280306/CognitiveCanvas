/* server/server.js — binds to 0.0.0.0 for IPv4 accessibility */

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middleware
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// DB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cognitive_canvas_db';
console.log('Using MONGO_URI startsWith:', typeof MONGO_URI === 'string' ? MONGO_URI.slice(0, 60) : MONGO_URI);

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connection successful ?'))
.catch(err => {
    console.error('MongoDB connection error:', err.message || err);
    console.error('Server will keep running but DB ops will fail until connection is fixed.');
});

// Schema + Model
const thoughtSchema = new mongoose.Schema({
    text: { type: String, required: true, trim: true },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Thought = mongoose.model('Thought', thoughtSchema);

// Routes
app.post('/api/thoughts', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') return res.status(400).json({ message: 'Thought text is required.' });
        const newThought = new Thought({ text });
        await newThought.save();
        res.status(201).json(newThought);
    } catch (error) {
        console.error('Error creating thought:', error);
        res.status(500).json({ message: 'Server error: Could not save thought.' });
    }
});

app.get('/api/thoughts', async (req, res) => {
    try {
        const thoughts = await Thought.find().sort({ createdAt: -1 });
        res.status(200).json(thoughts);
    } catch (error) {
        console.error('Error fetching thoughts:', error);
        res.status(500).json({ message: 'Server error: Could not retrieve thoughts.' });
    }
});

app.put('/api/thoughts/:id', async (req, res) => {
    try {
        const { text } = req.body;
        const thoughtId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(thoughtId)) return res.status(400).json({ message: 'Invalid Thought ID.' });
        if (!text || text.trim() === '') return res.status(400).json({ message: 'Thought text is required for update.' });

        const updatedThought = await Thought.findByIdAndUpdate(thoughtId, { text }, { new: true, runValidators: true });
        if (!updatedThought) return res.status(404).json({ message: 'Thought not found.' });
        res.status(200).json(updatedThought);
    } catch (error) {
        console.error('Error updating thought:', error);
        res.status(500).json({ message: 'Server error: Could not update thought.' });
    }
});

app.delete('/api/thoughts/:id', async (req, res) => {
    try {
        const thoughtId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(thoughtId)) return res.status(400).json({ message: 'Invalid Thought ID.' });

        const deletedThought = await Thought.findByIdAndDelete(thoughtId);
        if (!deletedThought) return res.status(404).json({ message: 'Thought not found.' });
        res.status(200).json({ _id: thoughtId, message: 'Thought deleted successfully.' });
    } catch (error) {
        console.error('Error deleting thought:', error);
        res.status(500).json({ message: 'Server error: Could not delete thought.' });
    }
});

// Server init — bind to IPv4 0.0.0.0
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log('Client will connect to this server from http://localhost:5173');
});
