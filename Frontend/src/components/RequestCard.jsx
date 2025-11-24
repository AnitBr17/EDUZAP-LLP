import React from 'react';
import { formatDate, isRecent } from '../utils/format';
export default function RequestCard({ item, onDelete }) {
  const recent = isRecent(item.timestamp, 60);

  // image path: if it's a relative path (starts with /uploads) prepend API base using window.location.origin if needed.
  const imgSrc = item.image && item.image.startsWith('/') ? `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}${item.image}` : item.image;

  return (
    <div className={`p-4 rounded-lg shadow-sm border ${recent ? 'bg-yellow-50' : 'bg-white'}`}>
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {imgSrc ? (
            <img src={imgSrc} alt={item.title} className="object-cover w-full h-full" />
          ) : <div className="text-xs text-gray-500">No Image</div>}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-gray-700">{item.name} • {item.phone}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(item.timestamp)}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button onClick={() => onDelete(item._id)} className="text-sm px-3 py-1 rounded bg-red-500 text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}
