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
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
#
# See COPYRIGHT and LICENSE files for more details.
#++

class KeycloakRestClient
  def initialize(base_uri:, client_id:, client_secret:, realm: "master")
    @base_uri = base_uri
    @client_id = client_id
    @client_secret = client_secret
    @realm = realm
  end

  def users_by_email(email)
    JSON.parse(httpx.get("#{@base_uri}/admin/realms/#{@realm}/users", params: { email:, exact: true }).to_s)
  end

  def create_user(user, required_actions: [])
    credentials = []
    if user.current_password
      _, _version, iterations, = user.current_password.hashed_password.split("$")
      credentials << {
        "type" => "password",
        "userLabel" => "imported password",
        "credentialData" => { algorithm: "bcrypt", hashIterations: iterations.to_i }.to_json,
        "secretData" => { value: user.current_password.hashed_password, salt: "" }.to_json,
      }
    end

    user.otp_devices.select { |d| d.channel == :totp }.each do |device|
      credentials << {
        "type" => "otp",
        "userLabel" => device.identifier,
        "credentialData" => { subType: "totp", digits: 6, counter: 0, period: 30, algorithm: "HmacSHA1", secretEncoding: "BASE32" }.to_json,
        "secretData" => { value: device.otp_secret }.to_json
      }
    end

    # TODO: skip if there's no credentials?
    # Do we need to migrate Google SSO accounts?

    body = {
      enabled: true,
      username: user.login,
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.mail,
      credentials:,
      requiredActions: required_actions
    }

    # TODO: raise error on unexpected result
    httpx.post(
      "#{@base_uri}/admin/realms/#{@realm}/users",
      headers: {
        "Content-Type": "application/json"
      },
      body: body.to_json
    )
  end

  private

  def httpx
    OpenProject.httpx.oauth_auth(
      issuer: @base_uri,
      token_endpoint: "#{@base_uri}/realms/#{@realm}/protocol/openid-connect/token",
      client_id: @client_id,
      client_secret: @client_secret,
      scope: "basic"
    ).with_access_token
  end
end
