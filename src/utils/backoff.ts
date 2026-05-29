export async function exponentialBackoff(
  fn: () => Promise<void>,
  maxAttempts = 3,
  baseDelayMs = 1000,
  maxDelayMs = 30000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fn();
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
    }
  }
}
