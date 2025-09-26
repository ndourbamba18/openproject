import { Calendar } from '@fullcalendar/core';
import { DateTime } from 'luxon';

export const backgroundEvents = {
  events: [],
  id: 'background',
  color: 'red',
  textColor: 'white',
  display: 'background',
  editable: false,
};

export function addBackgroundEvents(
  calendar:Calendar,
  nonWorkingDay:(date:Date) => boolean,
) {
  let currentStartDate = calendar.view.activeStart;
  const currentEndDate = calendar.view.activeEnd.getTime();
  const nonWorkingDays = new Array<{ start:Date|string, end:Date|string }>();

  while (currentStartDate.getTime() < currentEndDate) {
    if (nonWorkingDay(currentStartDate)) {
      nonWorkingDays.push({
        start: DateTime.fromJSDate(currentStartDate).toISODate()!,
        end: DateTime.fromJSDate(currentStartDate).plus({ day: 1 }).toISODate()!,
      });
    }
    currentStartDate = DateTime.fromJSDate(currentStartDate).plus({ day: 1 }).toJSDate();
  }
  nonWorkingDays.forEach((day) => {
    calendar.addEvent({ ...day }, 'background');
  });
}

export function removeBackgroundEvents(calendar:Calendar) {
  calendar
    .getEvents()
    .filter((el) => el.source?.id === 'background')
    .forEach((el) => el.remove());
}
