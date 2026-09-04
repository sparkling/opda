const MAX_SNS_BATCH_SIZE = 10;

function stringAttribute(value) {
  return { DataType: 'String', StringValue: value };
}

function stringKey(keys, name) {
  const value = keys?.[name]?.S;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function occurredAt(record) {
  const seconds = record?.dynamodb?.ApproximateCreationDateTime;
  if (!Number.isFinite(seconds)) throw new TypeError('The stream record has no creation time.');
  return new Date(seconds * 1000).toISOString();
}

function sequenceNumber(record) {
  const value = record?.dynamodb?.SequenceNumber;
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError('The stream record has no sequence number.');
  }
  return value;
}

export function submissionEventFromStreamRecord(record) {
  if (record?.eventSource !== 'aws:dynamodb') {
    throw new TypeError('The event source is not DynamoDB.');
  }
  const eventName = record?.eventName;
  if (eventName === 'REMOVE') return null;

  const registrationId = stringKey(record?.dynamodb?.Keys, 'registrationId');
  const subscriberId = stringKey(record?.dynamodb?.Keys, 'subscriberId');
  if (Boolean(registrationId) === Boolean(subscriberId)) {
    throw new TypeError('The stream record must identify exactly one submission kind.');
  }
  let eventType;
  let kind;
  let id;

  if (registrationId && eventName === 'INSERT') {
    eventType = 'working-group-interest.received.v1';
    kind = 'working-group-interest';
    id = registrationId;
  } else if (subscriberId && eventName === 'INSERT') {
    eventType = 'newsletter-subscription.received.v1';
    kind = 'newsletter-subscription';
    id = subscriberId;
  } else if (subscriberId && eventName === 'MODIFY') {
    eventType = 'newsletter-subscription.refreshed.v1';
    kind = 'newsletter-subscription';
    id = subscriberId;
  } else if (registrationId && eventName === 'MODIFY') {
    return null;
  } else {
    throw new TypeError('The stream record does not match a supported submission event.');
  }

  if (typeof record?.eventID !== 'string' || record.eventID.length === 0) {
    throw new TypeError('The stream record has no event identifier.');
  }

  return {
    sequenceNumber: sequenceNumber(record),
    payload: {
      schemaVersion: 1,
      eventId: record.eventID,
      eventType,
      occurredAt: occurredAt(record),
      record: { kind, id },
    },
  };
}

export function publishBatchInput(records, topicArn) {
  return {
    TopicArn: topicArn,
    PublishBatchRequestEntries: records.map(({ payload }, index) => ({
      Id: `event-${index}`,
      Message: JSON.stringify(payload),
      MessageAttributes: {
        eventType: stringAttribute(payload.eventType),
        recordKind: stringAttribute(payload.record.kind),
        schemaVersion: stringAttribute(String(payload.schemaVersion)),
      },
    })),
  };
}

async function loadAws() {
  const { PublishBatchCommand, SNSClient } = await import('@aws-sdk/client-sns');
  return { PublishBatchCommand, SNSClient };
}

let servicesPromise;
async function services() {
  servicesPromise ??= loadAws().then((aws) => ({ aws, sns: new aws.SNSClient({}) }));
  return servicesPromise;
}

async function defaultPublishEvents(records) {
  const failures = [];
  const { aws, sns } = await services();
  for (let offset = 0; offset < records.length; offset += MAX_SNS_BATCH_SIZE) {
    const batch = records.slice(offset, offset + MAX_SNS_BATCH_SIZE);
    const response = await sns.send(new aws.PublishBatchCommand(
      publishBatchInput(batch, process.env.SUBMISSION_EVENTS_TOPIC_ARN),
    ));
    for (const failure of response.Failed ?? []) {
      const match = /^event-(\d+)$/u.exec(String(failure.Id));
      const index = match ? Number.parseInt(match[1], 10) : Number.NaN;
      if (!Number.isInteger(index) || !batch[index]) {
        throw new Error('SNS returned an unrecognised failed-entry identifier.');
      }
      failures.push(batch[index].sequenceNumber);
    }
  }
  return failures;
}

const defaultDependencies = { publishEvents: defaultPublishEvents };

export function createHandler(overrides = {}) {
  const dependencies = { ...defaultDependencies, ...overrides };
  return async function submissionEventsHandler(event) {
    const candidates = [];
    const failures = [];

    for (const record of event?.Records ?? []) {
      try {
        const candidate = submissionEventFromStreamRecord(record);
        if (candidate) candidates.push(candidate);
      } catch {
        failures.push({ itemIdentifier: sequenceNumber(record) });
      }
    }

    if (candidates.length > 0) {
      try {
        const failedSequences = await dependencies.publishEvents(candidates);
        failures.push(...failedSequences.map((itemIdentifier) => ({ itemIdentifier })));
      } catch {
        failures.push(...candidates.map(({ sequenceNumber: itemIdentifier }) => ({ itemIdentifier })));
      }
    }

    return {
      batchItemFailures: [...new Map(failures.map((failure) => [failure.itemIdentifier, failure])).values()],
    };
  };
}

export const handler = createHandler();
