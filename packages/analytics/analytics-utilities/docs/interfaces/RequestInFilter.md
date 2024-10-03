[**@kong-ui-public/analytics-utilities**](../README.md) • **Docs**

***

[@kong-ui-public/analytics-utilities](../README.md) / RequestInFilter

# Interface: RequestInFilter

## Properties

### field

> **field**: `"api_product"` \| `"api_product_version"` \| `"control_plane"` \| `"control_plane_group"` \| `"data_plane_node"` \| `"gateway_service"` \| `"route"` \| `"status_code"` \| `"status_code_grouped"` \| `"application"` \| `"consumer"` \| `"iso_code"` \| `"auth_type"` \| `"client_ip"` \| `"consumer_group"` \| `"country_code"` \| `"header_host"` \| `"header_user_agent"` \| `"http_method"` \| `"request_id"` \| `"request_uri"` \| `"response_header_content_type"` \| `"response_source"` \| `"service_port"` \| `"service_protocol"` \| `"sse"` \| `"trace_id"` \| `"upstream_uri"` \| `"upstream_status_code_grouped"` \| `"websocket"` \| `"ai_count"` \| `"latencies_response_ms"` \| `"latencies_upstream_ms"` \| `"latencies_kong_gateway_ms"` \| `"response_body_size"` \| `"request_body_size"` \| `"upstream_status_code"`

#### Defined in

[types/explore/requests.ts:86](https://github.com/Kong/public-ui-components/blob/main/packages/analytics/analytics-utilities/src/types/explore/requests.ts#L86)

***

### operator

> **operator**: `"in"` \| `"not_in"` \| `"selector"`

#### Defined in

[types/explore/requests.ts:85](https://github.com/Kong/public-ui-components/blob/main/packages/analytics/analytics-utilities/src/types/explore/requests.ts#L85)

***

### value

> **value**: (`string` \| `number`)[]

#### Defined in

[types/explore/requests.ts:87](https://github.com/Kong/public-ui-components/blob/main/packages/analytics/analytics-utilities/src/types/explore/requests.ts#L87)
