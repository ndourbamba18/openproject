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
import { DateTime, DateTimeUnit } from 'luxon';
import { InputState, MultiInputState } from '@openproject/reactivestates';
import { WorkPackageChangeset } from 'core-app/features/work-packages/components/wp-edit/work-package-changeset';
import { WorkPackageResource } from 'core-app/features/hal/resources/work-package-resource';
import { TimelineZoomLevel } from 'core-app/features/hal/resources/query-resource';

export const timelineElementCssClass = 'timeline-element';
export const timelineBackgroundElementClass = 'timeline-element--bg';
export const timelineGridElementCssClass = 'wp-timeline--grid-element';
export const timelineMarkerSelectionStartClass = 'selection-start';
export const timelineHeaderCSSClass = 'wp-timeline--header-element';
export const timelineHeaderSelector = 'wp-timeline-header';

/**
 *
 */
export class TimelineViewParametersSettings {
  zoomLevel:TimelineZoomLevel = 'days';
  visibleBeforeTodayInZoomLevel:number = 2;
}

// Can't properly map the enum to a string array
export const zoomLevelOrder:TimelineZoomLevel[] = [
  'days', 'weeks', 'months', 'quarters', 'years',
];

export function getPixelPerDayForZoomLevel(zoomLevel:TimelineZoomLevel) {
  switch (zoomLevel) {
    case 'days':
      return 30;
    case 'weeks':
      return 15;
    case 'months':
      return 6;
    case 'quarters':
      return 2;
    case 'years':
      return 0.5;
  }
  throw new Error(`invalid zoom level: ${zoomLevel}`);
}

/**
 * Number of pixels to display before the earliest workpackage in view
 */
export const requiredPixelMarginLeft = 120;

/**
 *
 */
export class TimelineViewParameters {
  readonly now:DateTime = DateTime.fromObject({ hour: 0, minute: 0, second: 0 });

  dateDisplayStart:DateTime = DateTime.fromObject({ hour: 0, minute: 0, second: 0 });

  dateDisplayEnd:DateTime = this.dateDisplayStart.plus({ day: 1 });

  settings:TimelineViewParametersSettings = new TimelineViewParametersSettings();

  activeSelectionMode:null | ((wp:WorkPackageResource) => any) = null;

  selectionModeStart:null | string = null;

  /**
   * The visible viewport (at the time the view parameters were calculated last!!!)
   */
  visibleViewportAtCalculationTime:[DateTime, DateTime];

  get pixelPerDay():number {
    return getPixelPerDayForZoomLevel(this.settings.zoomLevel);
  }

  get maxWidthInPx() {
    return this.maxSteps * this.pixelPerDay;
  }

  get maxSteps():number {
    return this.dateDisplayEnd.diff(this.dateDisplayStart, 'days').days;
  }

  get dayCountForMarginLeft():number {
    return Math.ceil(requiredPixelMarginLeft / this.pixelPerDay);
  }
}

/**
 *
 */
export interface RenderInfo {
  viewParams:TimelineViewParameters;
  workPackage:WorkPackageResource;
  change:WorkPackageChangeset;
  isDuplicatedCell?:boolean;
  withAlternativeLabels?:boolean;
}

/**
 *
 */
export function calculatePositionValueForDayCountingPx(viewParams:TimelineViewParameters, days:number):number {
  const daysInPx = days * viewParams.pixelPerDay;
  return daysInPx;
}

/**
 *
 */
export function calculatePositionValueForDayCount(viewParams:TimelineViewParameters, days:number):string {
  const value = calculatePositionValueForDayCountingPx(viewParams, days);
  return `${value}px`;
}

export function getTimeSlicesForHeader(vp:TimelineViewParameters,
  unit:DateTimeUnit,
  startView:DateTime,
  endView:DateTime) {
  const inViewport:[DateTime, DateTime][] = [];
  const rest:[DateTime, DateTime][] = [];

  let time = startView.startOf(unit);
  const end = endView.endOf(unit);

  while (time < end) {
    const sliceStart = DateTime.max(time, startView);
    const sliceEnd = DateTime.min(time.endOf(unit), endView);
    time = time.plus({ [unit]: 1 });

    const viewport = vp.visibleViewportAtCalculationTime;
    if ((sliceStart >= viewport[0] && sliceStart <= viewport[1])
      || (sliceEnd >= viewport[0] && sliceEnd <= viewport[1])) {
      inViewport.push([sliceStart, sliceEnd]);
    } else {
      rest.push([sliceStart, sliceEnd]);
    }
  }

  const firstRest:[DateTime, DateTime] = rest.splice(0, 1)[0];
  const lastRest:[DateTime, DateTime] = rest.pop()!;
  const inViewportAndBoundaries = _.concat(
    [firstRest].filter((e) => !_.isNil(e)),
    inViewport,
    [lastRest].filter((e) => !_.isNil(e)),
  );

  return {
    inViewportAndBoundaries,
    rest,
  };
}

export function calculateDaySpan(visibleWorkPackages:RenderedWorkPackage[],
  loadedWorkPackages:MultiInputState<WorkPackageResource>,
  viewParameters:TimelineViewParameters):number {
  let earliest:DateTime = DateTime.now();
  let latest:DateTime = DateTime.now();

  visibleWorkPackages.forEach((renderedRow) => {
    const wpId = renderedRow.workPackageId;

    if (!wpId) {
      return;
    }
    const workPackageState:InputState<WorkPackageResource> = loadedWorkPackages.get(wpId);
    const workPackage:WorkPackageResource|undefined = workPackageState.value;

    if (!workPackage) {
      return;
    }

    const start = workPackage.startDate ? workPackage.startDate : workPackage.date;
    if (start && DateTime.fromISO(start) < earliest) {
      earliest = DateTime.fromISO(start);
    }

    const due = workPackage.dueDate ? workPackage.dueDate : workPackage.date;
    if (due && DateTime.fromISO(due) > latest) {
      latest = DateTime.fromISO(due);
    }
  });

  const daysSpan = latest.diff(earliest, 'days').days + 1;
  return daysSpan;
}
