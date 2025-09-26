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

import { WorkPackageChangeset } from 'core-app/features/work-packages/components/wp-edit/work-package-changeset';
import { IFieldSchema } from 'core-app/shared/components/fields/field.base';
/**
 * Specialized WorkPackageChangeset for edit form submissions.
 * Automatically includes required custom fields for validation.
 */
export class EditFormWorkPackageChangeset extends WorkPackageChangeset {
  protected applyChanges(payload:any):any {
    const result = super.applyChanges(payload);

    // Include required custom fields when changeset is in flight (being saved)
    // This ensures validation happens during form submissions
    if (this.inFlight && this.schema) {
      this.includeRequiredCustomFieldsForValidation(result);
    }

    return result;
  }

  /**
   * Include required custom fields in the payload for edit form submissions
   * to ensure they are validated on the backend
   */
  private includeRequiredCustomFieldsForValidation(payload:any):void {
    // Get all custom field keys from the schema
    const customFieldKeys =
      this.schema.availableAttributes.filter(key => key.startsWith('customField'));

    customFieldKeys.forEach(customFieldKey => {
      // Only include required custom fields that aren't already in payload from changes
      const property = this.schema.ofProperty(customFieldKey) as IFieldSchema|null;

      if (!(customFieldKey in payload) && property?.required) {
        // Include the current value from the pristine resource
        const currentValue = this.pristineResource[customFieldKey];
        if (currentValue !== undefined) {
          payload[customFieldKey] = currentValue;
        }
      }
    });
  }
}
