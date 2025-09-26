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

import { Injectable } from '@angular/core';
import { ConfigurationService } from 'core-app/core/config/configuration.service';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { DateTime, Duration, DurationUnit, Settings } from 'luxon';
import { outputChronicDuration } from '../../shared/helpers/chronic_duration';
import { DateLike, momentToLuxonFormat, toDateTime } from 'core-app/shared/helpers/date-time-helpers';

@Injectable({ providedIn: 'root' })
export class TimezoneService {
  constructor(
    readonly configurationService:ConfigurationService,
    readonly I18n:I18nService,
  ) { }

  /**
   * Returns the user's configured timezone or guesses it
   */
  public userTimezone():string {
    return this.configurationService.isTimezoneSet() ? this.configurationService.timezone() : Settings.defaultZone.name;
  }

  /**
   * Takes a utc date time string and turns it into
   * a local date time object.
   */
  public parseDatetime(dateTime:DateLike):DateTime {
    return toDateTime(dateTime).setZone(this.userTimezone());
  }

  public parseDate(date:DateLike):DateTime {
    return toDateTime(date);
  }

  /**
   * Parses the specified date time and applies the user's configured timezone, if any.
   *
   * This will effectfully transform the [server] provided date time object to the user's configured local timezone.
   *
   * @param {String} dateTime in 'YYYY-MM-DDTHH:mm:ssZ' format
   * @returns {DateTime}
   */
  public parseISODatetime(dateTime:string):DateTime {
    return this.parseDatetime(dateTime);
  }

  public parseISODate(date:string):DateTime {
    return DateTime.fromISO(date);
  }

  public formattedDate(date:DateLike, format?:string):string {
    const dt = toDateTime(date);
    const fmt = format ?? this.getDateFormatString();
    if (fmt) {
      return dt.toFormat(fmt);
    }

    return dt.toLocaleString(this.getDateFormatOptions());
  }

  /**
   * Returns the number of days from today the given dateString is apart.
   * Negative means the date lies in the past.
   * @param dateString
   */
  public daysFromToday(dateString:string|null):number {
    if (!dateString) {
      return 0;
    }

    const dt = DateTime.fromISO(dateString);
    const today = DateTime.now().startOf('day');

    return dt.diff(today, 'days').days;
  }

  public formattedTime(time:DateLike, format?:string):string {
    const dt = toDateTime(time);
    const fmt = format ?? this.getTimeFormatString();
    if (fmt) {
      return dt.toFormat(fmt);
    }

    return dt.toLocaleString(this.getTimeFormatOptions());
  }

  public formattedDatetime(dateTime:DateLike):string {
    const c = this.formattedDatetimeComponents(dateTime);
    return `${c[0]} ${c[1]}`;
  }

  public formattedRelativeDateTime(dateTime:DateLike):string {
    const dt = this.parseDatetime(dateTime);
    return dt.toRelative() ?? '';
  }

  public formattedDatetimeComponents(dateTime:DateLike):[string, string] {
    const dt = this.parseDatetime(dateTime);
    return [
      this.formattedDate(dt),
      this.formattedTime(dt)
    ];
  }

  public toSeconds(durationString:string|null):number {
    if (!durationString) return 0;

    return Number(Duration.fromISO(durationString).as('seconds').toFixed(2));
  }

  public toHours(durationString:string|null):number {
    if (!durationString) return 0;

    return Number(Duration.fromISO(durationString).as('hours').toFixed(2));
  }

  public toDays(durationString:string|null):number {
    if (!durationString) return 0;

    return Number(Duration.fromISO(durationString).as('days').toFixed(2));
  }

  public toISODuration(input:string|number, unit:DurationUnit):string {
    return Duration.fromObject({ [unit]: input }).toISO();
  }

  public utcDateToLocalDate(date:Date):Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  }

  public utcDateToISODateString(date:Date):string {
    return DateTime.fromJSDate(date).toUTC().toISODate() ?? '';
  }

  public utcDatesToISODateStrings(dates:Date[]):string[] {
    return dates.map((date) => this.utcDateToISODateString(date));
  }

  public formattedDuration(durationString:string|null, unit:'hour'|'days' = 'hour'):string {
    switch (unit) {
      case 'hour':
        return this.I18n.t('js.units.hour', {
          count: this.toHours(durationString),
        });
      case 'days':
        return this.I18n.t('js.units.day', {
          count: this.toDays(durationString),
        });
      default:
        // Case fallthrough for eslint
        return '';
    }
  }

  public formattedChronicDuration(durationString:string, opts = {
    format: this.configurationService.durationFormat(),
    hoursPerDay: this.configurationService.hoursPerDay(),
    daysPerMonth: this.configurationService.daysPerMonth(),
  }):string {
    if (!durationString) {
      return '0h';
    }

    // Keep in sync with app/services/duration_converter#output
    const seconds = this.toSeconds(durationString);

    return outputChronicDuration(seconds, opts) || '0h';
  }

  public formattedISODate(date:DateLike):string {
    return this.parseDate(date).toISODate() ?? '';
  }

  public formattedISODateTime(dateTime:DateTime):string {
    return dateTime.toISO({ suppressMilliseconds: true }) ?? '';
  }

  public isValidISODate(date:string):boolean {
    return DateTime.fromISO(date).isValid;
  }

  public isValidISODateTime(dateTime:string):boolean {
    return DateTime.fromISO(dateTime).isValid;
  }

  private getDateFormatString():string|null {
    const fmt = this.configurationService.dateFormat();
    if (!fmt) return null;

    return momentToLuxonFormat(fmt);
  }

  private getDateFormatOptions():Intl.DateTimeFormatOptions {
    return this.configurationService.dateFormatOptions();
  }

  private getTimeFormatString():string|null {
    const fmt = this.configurationService.timeFormat();
    if (!fmt) return null;

    return momentToLuxonFormat(fmt);
  }

  private getTimeFormatOptions():Intl.DateTimeFormatOptions {
    return this.configurationService.timeFormatOptions();
  }
}
