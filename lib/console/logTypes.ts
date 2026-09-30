export type EventType =
  | "connection.opened"
  | "connection.closed"
  | "connection.error"
  | "client.connected"
  | "client.disconnected"
  | "subscription.created"
  | "subscription.closed"
  | "queue.job.enqueued"
  | "queue.job.claimed"
  | "queue.job.completed"
  | "queue.job.nacked"
  | "queue.job.retried"
  | "queue.job.dlq"
  | "queue.job.cancelled"
  | "queue.worker.registered"
  | string;

export interface ConnectionDetails {
  connection_id?: string;
  client_id?: string;
  channel?: string;
  api_key?: string;
}

export interface SourceDetails {
  remote_addr?: string;
  user_agent?: string;
  origin?: string;
}

export interface InstanceDetails {
  site: string;
}

export interface ErrorDetails {
  message: string;
  code?: string;
}

export interface QueueDetails {
  queue_name?: string;
  job_id?: string;
  status?: string;
  worker_id?: string;
  worker_name?: string;
  attempt?: number;
}

export interface ProjectLogEvent {
  message?: string;
  connection?: ConnectionDetails;
  source?: SourceDetails;
  instance?: InstanceDetails;
  queue?: QueueDetails;
  error?: ErrorDetails;
}
