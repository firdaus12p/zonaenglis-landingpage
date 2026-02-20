import React, { useState } from 'react';
import { useBridgeAuth } from '../../contexts/BridgeAuthContext';
import { BrainCircuit } from 'lucide-react'; // assuming lucide-react is installed, as per project context

export const BridgeCardsLogin: React.FC = () => {
  const [credentials, setCredentials] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useBridgeAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!credentials || !pin) {
      setError('Harap isi ID/Email dan PIN Anda.');
      return;
    }

    try {
      await login(credentials.trim(), pin.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-50 rounded-full">
            <BrainCircuit className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Bridge Cards Portal</h1>
          <p className="text-slate-500 text-sm">Masuk dengan akun Siswa Zona English Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3">
             <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="credentials" className="block text-sm font-medium text-slate-700 mb-1">
              Student ID / Email
            </label>
            <input
              id="credentials"
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan Student ID atau Email"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-slate-700 mb-1">
              PIN Akses
            </label>
            <input
              id="pin"
              type="password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Jika Anda belum memiliki akses, hubungi Admin Zona English.</p>
        </div>
      </div>
    </div>
  );
};
