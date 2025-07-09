// Test script to verify date-fns imports
import { differenceInDays, format, startOfDay } from 'date-fns';

console.log('Testing date-fns imports...');

const today = startOfDay(new Date());
const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

const diff = differenceInDays(today, yesterday);
const formatted = format(today, 'dd/MM/yyyy');

console.log('Difference in days:', diff);
console.log('Formatted date:', formatted);
console.log('date-fns imports working correctly!');
