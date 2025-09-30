# frozen_string_literal: true

# -- copyright
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
# ++

module API
  module V3
    module Workspaces
      module WorkspaceRepresenterFactory
        module Associations
          extend ActiveSupport::Concern
          include API::Decorators::LinkedResource

          def project_link(project, name:, getter: "#{name}_id")
            # Explicitly check for admin as an archived project
            # will lead to the admin losing permissions in the project.
            if project && !project.visible? && !current_user.admin?
              {
                href: API::V3::URN_UNDISCLOSED,
                title: I18n.t(:"api_v3.undisclosed.#{name}")
              }
            elsif !project
              {
                href: nil
              }
            else
              associated_resource_default_link(project,
                                               :itself,
                                               v3_path: project&.workspace_type,
                                               skip_link: -> { false },
                                               title_attribute: :name,
                                               getter:)
            end
          end

          class_methods do
            def associated_project(name, skip_render: false)
              associated_resource name,
                                  representer: ::API::V3::Projects::ProjectRepresenter,
                                  uncacheable_link: true,
                                  skip_render:,
                                  link: ::API::V3::Workspaces::WorkspaceRepresenterFactory
                                          .create_link_lambda(name),
                                  setter: ::API::V3::Workspaces::WorkspaceRepresenterFactory
                                            .create_setter_lambda(name)
            end
          end
        end

        module_function

        def create_link_lambda(name, property_name: name)
          ->(*) {
            project_link(represented.public_send(name),
                         name: property_name,
                         getter: :id)
          }
        end

        def create_setter_lambda(name, property_name: name, namespaces: %i(projects programs portfolios))
          ->(fragment:, **) {
            ::API::Decorators::LinkObject
              .new(represented,
                   property_name:,
                   namespace: namespaces,
                   getter: :"#{name}_id",
                   setter: :"#{name}_id=")
              .from_hash(fragment)
          }
        end
      end
    end
  end
end
