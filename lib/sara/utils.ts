import { createHash, randomBytes, randomInt } from "node:crypto";

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateLoginCode() {
  return String(randomInt(100000, 999999));
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000);
}
