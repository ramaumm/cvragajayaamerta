import { supabase } from './supabase';

const CURRENT_USER_KEY = 'app_current_user';

export interface AppUser {
  id: string;
  username: string;
  is_super_admin: boolean;
  created_at: string;
  last_login: string | null;
}

export const loginWithPin = async (pin: string): Promise<AppUser> => {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('pin', pin)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('PIN tidak valid');

  await supabase
    .from('app_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.id);

  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));

  return data;
};

export const signOut = async () => {
  sessionStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): AppUser | null => {
  const userData = sessionStorage.getItem(CURRENT_USER_KEY);
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const createUser = async (username: string, pin: string, createdBy: string): Promise<void> => {
  const { error } = await supabase
    .from('app_users')
    .insert({
      username,
      pin,
      is_super_admin: false,
      created_by: createdBy,
    });

  if (error) throw error;
};

export const getAllUsers = async (): Promise<AppUser[]> => {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteUser = async (userId: string): Promise<void> => {
  const { data, error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Delete error:', error);
    throw new Error('Gagal menghapus user');
  }

  if (!data || data.length === 0) {
    throw new Error('User tidak ditemukan');
  }
};
