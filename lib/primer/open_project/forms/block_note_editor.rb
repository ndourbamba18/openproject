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
      # :nodoc:
      class BlockNoteEditor < Primer::Forms::BaseComponent
        include ::OpenProject::StaticRouting::UrlHelpers
        include ::AvatarHelper

        attr_reader :input,
                    :value,
                    :users,
                    :active_user,
                    :hocuspocus_url,
                    :hocuspocus_access_token,
                    :open_project_url,
                    :document_name,
                    :document_id

        delegate :name, to: :@input

        def initialize(input:, value:, document_name:, document_id:) # rubocop:disable Metrics/AbcSize
          super()
          @input = input
          @value = value
          @users = User.active.map do |user|
            {
              id: user.id,
              username: user.name,
              avatarUrl: avatar_url(user)
            }
          end
          @active_user = {
            id: User.current.id,
            username: User.current.name,
            avatarUrl: avatar_url(User.current)
          }
          @document_id = document_id
          @document_name = document_name
          @hocuspocus_url = Setting.collaborative_editing_hocuspocus_url
          @hocuspocus_access_token = ::CollaborativeEditing::DocumentAccessTokenGenerator.call(document_id, document_name, value)
          @open_project_url = root_url
        end
      end
    end
  end
end
