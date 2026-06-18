import { NextResponse } from 'next/server';
import { connectDB, Route } from '@nexabus/db';

export async function GET() {
  try {
    await connectDB();
    const routes = await Route.find({ status: 'active' })
      .select('origin destination stops')
      .lean();

    const citySet = new Set();
    for (const route of routes) {
      if (route.origin)      citySet.add(route.origin.trim());
      if (route.destination) citySet.add(route.destination.trim());
      for (const stop of route.stops || []) {
        if (stop.name) citySet.add(stop.name.trim());
      }
    }

    return NextResponse.json({ cities: [...citySet].sort() });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
