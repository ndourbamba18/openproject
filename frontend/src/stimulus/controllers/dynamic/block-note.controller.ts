/*
 * -- copyright
 * OpenProject is an open source project management software.
 * Copyright (C) 2023 the OpenProject GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 3.
 *
 * OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
 * Copyright (C) 2006-2013 Jean-Philippe Lang
 * Copyright (C) 2010-2013 the ChiliProject Team
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * See COPYRIGHT and LICENSE files for more details.
 * ++
 */

import { Controller } from '@hotwired/stimulus';
import React from 'react';
import { createRoot } from 'react-dom/client';
import OpBlockNoteContainer from '../../../react/OpBlockNoteContainer';
import { User } from '@blocknote/core/comments';

export default class extends Controller {
  static targets = [
    'blockNoteEditor',
    'blockNoteInputField',
  ];

  static values = {
    inputText: String,
    users: Array,
    activeUser: Object,
    hocuspocusUrl: String,
    hocuspocusAccessToken: String,
    documentName: String,
    documentId: String,
    openProjectUrl: String,
  };

  declare readonly blockNoteEditorTarget:HTMLElement;
  declare readonly blockNoteInputFieldTarget:HTMLInputElement;
  declare readonly inputTextValue:string;
  declare readonly usersValue:User[];
  declare readonly activeUserValue:User;
  declare readonly hocuspocusUrlValue:string;
  declare readonly hocuspocusAccessTokenValue:string;
  declare readonly documentNameValue:string;
  declare readonly documentIdValue:string;
  declare readonly openProjectUrlValue:string;

  connect() {
    const root = createRoot(this.blockNoteEditorTarget);
    root.render(this.BlockNoteReactContainer());
  }

  BlockNoteReactContainer() {
    return React.createElement(OpBlockNoteContainer, {
      inputField: this.blockNoteInputFieldTarget,
      inputText: this.inputTextValue,
      users: this.usersValue,
      activeUser: this.activeUserValue,
      hocuspocusUrl: this.hocuspocusUrlValue,
      hocuspocusAccessToken: this.hocuspocusAccessTokenValue,
      documentName: this.documentNameValue,
      documentId: this.documentIdValue,
      openProjectUrl: this.openProjectUrlValue,
    });
  }
}
