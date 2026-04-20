import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mlApiClient, MLAPIClientError, EAST_HARARGHE_LOCATIONS } from '@/lib/ml-api';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');
    const days = parseInt(searchParams.get('days') || '7', 10);
    
    // Validate
    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    // Find location
    const location = EAST_HARARGHE_LOCATIONS.find(l => l.id === locationId);
    if (!location) {
      return NextResponse.json(
        { error: 'Invalid location ID', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    // Validate days parameter
    if (days < 1 || days > 14) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 14', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    // Call ML API for forecast
    const forecast = await mlApiClient.getForecast(
      location.name,
      location.lat,
      location.lon,
      days
    );
    
    return NextResponse.json({
      success: true,
      forecast,
      location: {
        id: location.id,
        name: location.name,
        lat: location.lat,
        lon: location.lon,
      },
    });
  } catch (error) {
    console.error('Forecast error:', error);
    
    if (error instanceof MLAPIClientError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: error.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
