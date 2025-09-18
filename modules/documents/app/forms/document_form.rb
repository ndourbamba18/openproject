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

class DocumentForm < ApplicationForm
  form do |f|
    f.select_list(
      name: :category_id,
      label: I18n.t("label_document_category"),
      input_width: :medium,
      required: true
    ) do |select|
      DocumentCategory.find_each do |category|
        select.option(value: category.id, label: category.name)
      end
    end

    f.text_field(
      name: :title,
      label: I18n.t("label_document_title"),
      required: true
    )

    if OpenProject::FeatureDecisions.block_note_editor_active? && model.category&.name == "Experimental"
      f.block_note_editor(
        name: :description,
        label: I18n.t("label_document_description"),
        classes: "document-form--long-description",
        value: model.description,
        document_id: model.id,
        document_name: ::CollaborativeEditing::DocumentIdGenerator.call("documents", model.id)
      )
    else
      f.rich_text_area(
        name: :description,
        label: I18n.t("label_document_description"),
        classes: "document-form--long-description",
        rich_text_options: {
          with_text_formatting: true,
          resource:,
          turboMode: false
        }
      )
    end

    f.submit(
      name: :save,
      label: save_label,
      scheme: :primary
    ) do |button|
      button.with_leading_visual_icon(icon: :check)
    end
  end

  private

  def resource
    return unless model

    API::V3::Documents::DocumentRepresenter.create(
      model, current_user: User.current, embed_links: true
    )
  end

  def save_label
    if model.persisted?
      I18n.t("button_save")
    else
      I18n.t("button_create")
    end
  end
end
