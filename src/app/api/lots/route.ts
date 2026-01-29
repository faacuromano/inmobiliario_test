import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const lots = await prisma.lot.findMany({
      select: {
        slug: true,
        status: true,
        price: true,
        currency: true,
        // Add other fields if needed for the map tooltip/interaction
      },
    });

    return NextResponse.json(lots, { status: 200 });
  } catch (error) {
    console.error('Error fetching lots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lots' },
      { status: 500 }
    );
  }
}
