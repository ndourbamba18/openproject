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

require "spec_helper"
require "rack/test"

RSpec.describe "API v3 Project resource index", content_type: :json do
  include Rack::Test::Methods
  include API::V3::Utilities::PathHelper

  shared_let(:no_membership_project) do
    create(:project, public: false)
  end
  shared_let(:permissions, reload: true) { [] }
  shared_let(:role, reload: true) { create(:project_role, permissions:) }
  shared_let(:project, reload: true) do
    create(:project, public: false)
  end
  shared_let(:program, reload: true) do
    create(:project, public: false, workspace_type: "program")
  end
  shared_let(:portfolio, reload: true) do
    create(:project, public: false, workspace_type: "portfolio")
  end
  shared_let(:user, reload: true) do
    create(:user,
           member_with_roles:
             {
               portfolio => role,
               program => role,
               project => role
             })
  end

  let(:filters) { [] }
  let(:get_path) do
    api_v3_paths.path_for :workspaces, filters:
  end
  let(:response) { last_response }

  current_user { user }

  before do
    get get_path
  end

  it_behaves_like "API V3 collection response", 3, 3 do
    let(:elements) { [portfolio, program, project] }

    it "provides distinct types per workspace type" do
      aggregate_failures do
        expect(subject).to be_json_eql("Portfolio".to_json).at_path("_embedded/elements/0/_type")
        expect(subject).to be_json_eql("Program".to_json).at_path("_embedded/elements/1/_type")
        expect(subject).to be_json_eql("Project".to_json).at_path("_embedded/elements/2/_type")
      end
    end
  end
end
