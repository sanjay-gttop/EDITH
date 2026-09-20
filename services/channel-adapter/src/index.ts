import type { Channel, Request } from '@resqsync/domain';

export interface InboundMessage {
  raw_payload: string;
  source_address: string;
  channel: Channel;
  received_at: string;
}

/**
 * Channel Adapter normalizing multi-modal inputs (SMS, Radio transcription, Web API).
 */
export function normalizeInboundMessage(message: InboundMessage): Partial<Request> {
  return {
    reporting_channel: message.channel,
    notes: `Ingested via ${message.channel} from ${message.source_address}: ${message.raw_payload}`,
    status: 'PENDING',
    created_at: message.received_at,
  };
}
