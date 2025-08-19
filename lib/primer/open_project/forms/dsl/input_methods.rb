# frozen_string_literal: true

#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See COPYRIGHT and LICENSE files for more details.
#++

module Primer
  module OpenProject
    module Forms
      module Dsl
        module InputMethods
          def multi(**, &)
            super(**decorate_options(**), &)
          end

          def check_box(**, &)
            super(**decorate_options(**), &)
          end

          def radio_button_group(**, &)
            super(**decorate_options(**), &)
          end

          def check_box_group(**, &)
            super(**decorate_options(**), &)
          end

          def autocompleter(**, &)
            add_input AutocompleterInput.new(builder:, form:, **decorate_options(**), &)
          end

          def block_note_editor(**, &)
            add_input BlockNoteEditorInput.new(builder:, form:, **decorate_options(**), &)
          end

          def color_select_list(**, &)
            add_input ColorSelectInput.new(builder:, form:, **decorate_options(**), &)
          end

          def html_content(&)
            add_input HtmlContent.new(&)
          end

          def pattern_input(**, &)
            add_input PatternInput.new(builder:, form:, **decorate_options(**), &)
          end

          def project_autocompleter(**, &)
            add_input ProjectAutocompleterInput.new(builder:, form:, **decorate_options(**), &)
          end

          def range_date_picker(**)
            add_input RangeDatePickerInput.new(builder:, form:, **decorate_options(**))
          end

          def rich_text_area(**)
            add_input RichTextAreaInput.new(builder:, form:, **decorate_options(**))
          end

          def single_date_picker(**)
            add_input SingleDatePickerInput.new(builder:, form:, **decorate_options(**))
          end

          def storage_manual_project_folder_selection(**)
            add_input StorageManualProjectFolderSelectionInput.new(builder:, form:, **decorate_options(**))
          end

          def work_package_autocompleter(**, &)
            add_input WorkPackageAutocompleterInput.new(builder:, form:, **decorate_options(**), &)
          end

          def decorate_options(include_help_text: true, help_text_options: {}, **options)
            if include_help_text && supports_help_texts?(form.model)
              attribute_name = help_text_options[:attribute_name] || options[:name]
              options[:label] = form.wrap_attribute_label_with_help_text(options[:label], attribute_name)
            end
            options
          end

          private

          def supports_help_texts?(model)
            return @supports_help_texts if defined?(@supports_help_texts)

            @supports_help_texts = model && ::AttributeHelpText.available_types.include?(model.model_name)
          end
        end
      end
    end
  end
end
