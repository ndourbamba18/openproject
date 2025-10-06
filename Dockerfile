ARG RUBY_VERSION="3.4.5"
FROM ruby:${RUBY_VERSION}-bookworm AS base

# OpenShift compatible user
ENV APP_USER=1001
ENV APP_PATH=/opt/app-root/src
ENV APP_DATA_PATH=/tmp/openproject/assets

# SYSTEM
ENV DEBIAN_FRONTEND=noninteractive
ENV BUNDLE_JOBS=8
ENV BUNDLE_RETRY=3
ENV BUNDLE_WITHOUT="development:test"

# RAILS
ENV SECRET_KEY_BASE=OVERWRITE_ME
ENV RAILS_ENV=production
ENV RAILS_LOG_TO_STDOUT=1
ENV RAILS_SERVE_STATIC_FILES=1

# OPENPROJECT
ENV OPENPROJECT_EDITION=standard
ENV OPENPROJECT_INSTALLATION__TYPE=openshift
ENV OPENPROJECT_ATTACHMENTS__STORAGE__PATH=/tmp/openproject/files
ENV OPENPROJECT_RAILS__CACHE__STORE=file_store
ENV OPENPROJECT_ANGULAR_UGLIFY=true

WORKDIR $APP_PATH

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    shared-mime-info \
    postgresql-client \
    file \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Install specific Node.js version
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install required bundler version FIRST
RUN gem install bundler -v 2.7.0

# Copy application files
COPY . .

# Set proper permissions for OpenShift
RUN chown -R 1001:0 $APP_PATH && \
    chmod -R g+rw $APP_PATH

# Install gems with specific bundler
RUN bundle _2.7.0_ install --jobs=$BUNDLE_JOBS --retry=$BUNDLE_RETRY --without development test

# Precompile assets
RUN bundle _2.7.0_ exec rake assets:precompile

# Clean up
RUN apt-get clean && \
    rm -rf /tmp/* /var/tmp/* /var/cache/apt/*

# OpenShift user
USER 1001

EXPOSE 8080

CMD ["bundle", "_2.7.0_", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "8080"]
