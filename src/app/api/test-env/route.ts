import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    DATABASE_URI: process.env.DATABASE_URI,
    MONGODB_URI: process.env.MONGODB_URI,
    NEW_DATABASE_URI: process.env.NEW_DATABASE_URI
  });
}
