import type { RawAxiosRequestHeaders, AxiosHeaders, AxiosRequestConfig } from 'axios'

/** Shared config properties for all app entities */
interface BaseAppConfig {
  /** Base URL for API requests */
  apiBaseUrl: string
  /** App name. One of 'konnect' | 'kongManager' */
  app: 'konnect' | 'kongManager'
  // TODO: Remove requestHeaders and in host apps use axiosRequestConfig.headers instead
  // Ticket: https://konghq.atlassian.net/browse/KM-43
  /** Additional headers to send with all Axios requests */
  requestHeaders?: RawAxiosRequestHeaders | AxiosHeaders
  /** An optional configuration object for the underlying Axios request */
  axiosRequestConfig?: AxiosRequestConfig
}

/** Base config properties for Konnect. All entity configs should extend this interface for the app. */
export interface KonnectConfig extends BaseAppConfig {
  /** App name. 'konnect' */
  app: 'konnect'
  /** The control plane id */
  controlPlaneId: string
  /** Should use exact match */
  isExactMatch?: boolean
}

/** Base config properties for Kong Manager. All entity configs should extend this interface for the app. */
export interface KongManagerConfig extends BaseAppConfig {
  /** App name. 'kongManager' */
  app: 'kongManager'
  /** Workspace name */
  workspace: string
  /** Gateway instance info, used in Canopy to check if a feature is supported */
  gatewayInfo?: {
    edition: 'enterprise' | 'community'
    version: string
  }
}
