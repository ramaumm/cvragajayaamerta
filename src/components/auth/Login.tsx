import React, { useState } from 'react';
import { loginWithPin } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface LoginProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onError }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pin || pin.length < 4) {
      onError('PIN harus minimal 4 digit');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithPin(pin);
      refreshUser();
      onSuccess(`Selamat datang, ${user.username}!`);
    } catch (error: any) {
      onError(error.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="CV Raga Jaya Amerta"
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            CV Raga Jaya Amerta
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="PIN"
              type="password"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPin(value);
              }}
              placeholder="Masukkan PIN Anda"
              required
              maxLength={6}
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
