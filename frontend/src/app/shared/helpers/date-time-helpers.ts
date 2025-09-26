//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See COPYRIGHT and LICENSE files for more details.
//++

import { DateTime, Info, InfoUnitOptions, StringUnitLength } from 'luxon';

const LUXON_TOKEN_MAPPING:Record<string, string> = {
  // Year
  'YYYY': 'yyyy', // Year (4-digit)
  'YY':   'yy',   // Year (2-digit)

  // Month
  'MMMM': 'MMMM', // Month name (full)
  'MMM':  'MMM',  // Month name (short)
  'MM':   'MM',   // Month (01–12)
  'M':    'M',    // Month (1–12)

  // Day
  'DDDD': 'ooo',  // Day of year (001–365)
  'DDD':  'o',    // Day of year (1–365)
  'DD':   'dd',   // Day of month (01–31)
  'D':    'd',    // Day of month (1–31)

  // Weekday
  'dddd': 'EEEE', // Weekday name (full)
  'ddd':  'EEE',  // Weekday name (short)
  'dd':   'EE',   // Weekday name (minimal, e.g., "Mo")
  'd':    'c',    // Day of week (1–7, Mon=1)

  // Hour
  'HH':   'HH',   // Hour (00–23)
  'H':    'H',    // Hour (0–23)
  'hh':   'hh',   // Hour (01–12)
  'h':    'h',    // Hour (1–12)

  // Minute
  'mm':   'mm',   // Minute (00–59)
  'm':    'm',    // Minute (0–59)

  // Second
  'ss':   'ss',   // Second (00–59)
  's':    's',    // Second (0–59)
  'SSS':  'SSS',  // Millisecond (000–999)

  // AM/PM
  'A':    'a',    // AM/PM (uppercase)
  'a':    'a',    // am/pm (lowercase)

  // Timezone
  'z':    'ZZZZZ', // Timezone name (e.g., "EST")
  'Z':    'ZZ',    // Timezone offset (±HH:mm)
  'ZZ':   'ZZ',    // Timezone offset (±HHmm)
};

const LUXON_TOKEN_REGEXP = new RegExp(
  Object.keys(LUXON_TOKEN_MAPPING)
    .sort((a, b) => b.length - a.length)
    .join('|'),
  'g'
);

export function momentToLuxonFormat(fmt:string):string {
  return fmt.replace(LUXON_TOKEN_REGEXP, (match) => LUXON_TOKEN_MAPPING[match] || match);
}

export type DateLike = DateTime|Date|string;

/**
 * Helper to aid migration from Moment's `moment()` function to Luxon's API,
 * which provides multiple, discreet creation functions.
 *
 * @param date - A DateTime, Date, or ISO string
 * @returns A Luxon DateTime object
 * @throws Error if the input cannot be converted to a valid DateTime
 */
export function toDateTime(date:DateLike):DateTime {
  if (date instanceof DateTime) {
    return date;
  }
  if (date instanceof Date) {
    return DateTime.fromJSDate(date);
  }

  return DateTime.fromISO(date);
}

/**
 * Return an array of standalone week names.
 *
 * @see — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
 * @param length length "narrow" | "short" | "long"
 * @param opts
 * @returns
 */
export function getWeekdays(length?:StringUnitLength, opts?:InfoUnitOptions) {
  return Info.weekdays(length, opts);
}

/**
 * Return an array of week names, ordered for the locale.
 *
 * @see - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
 * @param length "narrow" | "short" | "long"
 * @param opts
 * @returns
 */
export function getLocaleOrderedWeekdays(length?:StringUnitLength, opts?:InfoUnitOptions) {
  const weekdays = getWeekdays(length, opts);
  const startOfWeek = Info.getStartOfWeek(opts);
  const startIndex = (startOfWeek - 1) % 7;

  if (startIndex < 0 || startIndex >= weekdays.length) {
    return weekdays;
  }

  return weekdays.slice(startIndex).concat(weekdays.slice(0, startIndex));
}
