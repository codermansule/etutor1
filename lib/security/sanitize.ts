export function sanitizeInput(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

export function validateEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
