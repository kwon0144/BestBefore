import { NextResponse } from 'next/server';

export type DailySchedule = {
  is_open: boolean;
  hours: string | null;
};

export type OperationSchedule = {
  is_24_hours: boolean;
  days: string[];
  hours: string;
  raw_text: string;
  daily_schedule: {
    monday: DailySchedule;
    tuesday: DailySchedule;
    wednesday: DailySchedule;
    thursday: DailySchedule;
    friday: DailySchedule;
    saturday: DailySchedule;
    sunday: DailySchedule;
  };
};

export type Foodbank = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  hours_of_operation: string;
  address: string;
  operation_schedule: OperationSchedule;
};

export type FoodbankResponse = {
  status: string;
  count: number;
  data: Foodbank[];
};

export async function GET() {
  try {
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

    const data: FoodbankResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching foodbanks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch foodbanks' },
      { status: 500 }
    );
  }
}