import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield } from 'lucide-react';
import { getAllUsers, createUser, deleteUser, AppUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface UsersProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export const Users: React.FC<UsersProps> = ({ onError, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', pin: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; userId: string | null; username: string }>({ isOpen: false, userId: null, username: '' });

  useEffect(() => {
    if (currentUser?.is_super_admin) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      onError('Gagal memuat daftar user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.pin) {
      onError('Username dan PIN harus diisi');
      return;
    }

    if (formData.pin.length < 4) {
      onError('PIN harus minimal 4 digit');
      return;
    }

    setSubmitting(true);
    try {
      await createUser(formData.username, formData.pin, currentUser!.id);
      onSuccess(`User ${formData.username} berhasil ditambahkan`);
      setIsModalOpen(false);
      setFormData({ username: '', pin: '' });
      fetchUsers();
    } catch (error: any) {
      onError(error.message || 'Gagal menambahkan user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (userId: string, username: string) => {
    setDeleteConfirmModal({ isOpen: true, userId, username });
  };

  const handleDelete = async () => {
    if (!deleteConfirmModal.userId) return;

    try {
      await deleteUser(deleteConfirmModal.userId);
      onSuccess(`User ${deleteConfirmModal.username} berhasil dihapus`);
      setDeleteConfirmModal({ isOpen: false, userId: null, username: '' });
      await fetchUsers();
    } catch (error: any) {
      onError(error.message || 'Gagal menghapus user');
      setDeleteConfirmModal({ isOpen: false, userId: null, username: '' });
    }
  };

  if (!currentUser?.is_super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Akses ditolak</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola User</h1>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Tambah User
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {user.username}
                      </span>
                      {user.is_super_admin && (
                        <Shield className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_super_admin
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_super_admin ? 'Super Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString('id-ID')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!user.is_super_admin && (
                      <button
                        onClick={() => handleDeleteClick(user.id, user.username)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ username: '', pin: '' });
        }}
        title="Tambah User Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Masukkan username"
            required
          />

          <Input
            label="PIN"
            type="password"
            value={formData.pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, pin: value });
            }}
            placeholder="Masukkan PIN (min. 4 digit)"
            required
            maxLength={6}
          />

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ username: '', pin: '' });
              }}
            >
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              Tambah User
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, userId: null, username: '' })}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Yakin ingin menghapus user <span className="font-semibold text-black">{deleteConfirmModal.username}</span>?
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmModal({ isOpen: false, userId: null, username: '' })}
            >
              Batal
            </Button>
            <Button
              variant="secondary"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
