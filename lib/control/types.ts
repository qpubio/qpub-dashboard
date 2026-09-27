export type Pagination = {
  total: number;
  per_page: number;
  current_page: number;
  next_page?: number | null;
  prev_page?: number | null;
  last_page: number;
};

export type Tenant = {
  id: number;
  status: string;
  created_at: string;
};

export type Limits = {
  tenant_id: number;
  inbound_per_second: number;
  outbound_per_second: number;
  updated_at?: string;
};

export type APIKey = {
  id: number;
  public_id: string;
  project_id: number;
  name: string;
  secret_key?: string;
  permission: unknown;
  status: string;
  expires_at?: string | null;
  created_at: string;
};

export type JobCounts = {
  pending: number;
  scheduled: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  dlq: number;
};

export type QueueSummary = {
  name: string;
  status: string;
  execution_profile: string;
  visibility_timeout: string;
  max_attempts: number;
  retention: string;
  max_payload_bytes: number;
  webhook_url: string;
  metadata: unknown;
  created_at: string;
  updated_at: string;
  counts: JobCounts;
};

export type WorkerSummary = {
  id: string;
  project_id: number;
  name: string;
  queues: string[];
  last_seen_at: string;
  stale: boolean;
  created_at: string;
  updated_at: string;
};

export type JobSummary = {
  id: string;
  queue_name: string;
  status: string;
  payload?: unknown;
  result?: unknown;
  attempt: number;
  max_attempts: number;
  worker_id?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
};

export type ServerInfo = {
  instance_id: string;
  server_id: string;
  vm_name: string;
  version: string;
  started_at: string;
  uptime_sec: number;
};

export type StatsMap = Record<string, number>;

export type MetricsRollup = {
  instance_id: string;
  tenant_count: number;
  stats: StatsMap;
  collected_at: string;
};

export type ConnectionSummary = {
  id: string;
  tenant_id: number;
  remote_addr: string;
  user_agent: string;
  state: string;
  alias?: string;
  created_at: string;
  last_recv_at: string;
  last_sent_at: string;
  messages_sent: number;
  messages_recv: number;
  bytes_sent: number;
  bytes_recv: number;
};

export type ChannelSummary = {
  id: string;
  name: string;
  full_name: string;
  tenant_id: number;
  instance_id: string;
  local_subscriptions: number;
  is_active: boolean;
  created_at: string;
  last_activity: string;
};
