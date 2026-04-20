import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch user's prediction history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const location = searchParams.get('location');
    
    // Build query
    let query = supabase
      .from('predictions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    // Add location filter if provided
    if (location) {
      query = query.eq('location', location);
    }
    
    const { data: predictions, error, count } = await query;
    
    if (error) {
      console.error('Failed to fetch predictions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch predictions', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      predictions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (error) {
    console.error('Predictions history error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific prediction
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const { predictionId } = await request.json();
    
    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('predictions')
      .delete()
      .eq('id', predictionId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Failed to delete prediction:', error);
      return NextResponse.json(
        { error: 'Failed to delete prediction', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
