import { expect } from 'vitest'
import { TimeframeKeys } from './types'
import { Timeframe, TimePeriods } from './timeframes'

const freeTierMax = TimePeriods.get(TimeframeKeys.ONE_DAY)?.timeframeLength() || 86400
const sevenDays = TimePeriods.get(TimeframeKeys.SEVEN_DAY)?.timeframeLength() || 86400 * 7
const thirtyDays = TimePeriods.get(TimeframeKeys.THIRTY_DAY)?.timeframeLength() || 86400 * 30

const allowedTiersFree = Array.from(TimePeriods.values()).filter((val) => val.allowedTiers.includes('free'))
const allowedTiersPlus = Array.from(TimePeriods.values()).filter((val) => val.allowedTiers.includes('plus'))
const allowedTiersEnterprise = Array.from(TimePeriods.values()).filter((val) => val.allowedTiers.includes('enterprise'))

describe('timeFramesAllowed', () => {
  it('does not show anything beyond `Last 24 hours` if Free tier', () => {
    expect(allowedTiersFree.some((item) => item.timeframeLength() > freeTierMax)).toBe(false)
  })

  it('does show `Last 7 days` and `Last 30 days` if Plus tier', () => {
    expect(allowedTiersPlus.some((item) => item.timeframeLength() === sevenDays)).toBe(true)
    expect(allowedTiersPlus.some((item) => item.timeframeLength() === thirtyDays)).toBe(true)
  })

  it('does show `Last 7 days` and `Last 30 days` if Enterprise tier', () => {
    expect(allowedTiersEnterprise.some((item) => item.timeframeLength() === sevenDays)).toBe(true)
    expect(allowedTiersEnterprise.some((item) => item.timeframeLength() === thirtyDays)).toBe(true)
  })
})

describe('allowedGranularities', () => {
  it('meets specs for "standard" timeframes', () => {
    expect(TimePeriods.get(TimeframeKeys.FIFTEEN_MIN)?.allowedGranularities())
      .toEqual(new Set(['minutely']))

    expect(TimePeriods.get(TimeframeKeys.ONE_HOUR)?.allowedGranularities())
      .toEqual(new Set(['minutely']))

    expect(TimePeriods.get(TimeframeKeys.SIX_HOUR)?.allowedGranularities())
      .toEqual(new Set(['minutely', 'hourly']))

    expect(TimePeriods.get(TimeframeKeys.TWELVE_HOUR)?.allowedGranularities())
      .toEqual(new Set(['hourly']))

    expect(TimePeriods.get(TimeframeKeys.ONE_DAY)?.allowedGranularities())
      .toEqual(new Set(['hourly']))

    expect(TimePeriods.get(TimeframeKeys.SEVEN_DAY)?.allowedGranularities())
      .toEqual(new Set(['hourly', 'daily']))

    expect(TimePeriods.get(TimeframeKeys.THIRTY_DAY)?.allowedGranularities())
      .toEqual(new Set(['daily', 'weekly']))

    expect(TimePeriods.get(TimeframeKeys.CURRENT_WEEK)?.allowedGranularities())
      .toEqual(new Set(['hourly', 'daily']))

    expect(TimePeriods.get(TimeframeKeys.CURRENT_MONTH)?.allowedGranularities())
      .toEqual(new Set(['daily', 'weekly']))

    expect(TimePeriods.get(TimeframeKeys.PREVIOUS_WEEK)?.allowedGranularities())
      .toEqual(new Set(['hourly', 'daily']))

    expect(TimePeriods.get(TimeframeKeys.PREVIOUS_MONTH)?.allowedGranularities())
      .toEqual(new Set(['daily', 'weekly']))
  })

  it('meets new specs for standard timeframes with flag', () => {
    expect(TimePeriods.get(TimeframeKeys.FIFTEEN_MIN)?.allowedGranularities(true))
      .toEqual(new Set(['tenSecondly', 'thirtySecondly', 'minutely']))

    expect(TimePeriods.get(TimeframeKeys.ONE_DAY)?.allowedGranularities(true))
      .toEqual(new Set(['fiveMinutely', 'tenMinutely', 'thirtyMinutely', 'hourly']))
  })
})

describe('cacheKey', () => {
  it('handles relative keys', () => {
    expect(TimePeriods.get(TimeframeKeys.ONE_DAY)?.cacheKey()).toBe('24h')
    expect(TimePeriods.get(TimeframeKeys.CURRENT_MONTH)?.cacheKey()).toBe('current_month')
  })

  it('handles absolute keys', () => {
    expect((new Timeframe({
      key: 'custom',
      timeframeText: 'custom',
      display: 'custom',
      startCustom: new Date('2024-01-01T00:00:00Z'),
      endCustom: new Date('2024-01-02T00:00:00Z'),
      timeframeLength: () => 0,
      defaultResponseGranularity: 'daily',
      dataGranularity: 'daily',
      isRelative: false,
      allowedTiers: ['free', 'plus', 'enterprise'],
    })).cacheKey()).toBe('2024-01-01T00:00:00.000Z-2024-01-02T00:00:00.000Z')
  })
})

describe('v4Query', () => {
  it('handles relative keys', () => {
    expect(TimePeriods.get(TimeframeKeys.ONE_DAY)!.v4Query()).toEqual({
      type: 'relative',
      time_range: '24h',
    })
  })

  it('handles custom timeframes', () => {
    const customTime = new Timeframe({
      key: 'custom',
      timeframeText: 'custom',
      display: 'custom',
      startCustom: new Date('2024-01-01T00:00:00Z'),
      endCustom: new Date('2024-02-01T00:00:00Z'),
      timeframeLength: () => 0,
      defaultResponseGranularity: 'daily',
      dataGranularity: 'daily',
      isRelative: false,
      allowedTiers: ['free', 'plus', 'enterprise'],
    })

    expect(customTime.v4Query()).toEqual({
      type: 'absolute',
      start: new Date('2024-01-01T00:00:00Z'),
      end: new Date('2024-02-01T00:00:00Z'),
    })
  })
})
