export const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', check: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', check: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', check: (p: string) => /\d/.test(p) },
] as const;

export function validatePassword(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((r) => r.check(password));
}

/** Simulated auth delay for mock UI flows */
export function mockAuthDelay(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
