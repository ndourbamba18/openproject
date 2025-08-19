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

##
# This is a fix for a new SMTP bug introduced with Ruby 3.
# This can be removed once the official fix from the `mail` gem maintainers
# has been released and the gem bumped by us.
#
# Details: https://community.openproject.org/projects/openproject/work_packages/42385/activity
module OpenProject
  module Patches
    module MailSmtpStartTlsAutoHotfix
      def build_smtp_session
        super.tap do |smtp|
          smtp.disable_starttls if disable_starttls?
        end
      end

      def disable_starttls?
        settings[:enable_starttls_auto] == false && !settings[:enable_starttls]
      end
    end
  end
end

require "mail"

Mail::SMTP.prepend OpenProject::Patches::MailSmtpStartTlsAutoHotfix
