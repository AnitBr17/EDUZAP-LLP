import React, { useState } from 'react';
import { createRequestWithImage } from '../api';

export default function AddRequestForm({ onCreated }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [title, setTitle] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!name || !phone || !title) return alert('Name, phone and title are required');
        try {
            setLoading(true);
            const fd = new FormData();
            fd.append('name', name);
            fd.append('phone', phone);
            fd.append('title', title);
            if (imageFile) fd.append('image', imageFile);

            const res = await createRequestWithImage(fd);
            setName(''); setPhone(''); setTitle(''); setImageFile(null);
            if (onCreated) onCreated(res);
        } catch (err) {
            console.error(err);
            alert('Error creating request');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
            <h3 className="font-semibold">Add Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="p-2 border rounded" />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="p-2 border rounded" />
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="p-2 border rounded" />
            </div>
            <div>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={loading} className="px-3 py-2 bg-green-600 text-white rounded">
                    {loading ? 'Adding...' : 'Add Request'}
                </button>
            </div>
        </form>
    );
}
