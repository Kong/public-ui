export type AnalyticsRetentionMs =
  | 86400000 // 1d
  | 2592000000 // 30d
  | 7776000000 // 90d
  | 15552000000 // 180d
  | 31536000000 // 365d
export type RequestsRetentionMs =
  | 86400000 // 1d
  | 604800000 // 7d
  | 1209600000 // 14d
  | 2592000000 // 30d

export interface ControlPlaneConfig {
  analytics: boolean
}
export interface ApiAnalyticsV2 {
  percentiles: boolean,
  retention_ms: AnalyticsRetentionMs
}

export interface ApiRequestsV2 {
  retention_ms: RequestsRetentionMs
}

export interface AnalyticsConfigV2 {
  analytics: null | ApiAnalyticsV2,
  requests: null | ApiRequestsV2
}

export interface AnalyticsConfigPrivilegedV2 extends AnalyticsConfigV2 {
  disabled_control_planes: string[]
}