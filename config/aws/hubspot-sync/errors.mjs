// Safe operational codes only: never carry personal data, tokens or API bodies.
export class RetryLater extends Error {
  constructor(seconds = 60) {
    super('HubSpot sync retry required');
    // SQS visibility is capped separately; the durable retry deadline must not
    // truncate a longer server Retry-After and cause an early HTTP retry.
    this.seconds = Number.isFinite(seconds) ? Math.max(1, Math.ceil(seconds)) : 60;
  }
}

export function retryAfter(value, now = Date.now()) {
  const seconds = /^\d+$/.test(value ?? '') ? Number(value) : (Date.parse(value) - now) / 1000;
  return Number.isFinite(seconds) ? Math.max(1, Math.ceil(seconds)) : 60;
}
