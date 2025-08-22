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
require_module_spec_helper

RSpec.describe DocumentStatus do
  describe "Enums" do
    it do
      expect(subject).to define_enum_for(:color_variant)
        .with_values(
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
        )
        .with_suffix
        .backed_by_column_of_type(:string)
    end
  end

  describe "Associations" do
    it do
      expect(subject).to have_many(:documents)
        .class_name("CollaborativeDocument")
        .dependent(:nullify)
        .with_foreign_key(:status_id)
    end

    it do
      expect(subject).to have_many(:workflows)
        .class_name("DocumentWorkflow")
        .dependent(:destroy)
        .with_foreign_key(:old_status_id)
    end
  end

  describe "Normalizations" do
    it { is_expected.to normalize(:name).from("  testing you  ").to("Testing you") }
  end

  describe "Validations" do
    subject { build(:document_status) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
  end

  describe "Database constraints" do
    it { is_expected.to have_db_index(:name).unique(true) }
  end
end
