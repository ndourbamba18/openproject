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

import { momentToLuxonFormat, toDateTime, getLocaleOrderedWeekdays, getWeekdays } from './date-time-helpers';
import { DateTime } from 'luxon';

describe('momentToLuxonFormat', () => {
  it('converts basic date format tokens', () => {
    expect(momentToLuxonFormat('YYYY-MM-DD')).toEqual('yyyy-MM-dd');
    expect(momentToLuxonFormat('DD.MM.YYYY')).toEqual('dd.MM.yyyy');
    expect(momentToLuxonFormat('DD-MM-YYYY')).toEqual('dd-MM-yyyy');
    expect(momentToLuxonFormat('MM/DD/YYYY')).toEqual('MM/dd/yyyy');
  });

  it('converts month name formats', () => {
    expect(momentToLuxonFormat('DD MMM YYYY')).toEqual('dd MMM yyyy');
    expect(momentToLuxonFormat('DD MMMM YYYY')).toEqual('dd MMMM yyyy');
    expect(momentToLuxonFormat('MMM DD, YYYY')).toEqual('MMM dd, yyyy');
    expect(momentToLuxonFormat('MMMM DD, YYYY')).toEqual('MMMM dd, yyyy');
  });

  it('converts time format tokens', () => {
    expect(momentToLuxonFormat('HH:mm:ss')).toEqual('HH:mm:ss');
    expect(momentToLuxonFormat('h:mm A')).toEqual('h:mm a');
    expect(momentToLuxonFormat('hh:mm A')).toEqual('hh:mm a');
  });

  it('converts weekday format tokens', () => {
    expect(momentToLuxonFormat('dddd, MMMM DD')).toEqual('EEEE, MMMM dd');
    expect(momentToLuxonFormat('ddd MMM DD')).toEqual('EEE MMM dd');
  });

  it('handles complex mixed formats', () => {
    expect(momentToLuxonFormat('dddd, MMMM DD, YYYY [at] HH:mm')).toEqual('EEEE, MMMM dd, yyyy [at] HH:mm');
  });

  it('preserves non-token text', () => {
    expect(momentToLuxonFormat('DD-MM-YYYY [custom text]')).toEqual('dd-MM-yyyy [custom text]');
  });
});

describe('toDateTime', () => {
  it('handles DateTime objects', () => {
    const dt = DateTime.now();

    expect(toDateTime(dt)).toBe(dt);
  });

  it('converts Date objects', () => {
    const date = new Date('2023-12-25T10:30:00Z');
    const result = toDateTime(date);

    expect(result).toBeInstanceOf(DateTime);
    expect(result.toISO()).toEqual(DateTime.fromJSDate(date).toISO());
  });

  it('parses ISO strings', () => {
    const isoString = '2023-12-25T10:30:00Z';
    const result = toDateTime(isoString);

    expect(result).toBeInstanceOf(DateTime);
    expect(result.toISO()).toEqual(DateTime.fromISO(isoString).toISO());
  });
});

describe('getWeekdays', () => {
  it('returns 7 weekdays', () => {
    const weekdays = getWeekdays();

    expect(weekdays).toHaveSize(7);
    expect(weekdays.every(day => typeof day === 'string')).toBe(true);
  });

  it('supports different lengths', () => {
    const long = getWeekdays('long');
    const short = getWeekdays('short');
    const narrow = getWeekdays('narrow');

    expect(long[0].length).toBeGreaterThan(short[0].length);
    expect(short[0].length).toBeGreaterThan(narrow[0].length);
  });
});

describe('getLocaleWeekdays', () => {
  it('returns 7 weekdays', () => {
    const weekdays = getLocaleOrderedWeekdays();

    expect(weekdays).toHaveSize(7);
    expect(weekdays.every(day => typeof day === 'string')).toBe(true);
  });

  it('reorders weekdays based on locale start of week', () => {
    const standardWeekdays = getWeekdays();
    const localeWeekdays = getLocaleOrderedWeekdays();

    // They should have the same elements, just in different order
    expect(new Set(standardWeekdays)).toEqual(new Set(localeWeekdays));
  });

  it('handles different lengths consistently', () => {
    const longWeekdays = getLocaleOrderedWeekdays('long');
    const shortWeekdays = getLocaleOrderedWeekdays('short');
    const narrowWeekdays = getLocaleOrderedWeekdays('narrow');

    expect(longWeekdays).toHaveSize(7);
    expect(shortWeekdays).toHaveSize(7);
    expect(narrowWeekdays).toHaveSize(7);

    // Verify relative ordering is preserved
    expect(longWeekdays[0].length).toBeGreaterThan(shortWeekdays[0].length);
    expect(shortWeekdays[0].length).toBeGreaterThan(narrowWeekdays[0].length);
  });

  it('maintains consistent ordering across calls', () => {
    const weekdays1 = getLocaleOrderedWeekdays();
    const weekdays2 = getLocaleOrderedWeekdays();

    expect(weekdays1).toEqual(weekdays2);
  });

  it('respects locale options', () => {
    const defaultLocale = getLocaleOrderedWeekdays();
    const customLocale = getLocaleOrderedWeekdays('long', { locale: 'en-US' });

    // Should return arrays of same length
    expect(defaultLocale).toHaveSize(7);
    expect(customLocale).toHaveSize(7);
  });

  it('correctly reorders weekdays for Sunday-first locales', () => {
    // Test with US locale which typically starts with Sunday
    const usWeekdays = getLocaleOrderedWeekdays('short', { locale: 'en-US' });
    const standardWeekdays = getWeekdays('short');

    expect(usWeekdays).toHaveSize(7);
    expect(usWeekdays[0]).toEqual('Sun');
    expect(usWeekdays[1]).toEqual('Mon');

    // The reordering should preserve all weekday names
    expect(new Set(usWeekdays)).toEqual(new Set(standardWeekdays));
  });

  it('correctly reorders weekdays for Saturday-first locales', () => {
    // Test with United Arab Emirates locale which starts with Saturday
    const uaeWeekdays = getLocaleOrderedWeekdays('short', { locale: 'ar-AE' });

    expect(uaeWeekdays).toHaveSize(7);
    expect(uaeWeekdays[0]).toEqual('السبت'); // Saturday
    expect(uaeWeekdays[1]).toEqual('الأحد');  // Sunday
  });
});
