/**
 * Custom Contact Nicknames / Display Name Override System
 * Allows users to set custom names or nicknames for any contact or set it to @username.
 */

const STORAGE_KEY = "chatflow_custom_contact_names";
export const CONTACT_NAME_CHANGE_EVENT = "chatflow_contact_name_change";

export function getAllCustomContactNames(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getCustomContactName(
  identifier?: string | null,
  fallbackName?: string | null
): string {
  if (!identifier) return fallbackName || "User";
  const cleanId = identifier.toLowerCase().replace(/^@/, "").trim();
  const map = getAllCustomContactNames();
  return map[cleanId] || map[identifier] || fallbackName || "User";
}

export function setCustomContactName(identifier: string, newName: string): void {
  if (typeof window === "undefined" || !identifier) return;
  const cleanId = identifier.toLowerCase().replace(/^@/, "").trim();
  const map = getAllCustomContactNames();
  const trimmed = newName.trim();

  if (!trimmed) {
    delete map[cleanId];
    delete map[identifier];
  } else {
    map[cleanId] = trimmed;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(CONTACT_NAME_CHANGE_EVENT, { detail: { identifier, newName: trimmed } }));
  } catch (e) {}
}

export function removeCustomContactName(identifier: string): void {
  setCustomContactName(identifier, "");
}
