import React from 'react';
export default function StatsWidget({ requests }) {
    const total = requests.length;
    const today = requests.filter(r => {
        const d = new Date(r.timestamp);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length;

    const titleCounts = requests.reduce((acc, r) => {
        const key = r.title || 'Untitled';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    const duplicates = Object.entries(titleCounts).filter(([t, c]) => c > 1).sort((a, b) => b[1] - a[1]);

    return (
        <div className="p-4 bg-white shadow rounded">
            <div className="text-sm text-gray-600">Total Requests: <strong>{total}</strong></div>
            <div className="text-sm text-gray-600">Today's: <strong>{today}</strong></div>
            <div className="mt-3">
                <h4 className="font-semibold text-sm">Title Stats</h4>
                {duplicates.length === 0 ? <div className="text-xs text-gray-500">No duplicates</div> :
                    <ul className="text-xs mt-2">
                        {duplicates.map(([title, count]) => (<li key={title}>{title}: {count}</li>))}
                    </ul>
                }
            </div>
        </div>
    );
}
