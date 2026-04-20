import { NextResponse } from 'next/server';
import { EAST_HARARGHE_LOCATIONS } from '@/lib/ml-api';

// GET - Fetch available locations
export async function GET() {
  return NextResponse.json({
    success: true,
    locations: EAST_HARARGHE_LOCATIONS,
  });
}
