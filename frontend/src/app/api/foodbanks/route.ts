import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Replace with your actual backend API URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/api/foodbanks/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching foodbanks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch foodbanks' },
      { status: 500 }
    );
  }
}