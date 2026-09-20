import type { DomainEvent, Resource } from '@resqsync/domain';

export interface TimelineSnapshot {
  timestamp: string;
  resource_state: Resource;
  contributing_event: DomainEvent;
}

/**
 * Replay control plane reconstructing authoritative state timeline from append-only event stream.
 */
export function reconstructStateAtTimestamp(
  initialState: Resource,
  events: DomainEvent[],
  targetTimestamp: string,
): Resource {
  const eligibleEvents = events
    .filter(e => new Date(e.timestamp) <= new Date(targetTimestamp))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  let currentState = { ...initialState };
  for (const event of eligibleEvents) {
    if (event.payload && typeof event.payload.status === 'string') {
      currentState = {
        ...currentState,
        status: event.payload.status as any,
        version: currentState.version + 1,
        updated_at: event.timestamp,
      };
    }
  }

  return currentState;
}
