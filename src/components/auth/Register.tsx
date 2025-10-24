import React, { useState } from 'react';
import { signUp } from '../../lib/auth';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface RegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  onError: (message: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      onError('Mohon isi semua field');
      return;
    }

    if (password !== confirmPassword) {
      onError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      onError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.message?.includes('already registered')
        ? 'Email sudah terdaftar'
        : error.message?.includes('duplicate key')
        ? 'Email sudah digunakan'
        : error.message?.includes('violates')
        ? 'Terjadi kesalahan validasi data'
        : 'Registrasi gagal. Coba lagi.';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Buat Akun Admin</h1>
          <p className="text-gray-600">Daftar untuk mengakses sistem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="Konfirmasi Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="w-full" loading={loading}>
            Daftar
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Sudah punya akun? <span className="font-medium">Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
