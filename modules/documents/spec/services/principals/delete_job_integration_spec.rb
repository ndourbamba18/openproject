# frozen_string_literal: true

#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is an open source project management software.
# Copyright (C) the OpenProject GmbH
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
# along with this program; if not, write to the FreeSoftware
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See COPYRIGHT and LICENSE files for more details.
#++

require "spec_helper"
require_module_spec_helper

RSpec.describe Principals::DeleteJob, "Documents", type: :model do
  subject(:job) { described_class.perform_now(principal) }

  shared_let(:project) { create(:project) }
  shared_let(:document_type) { create(:document_type) }
  shared_let(:document_status) { create(:document_status) }

  shared_let(:deleted_user) { create(:deleted_user) }

  let(:principal) { create(:user) }

  describe "#perform" do
    let(:document) do
      create(:document,
             project:,
             type: document_type,
             status: document_status,
             assigned_to: principal,
             responsible: principal,
             author: principal)
    end

    before do
      document
      job
    end

    it "resets assigned_to to the deleted user" do
      expect(document.reload.assigned_to).to eql(deleted_user)
    end

    it "resets author to the deleted user" do
      expect(document.reload.author).to eql(deleted_user)
    end

    it "resets responsible to the deleted user" do
      expect(document.reload.responsible).to eql(deleted_user)
    end
  end
end
