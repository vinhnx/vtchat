// Date utilities wrapper to isolate date-fns imports and prevent HMR issues
import {
    compareDesc,
    differenceInDays,
    format,
    formatDistanceToNow,
    isAfter,
    isToday,
    isYesterday,
    startOfDay,
    subDays
} from 'date-fns';

// Re-export date-fns functions with stable references
export const getStartOfDay = (date: Date) => startOfDay(date);
export const getDifferenceInDays = (dateLeft: Date, dateRight: Date) => differenceInDays(dateLeft, dateRight);
export const formatDate = (date: Date, formatStr: string) => format(date, formatStr);
export const getFormatDistanceToNow = (date: Date | number, options?: { addSuffix?: boolean }) => formatDistanceToNow(date, options);
export const getCompareDesc = (dateLeft: Date | number, dateRight: Date | number) => compareDesc(dateLeft, dateRight);
export const getIsAfter = (date: Date | number, dateToCompare: Date | number) => isAfter(date, dateToCompare);
export const getIsToday = (date: Date | number) => isToday(date);
export const getIsYesterday = (date: Date | number) => isYesterday(date);
export const getSubDays = (date: Date | number, amount: number) => subDays(date, amount);

// Utility function that uses the re-exported functions
export const getRelativeDate = (date: string | Date) => {
    const today = getStartOfDay(new Date());
    const inputDate = getStartOfDay(new Date(date));

    const diffDays = getDifferenceInDays(today, inputDate);

    if (diffDays === 0) {
        return 'Today';
    }
    if (diffDays === 1) {
        return 'Yesterday';
    }
    return formatDate(inputDate, 'dd/MM/yyyy');
};
