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

require "spec_helper"
require_relative "shared_context"

RSpec.describe "Scored Lists and Calculated Values", :js, with_ee: %i[calculated_values],
                                                          with_flag: { scored_list_custom_fields: true,
                                                                       calculated_value_project_attribute: true } do
  current_user { create(:admin) }

  let!(:project) { create(:project) }
  let!(:scored_list) { create(:scored_list_project_custom_field, projects: [project]) }
  let!(:one) { create(:hierarchy_item, parent: scored_list.hierarchy_root, label: "One", score: 1) }
  let!(:two) { create(:hierarchy_item, parent: scored_list.hierarchy_root, label: "Two", score: 2) }
  let!(:calculated_value) do
    create(:calculated_value_project_custom_field,
           :skip_validations,
           projects: [project],
           formula: "{{cf_#{scored_list.id}}} * 2")
  end

  context "with sufficient permissions" do
    before do
      visit edit_admin_settings_project_custom_field_path(scored_list)
    end

    it "shows a correct breadcrumb menu" do
      within ".PageHeader-breadcrumbs" do
        expect(page).to have_link("Administration")
        expect(page).to have_link("Projects")
        expect(page).to have_link("Project attributes")
        expect(page).to have_text(scored_list.name)
      end
    end

    it "shows tab navigation" do
      within_test_selector("project_attribute_detail_header") do
        expect(page).to have_link("Details")
        expect(page).to have_link("Projects")
      end
    end

    describe "editing scored lists triggers Calculate Value recalculation" do
      def click_edit_button(hierarchy_item)
        within("#admin-custom-fields-hierarchy-item-component-#{hierarchy_item.id}") do
          edit_button = page.find_test_selector("op-hierarchy-item--action-menu")
          expect(edit_button).to be_present
          edit_button.click
        end
      end

      before do
        project.custom_values.create!(custom_field: scored_list, value: one.id)
      end

      it "when updating a score" do
        click_on "Items"

        click_edit_button(one)

        click_on "Edit"
        expect(page).to have_field("score", with: "1.0")
        fill_in("score", with: "2.0")
        click_on "Save"

        expect(project.reload.custom_value_for(calculated_value).value).to eq("4.0")
      end

      it "when deleting an item" do
        click_on "Items"

        click_edit_button(one)

        click_on "Delete"
        page.find_field("confirm_dangerous_action").click
        click_on "Delete permanently"

        expect(project.reload.custom_value_for(calculated_value).value).to be_nil
      end
    end
  end
end
