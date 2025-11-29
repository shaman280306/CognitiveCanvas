// src/ThoughtsComponent.jsx
import React, { useEffect, useState } from 'react';

export default function ThoughtsComponent() {
  const [text, setText] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const API = 'http://127.0.0.1:3000/api/thoughts';

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error('fetchList error:', err);
      alert('Could not load thoughts. See console for details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      setList(prev => [saved, ...prev]); // show immediately
      setText('');
    } catch (err) {
      console.error('save error:', err);
      alert('Could not save. See console.');
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: 'Arial, sans-serif' }}>
      <h2>Thoughts</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a thought..."
          style={{ padding: 8, width: '60%' }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: '8px 12px' }}>Save</button>
        <button
          type="button"
          onClick={fetchList}
          style={{ marginLeft: 8, padding: '8px 12px' }}
        >
          Refresh
        </button>
      </form>

      {loading ? <div>Loading…</div> : (
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {list.map(t => (
            <li key={t._id} style={{ margin: '8px 0', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
              <div style={{ fontSize: 16 }}>{t.text}</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {new Date(t.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}