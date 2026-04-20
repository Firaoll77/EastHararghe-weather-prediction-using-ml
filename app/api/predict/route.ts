import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mlApiClient, MLAPIClientError, EAST_HARARGHE_LOCATIONS } from '@/lib/ml-api';
import type { PredictionInput } from '@/lib/ml-api';

export async function POST(request: NextRequest) {
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
    
    // Parse request body
    const body = await request.json();
    const { locationId, temperature, humidity, pressure, wind_speed } = body;
    
    // Validate required fields
    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    // Find location coordinates
    const location = EAST_HARARGHE_LOCATIONS.find(l => l.id === locationId);
    if (!location) {
      return NextResponse.json(
        { error: 'Invalid location ID', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    // Build prediction input
    const predictionInput: PredictionInput = {
      location: location.name,
      latitude: location.lat,
      longitude: location.lon,
      temperature: temperature ?? 25,
      humidity: humidity ?? 60,
      pressure: pressure ?? 1013,
      wind_speed: wind_speed ?? 5,
      month: new Date().getMonth() + 1,
      day_of_year: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000),
    };
    
    // Call ML API
    const prediction = await mlApiClient.predict(predictionInput);
    
    // Store prediction in database
    const { error: insertError } = await supabase.from('predictions').insert({
      user_id: user.id,
      location: location.name,
      rainfall_prediction: prediction.prediction.rainfall_mm,
      confidence_score: prediction.confidence,
      input_features: predictionInput,
    });
    
    if (insertError) {
      console.error('Failed to store prediction:', insertError);
      // Continue anyway - prediction was successful
    }
    
    return NextResponse.json({
      success: true,
      prediction,
      location: {
        id: location.id,
        name: location.name,
        lat: location.lat,
        lon: location.lon,
      },
    });
  } catch (error) {
    console.error('Prediction error:', error);
    
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
