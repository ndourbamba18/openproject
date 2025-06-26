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

class Overviews::ProjectCustomFieldSectionsController < ApplicationController
  include OpTurbo::ComponentStream

  before_action :find_project_by_project_id
  before_action :find_project_custom_field_section
  before_action :authorize

  def show_dialog
    respond_with_dialog(
      Overviews::ProjectCustomFields::EditDialogComponent.new(
        project: @project,
        project_custom_field_section: @section
      )
    )
  end

  def update
    service_call = ::Projects::UpdateService
                    .new(
                      user: current_user,
                      model: @project,
                      contract_options: { project_attributes_only: true }
                    )
                    .call(permitted_params.project)

    if service_call.success?
      update_sidebar_component
    else
      handle_errors(service_call.result, @section)
    end

    respond_to_with_turbo_streams(status: service_call.success? ? :ok : :unprocessable_entity)
  end

  private

  def find_project_custom_field_section
    @section = ProjectCustomFieldSection.find(params[:id])
  end

  def handle_errors(project_with_errors, section)
    update_via_turbo_stream(
      component: Overviews::ProjectCustomFields::EditComponent.new(
        project: project_with_errors,
        project_custom_field_section: section
      )
    )
  end

  def update_sidebar_component
    update_via_turbo_stream(
      component: Overviews::ProjectCustomFields::SidePanelComponent.new(project: @project)
    )
  end
end
