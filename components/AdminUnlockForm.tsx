import React, { useEffect, useState } from 'react';

export default function AdminUnlockForm({ onUnlock, showExampleLink }: { onUnlock: (key: string) => void; showExampleLink?: boolean }) {
  const [key, setKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fb = await import('../src/firebaseClient').catch(() => ({}));
        if (fb && fb.getActiveFirebase) setFirebaseAvailable(true);
      } catch (e) {}
    })();
  }, []);

  const signInWithEmail = async () => {
    setAuthError(null);
    try {
      const { getAuth, signInWithEmailAndPassword, getIdTokenResult } = await import('firebase/auth');
      const auth = getAuth();
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await getIdTokenResult(userCred.user, true as any);
      const claims: any = idToken.claims || {};
      if (claims.admin) {
        try { sessionStorage.setItem('tpl_admin_key', 'firebase-admin'); } catch (e) {}
        window.location.reload();
      } else {
        setAuthError('Signed in but not an admin');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Sign-in failed');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-2">
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin token" className="bg-gray-900 text-white p-2 rounded w-60" />
        <button onClick={() => onUnlock(key)} className="bg-yellow-400 text-black px-4 py-2 rounded">Unlock</button>
      </div>

      {firebaseAvailable && (
        <div className="mt-4 max-w-sm mx-auto text-sm text-gray-300">
          <div className="mb-2">Or sign in with Firebase (admin account):</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-900 text-white p-2 rounded w-full mb-2" placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="bg-gray-900 text-white p-2 rounded w-full mb-2" placeholder="Password" />
          <div className="flex gap-2">
            <button onClick={signInWithEmail} className="px-3 py-2 bg-yellow-400 text-black rounded-md font-bold">Sign in</button>
            <div className="text-xs text-red-400 mt-2">{authError}</div>
          </div>
        </div>
      )}

      {showExampleLink && (
        <p className="text-xs text-gray-400 mt-3">Example share link: <code className="bg-white/5 px-2 py-1 rounded">https://your-site/#/admin?key=YOUR_TOKEN</code></p>
      )}
    </div>
  );
}
