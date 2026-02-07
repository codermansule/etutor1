import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const metric = await request.json();

    // Log to server console in production for now.
    // Replace with PostHog, Sentry, or a DB insert when ready.
    console.log(
      `[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
