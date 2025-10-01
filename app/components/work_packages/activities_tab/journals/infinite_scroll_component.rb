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

module WorkPackages
  module ActivitiesTab
    module Journals
      class InfiniteScrollComponent < ApplicationComponent
        include OpPrimer::ComponentHelpers
        include OpTurbo::Streamable
        include WorkPackages::ActivitiesTab::StimulusControllers

        def initialize(work_package:, page: 1, next_page: nil)
          super
          @work_package = work_package
          @page = page
          @next_page = next_page
        end

        private

        attr_reader :work_package, :page, :next_page

        def wrapper_data_attributes
          {
            controller: infinite_scroll_stimulus_controller,
            infinite_scroll_stimulus_controller("-insert-target-id-value") => insert_target_id,
            infinite_scroll_stimulus_controller("-page-value") => page,
            infinite_scroll_stimulus_controller("-is-last-page-value") => next_page.blank?,
            infinite_scroll_stimulus_controller("-url-value") => page_streams_url
          }
        end

        def insert_target_id
          WorkPackages::ActivitiesTab::Journals::IndexComponent.insert_target_modifier_id
        end

        def page_streams_url
          page_streams_work_package_activities_path(work_package, format: :turbo_stream)
        end
      end
    end
  end
end
