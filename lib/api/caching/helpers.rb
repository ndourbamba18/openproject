# frozen_string_literal: true

module API
  module Caching
    module Helpers
      def with_etag!(key)
        etag = %(W/"#{::Digest::SHA1.hexdigest(key.to_s)}")
        error!("Not Modified", 304) if headers["If-None-Match"] == etag

        header "ETag", etag
      end

      ##
      # Store a represented object in its JSON representation
      def cache(key, args = {})
        # Save serialization since we're only dealing with strings here
        args[:raw] = true

        json = Rails.cache.fetch(key, args) do
          result = yield
          result.to_json
        end

        ::API::Caching::StoredRepresenter.new json
      end
    end
  end
end
