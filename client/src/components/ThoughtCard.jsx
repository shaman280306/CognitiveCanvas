// client/src/components/ThoughtCard.jsx
import React, { useState } from 'react';

const ThoughtCard = ({ thought, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(thought.text);

    // Handles the update action
    const handleSave = () => {
        if (editText.trim() && editText !== thought.text) {
            // Call the parent handler with the thought's ID and new text
            onUpdate(thought._id, editText.trim());
        }
        setIsEditing(false);
    };

    // Handles key press in the edit field (Enter to save, Esc to cancel)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditText(thought.text); // Reset text
            setIsEditing(false);
        }
    };

    const handleDeleteClick = () => {
        if (window.confirm("Are you sure you want to delete this thought?")) {
            onDelete(thought._id);
        }
    }

    // Display mode
    if (!isEditing) {
        return (
            <div 
                key={thought._id} 
                className="thought-card p-4 rounded-xl bg-[#071022]/70 border border-[#ffffff12] hover:shadow-[0_12px_40px_-10px_rgba(96,165,250,0.12)] transition"
            >
                <p className="text-lg pb-4 whitespace-pre-wrap">{thought.text}</p>
                <div className="flex justify-between items-center border-t border-[#ffffff05] pt-2">
                    <span className="text-xs text-gray-500">
                        Added: {new Date(thought.createdAt).toLocaleString()}
                    </span>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition"
                            title="Edit Thought"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={handleDeleteClick}
                            className="text-sm text-red-400 hover:text-red-300 font-medium transition"
                            title="Delete Thought"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Edit mode
    return (
        <div 
            className="thought-card p-4 rounded-xl bg-[#111827] border border-indigo-500/50 shadow-2xl transition"
        >
            <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-24 p-2 bg-gray-800 text-white rounded-lg resize-none focus:ring-2 focus:ring-indigo-400 outline-none"
                autoFocus
                placeholder="Edit your thought..."
            />
            <div className="flex justify-end space-x-3 mt-3">
                <button
                    onClick={() => {
                        setEditText(thought.text); // Reset text
                        setIsEditing(false);
                    }}
                    className="px-3 py-1 text-sm rounded-lg text-gray-400 hover:bg-gray-700 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!editText.trim() || editText === thought.text}
                    className="px-3 py-1 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-500 transition font-semibold"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default ThoughtCard;