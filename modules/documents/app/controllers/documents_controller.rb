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

class DocumentsController < ApplicationController
  include AttachableServiceCall
  default_search_scope :documents
  model_object Document

  before_action :find_project_by_project_id, only: %i[index new create]
  before_action :find_model_object, except: %i[index new create]
  before_action :find_project_from_association, except: %i[index new create]
  before_action :authorize

  def index
    @documents = @project.documents.includes(documentable: %i[type status]).order(updated_at: :desc)
  end

  def show
    @attachments = @document.attachments.order(Arel.sql("created_at DESC"))
  end

  def new
    @document = @project.documents.build
    @document.attributes = document_params
  end

  def create
    call = attachable_create_call ::Documents::CreateService,
                                  args: document_params.merge(project: @project)

    if call.success?
      flash[:notice] = I18n.t(:notice_successful_create)
      redirect_to project_documents_path(@project)
    else
      @document = call.result
      render action: :new, status: :unprocessable_entity
    end
  end

  def edit
    @categories = DocumentCategory.all
  end

  def update
    call = attachable_update_call ::Documents::UpdateService,
                                  model: @document,
                                  args: document_params

    if call.success?
      flash[:notice] = I18n.t(:notice_successful_update)
      redirect_to action: "show", id: @document
    else
      @document = call.result
      render action: :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @document.destroy
    redirect_to controller: "/documents", action: "index", project_id: @project
  end

  private

  def document_params
    params.fetch(:document, {}).permit("category_id", "title", "description")
  end
end
