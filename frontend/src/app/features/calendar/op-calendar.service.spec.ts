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

import { waitForAsync } from '@angular/core/testing';
import { OpCalendarService } from 'core-app/features/calendar/op-calendar.service';

describe('OP calendar service', () => {
  let service:OpCalendarService;

  beforeEach(waitForAsync(() => {
    // This is not a valid constructor call, but since we only want to test a helper method that does not
    // depend on injected services, we can pass null values here.
    // @ts-expect-error ignore invalid constructor call since we don't need a completely valid instance
    service = new OpCalendarService(null, null, null);
  }));

  describe('stripYearFromDateFormat', () => {
    it('from dotted syntax', () => {
      expect(service.stripYearFromDateFormat('dd.MM.yyyy')).toEqual('dd.MM.');
    });

    it('from slash syntax', () => {
      expect(service.stripYearFromDateFormat('MM/dd/yyyy')).toEqual('MM/dd');
      expect(service.stripYearFromDateFormat('dd/MM/yyyy')).toEqual('dd/MM');
    });

    it('from dash syntax', () => {
      expect(service.stripYearFromDateFormat('dd-MM-yyyy')).toEqual('dd-MM');
      expect(service.stripYearFromDateFormat('yyyy-MM-dd')).toEqual('MM-dd');
    });

    it('from spaced syntax', () => {
      expect(service.stripYearFromDateFormat('dd MMM yyyy')).toEqual('dd MMM');
      expect(service.stripYearFromDateFormat('dd MMMM yyyy')).toEqual('dd MMMM');
    });

    it('from comma syntax', () => {
      expect(service.stripYearFromDateFormat('MMM dd, yyyy')).toEqual('MMM dd');
      expect(service.stripYearFromDateFormat('MMMM dd, yy')).toEqual('MMMM dd');
    });
  });
});
