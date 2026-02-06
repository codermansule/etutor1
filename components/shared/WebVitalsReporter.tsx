"use client";

import { useEffect } from "react";
import { onCLS, onLCP, onINP, type Metric } from "web-vitals";

function sendMetric(metric: Metric) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`);
    return;
  }

  // In production, beacon to analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/vitals", body);
  }
}

export default function WebVitalsReporter() {
  useEffect(() => {
    onCLS(sendMetric);
    onLCP(sendMetric);
    onINP(sendMetric);
  }, []);

  return null;
}
