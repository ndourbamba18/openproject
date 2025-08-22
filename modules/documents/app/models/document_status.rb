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

class DocumentStatus < ApplicationRecord
  # https://primer.style/product/components/label/#Label
  enum :color_variant, {
    default: "default",
    primary: "primary",
    secondary: "secondary",
    accent: "accent",
    success: "success",
    attention: "attention",
    severe: "severe",
    danger: "danger",
    done: "done",
    sponsors: "sponsors"
  }, suffix: true

  has_many :documents, class_name: "CollaborativeDocument",
                       foreign_key: :status_id,
                       dependent: :nullify,
                       inverse_of: :status
  has_many :workflows, class_name: "DocumentWorkflow",
                       foreign_key: :old_status_id,
                       dependent: :destroy,
                       inverse_of: :old_status

  normalizes :name, with: ->(name) { name.strip.capitalize }

  validates :name, presence: true, uniqueness: { case_sensitive: false }
end
