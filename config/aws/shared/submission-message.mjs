/**
 * The post-persistence submission event (ADR-0079/ADR-0084 §4.2). Every consumer
 * subscribes its own filtered queue to the shared SNS topic and parses the same
 * reference-only envelope: an identifier, never applicant data. Validation lives
 * here so a second consumer cannot drift from the first.
 */
export const REGISTRATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const exactKeys = (object, keys) => object && !Array.isArray(object)
  && Object.keys(object).length === keys.length && keys.every(key => Object.hasOwn(object, key));

/** Returns the referenced registration id, or throws. `queueArn` pins the caller's own queue. */
export function parseSubmissionMessage(message, queueArn) {
  if (!queueArn || message?.eventSource !== 'aws:sqs' || message.eventSourceARN !== queueArn
    || typeof message.body !== 'string' || Buffer.byteLength(message.body) > 2048) throw new TypeError('Invalid submission queue message');
  let event;
  try { event = JSON.parse(message.body); } catch { throw new TypeError('Invalid submission event'); }
  if (!exactKeys(event, ['schemaVersion', 'eventId', 'eventType', 'occurredAt', 'record'])
    || event.schemaVersion !== 1 || event.eventType !== 'working-group-interest.received.v1'
    || typeof event.eventId !== 'string' || !/^[a-zA-Z0-9:._-]{1,256}$/.test(event.eventId)
    || typeof event.occurredAt !== 'string' || event.occurredAt.length > 40 || !Number.isFinite(Date.parse(event.occurredAt))
    || !exactKeys(event.record, ['kind', 'id']) || event.record.kind !== 'working-group-interest'
    || !REGISTRATION_ID.test(event.record.id)) throw new TypeError('Invalid submission event');
  return event.record.id;
}

/**
 * One SQS batch, partial failures reported, nothing about the payload logged.
 * `changeVisibility` honours a durable Retry-After that outlives one visibility period.
 */
export function createBatchHandler({ work, queueArn, changeVisibility, RetryLater, jitter = true }) {
  return async event => {
    const failures = [];
    for (const message of event?.Records ?? []) {
      try {
        await work(parseSubmissionMessage(message, queueArn()));
      } catch (error) {
        failures.push({ itemIdentifier: message.messageId });
        if (error instanceof RetryLater && changeVisibility) {
          // Add bounded positive jitter; never shorten the requested Retry-After.
          const seconds = Math.min(43200, error.seconds + (jitter ? Math.floor(Math.random() * 10) : 0));
          try { await changeVisibility(message, seconds); } catch { /* Native queue retry remains available. */ }
        }
        // No raw errors, event bodies, email addresses or credentials are logged.
      }
    }
    return { batchItemFailures: failures };
  };
}
