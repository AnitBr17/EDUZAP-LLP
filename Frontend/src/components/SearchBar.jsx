import React, { useState } from 'react';
export default function SearchBar({ onSearch, onClear }) {
  const [q, setQ] = useState('');
  return (
    <div className="flex gap-2 items-center">
      <input
        placeholder="Search by title..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="border rounded px-3 py-2 w-64"
      />
      <button onClick={() => onSearch(q)} className="px-3 py-2 bg-blue-600 text-white rounded">Search</button>
      <button onClick={() => { setQ(''); onClear(); }} className="px-3 py-2 border rounded">Clear</button>
    </div>
  );
}
