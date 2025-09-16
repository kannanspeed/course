import { supabase } from '../supabase-client';

export interface AdminUser {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
}

/**
 * Check if the current user is an admin
 * @param userEmail - The email of the current user
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export const checkAdminStatus = async (userEmail: string): Promise<boolean> => {
  try {
    console.log('🔍 Admin check - Querying for email:', userEmail);
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('email', userEmail)
      .single();
    
    console.log('🔍 Admin check - Raw response:', { data, error });
    
    if (error) {
      console.error('❌ Error checking admin status:', error.message);
      console.error('❌ Full error object:', error);
      return false;
    }
    
    const isAdmin = data?.is_admin || false;
    console.log('🔍 Admin check - Result:', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('❌ Exception in checkAdminStatus:', error);
    return false;
  }
};

/**
 * Get all admin users (admin only function)
 * @returns Promise<AdminUser[]> - Array of admin users
 */
export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin users:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
};

/**
 * Add a new admin user (admin only function)
 * @param email - Email of the user to make admin
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export const addAdminUser = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .insert({ email, is_admin: true });
    
    if (error) {
      console.error('Error adding admin user:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding admin user:', error);
    return false;
  }
};

/**
 * Remove admin privileges from a user (admin only function)
 * @param email - Email of the user to remove admin privileges from
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export const removeAdminUser = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('email', email);
    
    if (error) {
      console.error('Error removing admin user:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing admin user:', error);
    return false;
  }
};
