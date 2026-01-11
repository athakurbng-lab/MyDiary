import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';

export function formatDate(dateString: string): string {
    const date = parseISO(dateString);

    if (isToday(date)) {
        return 'Today';
    } else if (isYesterday(date)) {
        return 'Yesterday';
    } else {
        return format(date, 'MMM dd, yyyy');
    }
}

export function formatTime(dateString: string): string {
    return format(parseISO(dateString), 'hh:mm a');
}

export function formatDateTime(dateString: string): string {
    return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
}

export function getTodayDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

export function getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return format(date, 'yyyy-MM-dd');
}

export function daysBetween(date1: string, date2: string): number {
    return differenceInDays(parseISO(date1), parseISO(date2));
}
