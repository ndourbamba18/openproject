import { DateTime } from 'luxon';

export function formatElapsedTime(startTime:string):string {
  return DateTime.now()
    .diff(DateTime.fromISO(startTime))
    .toFormat('hh:mm:ss');
}
