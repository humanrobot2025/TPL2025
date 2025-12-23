import React, { useState } from 'react';

export default function AdminUnlockForm({ onUnlock, showExampleLink }: { onUnlock: (key: string) => void; showExampleLink?: boolean }) {
  const [key, setKey] = useState('');
  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-2">
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin token" className="bg-gray-900 text-white p-2 rounded w-60" />
        <button onClick={() => onUnlock(key)} className="bg-yellow-400 text-black px-4 py-2 rounded">Unlock</button>
      </div>
      {showExampleLink && (
        <p className="text-xs text-gray-400 mt-3">Example share link: <code className="bg-white/5 px-2 py-1 rounded">https://your-site/#/admin?key=YOUR_TOKEN</code></p>
      )}
    </div>
  );
}
