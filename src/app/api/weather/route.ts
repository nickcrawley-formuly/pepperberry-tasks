import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchWeatherData } from '@/lib/weather';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await fetchWeatherData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 502 }
    );
  }
}
