import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/database/mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json(
      {
        isConnected: true,
        message: 'Successfully connected to MongoDB!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json(
      {
        isConnected: false,
        message: 'Failed to connect to MongoDB',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
