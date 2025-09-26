import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { firstValueFrom, Observable } from 'rxjs';

import { ApiV3ListFilter } from 'core-app/core/apiv3/paths/apiv3-list-resource.interface';
import { DayStore } from 'core-app/core/state/days/day.store';
import { IDay } from 'core-app/core/state/days/day.model';
import {
  ResourceStore,
  ResourceStoreService,
} from 'core-app/core/state/resource-store.service';
import { DateTime } from 'luxon';
import { DateLike, toDateTime } from 'core-app/shared/helpers/date-time-helpers';

@Injectable()
export class DayResourceService extends ResourceStoreService<IDay> {
  protected basePath():string {
    return this
      .apiV3Service
      .days
      .nonWorkingDays
      .path;
  }

  isNonWorkingDay$(input:Date):Promise<boolean> {
    const date = DateTime.fromJSDate(input).toISODate();

    return firstValueFrom(
      this
        .requireNonWorkingYear$(input)
        .pipe(
          map((days) => days.findIndex((day:IDay) => day.date === date) !== -1),
        ),
    );
  }

  requireNonWorkingYear$(date:DateLike):Observable<IDay[]> {
    const from = toDateTime(date).startOf('year').toISODate()!;
    const to = toDateTime(date).endOf('year').toISODate()!;

    const filters:ApiV3ListFilter[] = [
      ['date', '<>d', [from, to]],
    ];

    return this.requireCollection({ filters });
  }

  requireNonWorkingYears$(start:DateLike, end:DateLike):Observable<IDay[]> {
    const from = toDateTime(start).startOf('year').toISODate()!;
    const to = toDateTime(end).endOf('year').toISODate()!;

    const filters:ApiV3ListFilter[] = [
      ['date', '<>d', [from, to]],
    ];

    return this.requireCollection({ filters });
  }

  protected createStore():ResourceStore<IDay> {
    return new DayStore();
  }
}
