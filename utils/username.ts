/**
 * Username validation and formatting utilities
 * Requirements:
 * - Stored internally in lowercase without '@'
 * - Displayed with '@' prefix
 * - 3 to 30 characters
 * - Only alphanumeric and underscores
 * - Case-insensitive uniqueness
 */

export function cleanUsername(input: string): string {
  if (!input) return "";
  let clean = input.trim();
  if (clean.startsWith("@")) {
    clean = clean.substring(1);
  }
  return clean.toLowerCase();
}

export function formatUsername(username: string | null | undefined): string {
  if (!username) return "@";
  const clean = cleanUsername(username);
  return `@${clean}`;
}

export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
  cleaned: string;
}

export function validateUsername(input: string): UsernameValidationResult {
  const cleaned = cleanUsername(input);

  if (!cleaned) {
    return {
      isValid: false,
      error: "Username is required",
      cleaned: "",
    };
  }

  if (cleaned.length < 3) {
    return {
      isValid: false,
      error: "Username must be at least 3 characters",
      cleaned,
    };
  }

  if (cleaned.length > 30) {
    return {
      isValid: false,
      error: "Username cannot exceed 30 characters",
      cleaned,
    };
  }

  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(cleaned)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
      cleaned,
    };
  }

  // Reserved usernames
  const reserved = ["admin", "administrator", "system", "chatflow", "root", "support", "help", "bot", "api"];
  if (reserved.includes(cleaned)) {
    return {
      isValid: false,
      error: "This username is reserved by system",
      cleaned,
    };
  }

  return {
    isValid: true,
    cleaned,
  };
}
