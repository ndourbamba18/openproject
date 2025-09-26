import { DateTime } from 'luxon';

export const skeletonResources = [
  {
    id: 'skeleton-resource-1',
    title: '',
    href: 'skeleton-resource-1',
  },
  {
    id: 'skeleton-resource-2',
    title: '',
    href: 'skeleton-resource-2',
  },
  {
    id: 'skeleton-resource-3',
    title: '',
    href: 'skeleton-resource-3',
  },
];

const baseSkeleton = {
  editable: false,
  eventStartEditable: false,
  eventDurationEditable: false,
  allDay: true,
  backgroundColor: '#FFFFFF',
  borderColor: '#FFFFFF',
  title: '',
};

export const skeletonEvents = [
  {
    ...baseSkeleton,
    id: 'skeleton-1',
    resourceId: skeletonResources[0].id,
    start: DateTime.now().minus({ day: 1 }).toJSDate(),
    end: DateTime.now().plus({ day: 1 }).toJSDate(),
    viewBox: '0 0 800 80',
  },
  {
    ...baseSkeleton,
    id: 'skeleton-2',
    resourceId: skeletonResources[1].id,
    start: DateTime.now().minus({ days: 3 }).toJSDate(),
    end: DateTime.now().toJSDate(),
    viewBox: '0 0 1200 80',
  },
  {
    ...baseSkeleton,
    id: 'skeleton-3',
    resourceId: skeletonResources[2].id,
    start: DateTime.now().toJSDate(),
    end: DateTime.now().plus({ days: 3 }).toJSDate(),
    viewBox: '0 0 1200 80',
  },
];
