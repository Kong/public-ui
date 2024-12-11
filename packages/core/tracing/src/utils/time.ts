export const getDurationFormatter = (locales: Intl.LocalesArgument = 'en') => {
  const fmt = new Intl.NumberFormat(locales, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return (nanoseconds: number) => {
    let t = nanoseconds

    if (t < 1000) {
      return `${fmt.format(t)}ns`
    }

    if ((t /= 1000) < 1000) {
      return `${fmt.format(t)}µs`
    }

    if ((t /= 1000) < 1000) {
      return `${fmt.format(t)}ms`
    }

    if ((t /= 1000) < 1000) {
      return `${fmt.format(t)}s`
    }

    if ((t /= 60) < 60) {
      return `${fmt.format(t)}m`
    }

    return `${fmt.format(t / 60)}h`
  }
}

/**
 * This function formats a nanosecond duration into a human-readable string.
 *
 * Example output: `2024-12-09T13:31:47.476672512Z`
 *
 * @param nanoseconds
 * @returns an ISO 8601 formatted string with nanoseconds precision
 */
export const formatNanoDateTimeString = (nanoseconds: bigint) => {
  const ms = nanoseconds / BigInt(1e6)
  const nsRemainder = nanoseconds - ms * BigInt(1e6)
  return new Date(Number(ms)).toISOString().replace(/Z$/g, `${nsRemainder.toString().padStart(6, '0')}Z`)
}
