import { onCLS, onLCP, onINP, type Metric } from "web-vitals";

export function reportWebVitals(onReport: (metric: Metric) => void) {
  onCLS(onReport);
  onLCP(onReport);
  onINP(onReport);
}
