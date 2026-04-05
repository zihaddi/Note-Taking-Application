import {format, parseISO, formatDistanceToNow} from "date-fns"

/**
 * Format an ISO date string to a human-readable format.
 */
export function formatDate(dateStr: string, pattern = "MMM d, yyyy"): string {
    if (!dateStr) return ""
    try {
        return format(parseISO(dateStr), pattern)
    } catch {
        return dateStr
    }
}

/**
 * Format a date as relative time (e.g. "2 days ago").
 */
export function timeAgo(dateStr: string): string {
    if (!dateStr) return ""
    try {
        return formatDistanceToNow(parseISO(dateStr), {addSuffix: true})
    } catch {
        return dateStr
    }
}

/**
 * Truncate a string to the given max length, appending "...".
 */
export function truncate(str: string, maxLength = 100): string {
    if (!str) return ""
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array).
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === "string") return value.trim() === ""
    if (Array.isArray(value)) return value.length === 0
    return false
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay = 300,
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}
