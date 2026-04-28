import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch current user's profile
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Failed to fetch profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// PATCH - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { full_name, role, location } = body;
    
    // Validate role if provided
    if (role && !['resident', 'farmer', 'official'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be resident, farmer, or official', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) updates.role = role;
    if (location !== undefined) updates.location = location;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to update profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
