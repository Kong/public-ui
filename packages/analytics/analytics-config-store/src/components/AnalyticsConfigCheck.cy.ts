import { createPinia, setActivePinia } from 'pinia'
import type { AnalyticsBridge, AnalyticsConfigV2 } from '@kong-ui-public/analytics-utilities'
import AnalyticsConfigCheck from './AnalyticsConfigCheck.vue'
import { h } from 'vue'

const INJECT_QUERY_PROVIDER = 'analytics-query-provider'
const DEFAULT_SLOT_TEXT = 'Default slot rendered'
const FALLBACK_SLOT_TEXT = 'Fallback slot rendered'

const makeQueryBridge = (level: 'networkFail' | 'none' | 'analytics' | 'percentiles'): AnalyticsBridge => {
  let config: AnalyticsConfigV2

  if (level === 'analytics') {
    config = {
      analytics: {
        percentiles: false,
        retention_ms: 2592000000, // 30d
      },
      requests: null,
    }
  } else if (level === 'percentiles') {
    config = {
      analytics: {
        percentiles: true,
        retention_ms: 2592000000, // 30d
      },
      requests: {
        retention_ms: 86400000,
      },
    }
  } else {
    config = {
      analytics: null,
      requests: null,
    }
  }

  return {
    queryFn: () => Promise.reject(new Error('Unexpected query call in test')),
    configFn: () => {
      if (level === 'networkFail') {
        return Promise.reject(new Error('Network failure'))
      }

      return Promise.resolve(config)
    },
    evaluateFeatureFlagFn: () => true as any,
  }
}

const slotContent = (text: string) => h('div', { id: 'slot-content' }, [text])

describe('AnalyticsConfigCheck', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('handles full access, no requirements', () => {
    const queryBridge = makeQueryBridge('percentiles')

    cy.mount(AnalyticsConfigCheck, {
      props: {},
      slots: {
        default: slotContent(DEFAULT_SLOT_TEXT),
        fallback: slotContent(FALLBACK_SLOT_TEXT),
      },
      global: {
        provide: {
          [INJECT_QUERY_PROVIDER]: queryBridge,
        },
      },
    })

    cy.get('#slot-content').should('have.text', DEFAULT_SLOT_TEXT)
    cy.get('#slot-content').should('not.have.text', FALLBACK_SLOT_TEXT)
  })

  it('handles no access to analytics, no requirements', () => {
    const queryBridge = makeQueryBridge('none')

    cy.mount(AnalyticsConfigCheck, {
      props: {},
      slots: {
        default: slotContent(DEFAULT_SLOT_TEXT),
        fallback: slotContent(FALLBACK_SLOT_TEXT),
      },
      global: {
        provide: {
          [INJECT_QUERY_PROVIDER]: queryBridge,
        },
      },
    })

    cy.get('#slot-content').should('have.text', DEFAULT_SLOT_TEXT)
    cy.get('#slot-content').should('not.have.text', FALLBACK_SLOT_TEXT)
  })

  it('handles no access to analytics, but analytics required', () => {
    const queryBridge = makeQueryBridge('none')

    cy.mount(AnalyticsConfigCheck, {
      props: {
        requireAnalytics: true,
      },
      slots: {
        default: slotContent(DEFAULT_SLOT_TEXT),
        fallback: slotContent(FALLBACK_SLOT_TEXT),
      },
      global: {
        provide: {
          [INJECT_QUERY_PROVIDER]: queryBridge,
        },
      },
    })

    cy.get('#slot-content').should('have.text', FALLBACK_SLOT_TEXT)
    cy.get('#slot-content').should('not.have.text', DEFAULT_SLOT_TEXT)
  })

  it('handles no access to percentiles, but percentiles required', () => {
    const queryBridge = makeQueryBridge('analytics')

    cy.mount(AnalyticsConfigCheck, {
      props: {
        requirePercentiles: true,
      },
      slots: {
        default: slotContent(DEFAULT_SLOT_TEXT),
        fallback: slotContent(FALLBACK_SLOT_TEXT),
      },
      global: {
        provide: {
          [INJECT_QUERY_PROVIDER]: queryBridge,
        },
      },
    })

    cy.get('#slot-content').should('have.text', FALLBACK_SLOT_TEXT)
    cy.get('#slot-content').should('not.have.text', DEFAULT_SLOT_TEXT)
  })

  it('handles no access to percentiles, but percentiles and analytics required', () => {
    const queryBridge = makeQueryBridge('analytics')

    cy.mount(AnalyticsConfigCheck, {
      props: {
        requireAnalytics: true,
        requirePercentiles: true,
      },
      slots: {
        default: slotContent(DEFAULT_SLOT_TEXT),
        fallback: slotContent(FALLBACK_SLOT_TEXT),
      },
      global: {
        provide: {
          [INJECT_QUERY_PROVIDER]: queryBridge,
        },
      },
    })

    cy.get('#slot-content').should('have.text', FALLBACK_SLOT_TEXT)
    cy.get('#slot-content').should('not.have.text', DEFAULT_SLOT_TEXT)
  })

  it('handles access to analytics, and analytics required', () => {
    const queryBridge = makeQueryBridge('analytics')

    cy.mount(AnalyticsConfigCheck, {
      props: {
        requireAnalytics: true,
      },
      slots: {
        default: slotContent(DEFAULT_SLOT_TEXT),
        fallback: slotContent(FALLBACK_SLOT_TEXT),
      },
      global: {
        provide: {
          [INJECT_QUERY_PROVIDER]: queryBridge,
        },
      },
    })

    cy.get('#slot-content').should('have.text', DEFAULT_SLOT_TEXT)
    cy.get('#slot-content').should('not.have.text', FALLBACK_SLOT_TEXT)
  })

  it('handles access to percentiles, and percentiles required', () => {
    const queryBridge = makeQueryBridge('percentiles')

    cy.mount(AnalyticsConfigCheck, {
      props: {
        requireAnalytics: true,
        requirePercentiles: true,
      },
      slots: {
        default: slotContent(DEFAULT_SLOT_TEXT),
        fallback: slotContent(FALLBACK_SLOT_TEXT),
      },
      global: {
        provide: {
          [INJECT_QUERY_PROVIDER]: queryBridge,
        },
      },
    })

    cy.get('#slot-content').should('have.text', DEFAULT_SLOT_TEXT)
    cy.get('#slot-content').should('not.have.text', FALLBACK_SLOT_TEXT)
  })

  it("doesn't render anything if the API call fails", () => {
    const queryBridge = makeQueryBridge('networkFail')

    cy.mount(AnalyticsConfigCheck, {
      props: {
        requireAnalytics: true,
        requirePercentiles: true,
      },
      slots: {
        default: slotContent(DEFAULT_SLOT_TEXT),
        fallback: slotContent(FALLBACK_SLOT_TEXT),
      },
      global: {
        provide: {
          [INJECT_QUERY_PROVIDER]: queryBridge,
        },
      },
    })

    cy.get('#slot-content').should('not.exist')
  })
})
