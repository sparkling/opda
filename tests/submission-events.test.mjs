import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createHandler,
  publishBatchInput,
  submissionEventFromStreamRecord,
} from '../config/aws/submission-events/index.mjs';

const CREATED_AT_SECONDS = Date.UTC(2026, 8, 3, 12) / 1000;

function streamRecord({
  eventID = 'stream-event-id',
  eventName = 'INSERT',
  key = { registrationId: { S: 'registration-id' } },
  sequence = '1001',
} = {}) {
  return {
    eventID,
    eventName,
    eventSource: 'aws:dynamodb',
    dynamodb: {
      ApproximateCreationDateTime: CREATED_AT_SECONDS,
      Keys: key,
      SequenceNumber: sequence,
    },
  };
}

test('join and newsletter stream records become versioned reference-only events', () => {
  const join = submissionEventFromStreamRecord(streamRecord());
  const newsletter = submissionEventFromStreamRecord(streamRecord({
    eventID: 'newsletter-event-id',
    key: { subscriberId: { S: 'subscriber-hash' } },
    sequence: '1002',
  }));
  const refreshed = submissionEventFromStreamRecord(streamRecord({
    eventID: 'newsletter-refresh-id',
    eventName: 'MODIFY',
    key: { subscriberId: { S: 'subscriber-hash' } },
    sequence: '1003',
  }));

  assert.deepEqual(join, {
    sequenceNumber: '1001',
    payload: {
      schemaVersion: 1,
      eventId: 'stream-event-id',
      eventType: 'working-group-interest.received.v1',
      occurredAt: '2026-09-03T12:00:00.000Z',
      record: { kind: 'working-group-interest', id: 'registration-id' },
    },
  });
  assert.equal(newsletter.payload.eventType, 'newsletter-subscription.received.v1');
  assert.equal(refreshed.payload.eventType, 'newsletter-subscription.refreshed.v1');
  assert.doesNotMatch(JSON.stringify([join, newsletter, refreshed]), /fullName|email|organisation|role|workingGroups|consent/u);
});

test('join updates and all removal records do not emit signup events', () => {
  assert.equal(submissionEventFromStreamRecord(streamRecord({ eventName: 'MODIFY' })), null);
  assert.equal(submissionEventFromStreamRecord(streamRecord({ eventName: 'REMOVE' })), null);
});

test('SNS batches expose filter attributes but contain no source record image', () => {
  const record = submissionEventFromStreamRecord(streamRecord());
  const input = publishBatchInput([record], 'topic-arn');
  assert.equal(input.TopicArn, 'topic-arn');
  assert.equal(input.PublishBatchRequestEntries.length, 1);
  assert.deepEqual(input.PublishBatchRequestEntries[0].MessageAttributes, {
    eventType: { DataType: 'String', StringValue: 'working-group-interest.received.v1' },
    recordKind: { DataType: 'String', StringValue: 'working-group-interest' },
    schemaVersion: { DataType: 'String', StringValue: '1' },
  });
  assert.doesNotMatch(input.PublishBatchRequestEntries[0].Message, /NewImage|OldImage|email/u);
});

test('the stream handler reports only failed DynamoDB sequence numbers', async () => {
  const records = [
    streamRecord({ sequence: '1001' }),
    streamRecord({
      eventID: 'newsletter-event-id',
      key: { subscriberId: { S: 'subscriber-hash' } },
      sequence: '1002',
    }),
    streamRecord({ eventName: 'REMOVE', sequence: '1003' }),
  ];
  const published = [];
  const handler = createHandler({
    publishEvents: async (candidates) => {
      published.push(...candidates);
      return ['1002'];
    },
  });

  const response = await handler({ Records: records });
  assert.equal(published.length, 2);
  assert.deepEqual(response, { batchItemFailures: [{ itemIdentifier: '1002' }] });
});

test('a complete SNS failure retries every publishable stream record', async () => {
  const handler = createHandler({ publishEvents: async () => { throw new Error('unavailable'); } });
  const response = await handler({
    Records: [
      streamRecord({ sequence: '1001' }),
      streamRecord({
        eventID: 'newsletter-event-id',
        key: { subscriberId: { S: 'subscriber-hash' } },
        sequence: '1002',
      }),
    ],
  });
  assert.deepEqual(response, {
    batchItemFailures: [{ itemIdentifier: '1001' }, { itemIdentifier: '1002' }],
  });
});
