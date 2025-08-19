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

require "carrierwave/storage/fog"

##
# Code copied straight from the CarrierWave source.
# All we did is add `options[:expire_at]`.
#
# @todo Upgrade to CarrierWave 2.0.2 to make this patch obsolete.

module OpenProject::Patches::FogFile
  extend ActiveSupport::Concern

  included do
    def authenticated_url(options = {})
      if ["AWS", "Google", "Rackspace", "OpenStack"].include?(@uploader.fog_credentials[:provider])
        # avoid a get by using local references
        local_directory = connection.directories.new(key: @uploader.fog_directory)
        local_file = local_directory.files.new(key: path)
        expire_at = options[:expire_at] || (::Fog::Time.now + @uploader.fog_authenticated_url_expiration)
        case @uploader.fog_credentials[:provider]
        when "AWS", "Google"
          # Older versions of fog-google do not support options as a parameter
          if url_options_supported?(local_file)
            local_file.url(expire_at, options)
          else
            warn "Options hash not supported in #{local_file.class}. You may need to upgrade your Fog provider."
            local_file.url(expire_at)
          end
        when "Rackspace"
          connection.get_object_https_url(@uploader.fog_directory, path, expire_at, options)
        when "OpenStack"
          connection.get_object_https_url(@uploader.fog_directory, path, expire_at)
        else
          local_file.url(expire_at)
        end
      end
    end
  end
end

OpenProject::Patches.patch_gem_version "carrierwave", "1.3.4" do
  CarrierWave::Storage::Fog::File.include OpenProject::Patches::FogFile
end
