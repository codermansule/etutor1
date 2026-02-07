import { NextResponse } from "next/server";
import { vitalsSchema, parseBody } from "@/lib/validations/api-schemas";

export async function POST(request: Request) {
  try {
    const parsed = parseBody(vitalsSchema, await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
    const metric = parsed.data;

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
