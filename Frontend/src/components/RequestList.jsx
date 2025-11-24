import React, { useEffect, useState } from 'react';
import RequestCard from './RequestCard';
import SearchBar from './SearchBar';
import StatsWidget from './StatsWidget';
import AddRequestForm from './AddRequestForm';
import { fetchAll, fetchSorted, deleteRequest, API_BASE_URL } from '../api';
import { io } from 'socket.io-client';

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    loadAll();
    const socket = io(API_BASE_URL);
    socket.on('requestAdded', (data) => setRequests(prev => [data, ...prev]));
    socket.on('requestDeleted', (data) => setRequests(prev => prev.filter(r => r._id !== data._id)));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    setFiltered(requests);
    setPage(1);
  }, [requests]);

  const loadAll = async () => {
    try {
      const data = await fetchAll();
      setRequests(data);
    } catch (err) { console.error(err); alert('Error fetching'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return;
    await deleteRequest(id);
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  const handleSearch = (q) => {
    if (!q) { setFiltered(requests); setPage(1); return; }
    const t = q.toLowerCase();
    const res = requests.filter(r => (r.title||'').toLowerCase().includes(t));
    setFiltered(res);
    setPage(1);
  };

  const clearSearch = () => { setFiltered(requests); setPage(1); };

  const toggleSort = async () => {
    try {
      const sorted = await fetchSorted();
      if (!sortAsc) {
        setRequests(sorted);
        setFiltered(sorted);
      } else {
        const reversed = [...sorted].reverse();
        setRequests(reversed);
        setFiltered(reversed);
      }
      setSortAsc(prev => !prev);
      setPage(1);
    } catch (err) { console.error(err); alert('Error sorting'); }
  };

  const start = (page - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between">
            <SearchBar onSearch={handleSearch} onClear={clearSearch} />
            <div className="flex gap-2">
              <button onClick={toggleSort} className="px-3 py-2 border rounded">Sort {sortAsc ? '(A→Z)' : '(Z→A)'}</button>
              <button onClick={() => { loadAll(); }} className="px-3 py-2 bg-gray-100 rounded">Refresh</button>
            </div>
          </div>

          <AddRequestForm onCreated={(r)=> setRequests(prev => [r, ...prev])} />

          <div className="space-y-3">
            {pageItems.map(item => <RequestCard key={item._id} item={item} onDelete={handleDelete} />)}
          </div>

          <div className="flex justify-between items-center">
            <div>Page {page}/{totalPages}</div>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1 border rounded">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <StatsWidget requests={requests} />
        </div>
      </div>
    </div>
  );
}
