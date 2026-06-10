export type Cylinder = {
  id: string;
  nickname: string;
  scanDate: string; // ISO
  expiryCode: string;
  expiryYear: number;
  expiryQuarter: number; // 1-4
  expiryDateLabel: string;
  monthsRemaining: number;
};

const KEY = "safecylinder.cylinders.v1";

export function loadCylinders(): Cylinder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Cylinder[]) : [];
  } catch {
    return [];
  }
}

export function saveCylinders(list: Cylinder[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("safecylinder:update"));
}

export function addCylinder(c: Cylinder) {
  const list = loadCylinders();
  list.unshift(c);
  saveCylinders(list);
}

export function removeCylinder(id: string) {
  saveCylinders(loadCylinders().filter((c) => c.id !== id));
}

export function statusFor(monthsRemaining: number): "safe" | "warn" | "danger" {
  if (monthsRemaining <= 0) return "danger";
  if (monthsRemaining <= 2) return "warn";
  return "safe";
}

export function quarterLabel(q: number): string {
  return ["", "Jan–Mar", "Apr–Jun", "Jul–Sep", "Oct–Dec"][q] ?? "";
}
