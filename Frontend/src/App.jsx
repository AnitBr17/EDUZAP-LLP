import React from 'react';
import RequestList from './components/RequestList';

export default function App() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">EDUZAP L LP — Requests</h1>
        </header>
        <main>
          <RequestList />
        </main>
      </div>
    </div>
  );
}
