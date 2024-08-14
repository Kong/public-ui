import { ref, toValue, unref } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type {
  FetcherParams,
  FetcherResponse,
  FetcherState,
  KongManagerBaseTableConfig,
  KonnectBaseTableConfig,
  MaybeRef,
} from '../types'
import { FetcherStatus } from '../types'
import useAxios from './useAxios'
import useFetchUrlBuilder from './useFetchUrlBuilder'

export default function useFetcher(
  config: KonnectBaseTableConfig | KongManagerBaseTableConfig,
  baseUrl: MaybeRef<string>,
  /**
   * Special handling for a response structure with a different base key for the data array like
   * { consumers: [{ ... }] }
   * instead of the standard the majority of the endpoints have
   * { data: [{ ... }] }
   */
  dataKeyNameRef?: MaybeRefOrGetter<string | undefined>,
) {
  const _baseUrl = unref(baseUrl)

  const { axiosInstance } = useAxios(config.axiosRequestConfig)
  const buildFetchUrl = useFetchUrlBuilder(config, _baseUrl)

  const state = ref<FetcherState>({
    status: FetcherStatus.Idle,
  })

  const fetcher = async (fetcherParams: FetcherParams): Promise<FetcherResponse> => {
    const dataKeyName = toValue(dataKeyNameRef) || 'data'
    try {
      state.value = { status: FetcherStatus.Loading }

      let requestUrl = buildFetchUrl(fetcherParams)

      // support for new filtering
      if (requestUrl.includes('filter[name]')) {
        requestUrl = `${requestUrl}&page[size]=${fetcherParams.pageSize}&page[number]=${fetcherParams.page}`
      }

      const res = await axiosInstance.get(requestUrl)
      // If the host app treats 4xx and 5xx responses as resolved through its validateStatus,
      // we need to throw the error to trigger the catch block
      // because we still need to show the error UI accordingly.
      if (res.status >= 400) {
        throw res
      }

      const data = res.data
      const dataKey = (dataKeyName && dataKeyName.replace(/[^\w-_]/gi, ''))
      let tableData


      if (data[dataKey]) {
        tableData = Array.isArray(data[dataKey]) ? data[dataKey] : [data[dataKey]]
      } else if (Array.isArray(data)) {
        // An array of object is returned
        tableData = data
      } else {
        // Single object is returned, so wrap in an array
        tableData = Object.keys(data).length ? [data] : []
      }

      const response = {
        data: tableData,
        total: tableData.length,
        ...(data.offset
          ? {
            pagination: {
              offset: data.offset,
            },
          }
          : null),
      }

      state.value = {
        status: FetcherStatus.Idle,
        response,
      }

      return response
    } catch (error: any) {
      const response = {
        data: [],
        total: 0,
      }

      // If response is 404, and there is a filterQuery, show no results instead of error
      if (fetcherParams.query && (error.response?.status === 404 || error.status === 404)) {
        state.value = {
          status: FetcherStatus.NoResults,
          response,
          error: error.response ? error : { response: error },
        }

        return response
      }

      state.value = {
        status: FetcherStatus.Error,
        response,
        error: error.response ? error : { response: error },
      }

      return response
    }
  }

  return { fetcher, fetcherState: state }
}
