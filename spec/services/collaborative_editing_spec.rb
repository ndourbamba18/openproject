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

RSpec.describe CollaborativeEditing::DocumentIdGenerator do
  describe ".call" do
    let(:secret_key_base) { "test_secret" }

    before do
      allow(Rails.application).to receive(:secret_key_base).and_return(secret_key_base)
    end

    it "returns a SHA256 HMAC hex digest of category and id" do
      result = described_class.call("documents", 123)

      expect(result).to eq("a809f02491b92e3addef5bc78319f788ca0d9c8e56c9a67532f6f8d76e5b54cc")
    end
  end
end

RSpec.describe CollaborativeEditing::DocumentAccessTokenGenerator do
  describe ".call" do
    let(:document_id) { 123 }
    let(:document_name) { "a809f02491b92e3addef5bc78319f788ca0d9c8e56c9a67532f6f8d76e5b54cc" }
    let(:document_text) { "Some text" }
    let(:secret) { "jwt_secret" }

    context "when Setting.collaborative_editing_hocuspocus_secret is present" do
      before do
        allow(Setting).to receive(:collaborative_editing_hocuspocus_secret).and_return(secret)
      end

      it "returns a JWT token" do
        token = described_class.call(document_id, document_name, document_text)

        expect(token).to be_a(String)

        payload, header = JWT.decode(token, secret, true, algorithm: "HS256")

        expect(payload["document_id"]).to eq(document_id)
        expect(payload["document_name"]).to eq(document_name)
        expect(payload["document_text"]).to eq(document_text)
        expect(payload["exp"]).to be_within(5).of(20.minutes.from_now.to_i)
        expect(header["alg"]).to eq("HS256")
      end
    end

    context "when Setting.collaborative_editing_hocuspocus_secret is not present" do
      before do
        allow(Setting).to receive(:collaborative_editing_hocuspocus_secret).and_return(nil)
      end

      it "returns nil" do
        expect(described_class.call(document_id, document_name, document_text)).to be_nil
      end
    end
  end
end
