/**
 * Authentication API service using Supabase.
 */

import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: 'resident' | 'farmer' | 'government';
  location?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Register a new user account via Supabase.
 */
export async function register(
  data: UserRegistrationData
): Promise<ApiResponse<{ user: User | null; needsConfirmation: boolean }>> {
  const supabase = createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        role: data.role || 'resident',
        location: data.location || '',
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      user: authData.user,
      needsConfirmation: !authData.session,
    },
  };
}

/**
 * Log in with email and password via Supabase.
 */
export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<{ user: User | null }>> {
  const supabase = createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: { user: authData.user },
  };
}

/**
 * Log out the current user.
 */
export async function logout(): Promise<ApiResponse<{ message: string }>> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { message: 'Logged out' } };
}

/**
 * Get the current user's profile.
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { success: false, error: error?.message || 'Not authenticated' };
  }

  return { success: true, data: user };
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(
  updates: { first_name?: string; last_name?: string; location?: string }
): Promise<ApiResponse<User>> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error || !user) {
    return { success: false, error: error?.message || 'Update failed' };
  }

  return { success: true, data: user };
}

/**
 * Change the current user's password.
 */
export async function changePassword(
  newPassword: string
): Promise<ApiResponse<{ message: string }>> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { message: 'Password updated' } };
}

/**
 * Check if there's a valid session.
 */
export async function hasValidSession(): Promise<boolean> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
}
