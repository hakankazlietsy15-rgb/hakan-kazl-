
import { differenceInDays, isWithinInterval, parseISO } from 'date-fns';
import { LeaveRequest } from './types';

export const calculateDays = (start: string, end: string): number => {
  return Math.abs(differenceInDays(parseISO(end), parseISO(start))) + 1;
};

export const checkOverlaps = (
  newStart: string, 
  newEnd: string, 
  existingRequests: LeaveRequest[]
): LeaveRequest[] => {
  const s1 = parseISO(newStart);
  const e1 = parseISO(newEnd);

  return existingRequests.filter(req => {
    // Only count approved or pending requests
    if (req.status === 'REJECTED') return false;

    const s2 = parseISO(req.startDate);
    const e2 = parseISO(req.endDate);

    // Standard overlap logic: (StartA <= EndB) and (EndA >= StartB)
    return s1 <= e2 && e1 >= s2;
  });
};
