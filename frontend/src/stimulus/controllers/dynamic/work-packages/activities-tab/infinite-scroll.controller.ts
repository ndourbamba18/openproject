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

import { TurboRequestsService } from 'core-app/core/turbo/turbo-requests.service';
import type { TurboBeforeStreamRenderEvent } from 'core-typings/turbo';
import { useIntersection } from 'stimulus-use';
import BaseController from './base.controller';
import { DomHelpers } from './services/dom_helpers';

export default class extends BaseController {
  static values = {
    url: String,
    insertTargetId: String,
    page: { type: Number, default: 1 },
    isLastPage: Boolean,
  };

  static targets = ['skeleton'];

  declare urlValue:string;
  declare insertTargetIdValue:string;
  declare pageValue:number;
  declare isLastPageValue:boolean;

  declare readonly skeletonTarget:HTMLElement;
  declare readonly hasSkeletonTarget:boolean;

  private updateInProgress = false;
  private turboRequests:TurboRequestsService;
  private abortController = new AbortController();
  private pageStreamHandler?:(_event:TurboBeforeStreamRenderEvent) => void;

  connect() {
    if (this.isLastPageValue) return;

    super.connect();
    void this.initializeTurboRequestService();
    useIntersection(this, { threshold: 1.0 });

    this.setupScrollPreservation();
  }

  disconnect() {
    super.disconnect();
    this.abortController.abort();
    if (this.pageStreamHandler) this.pageStreamHandler = undefined;
  }

  async appear() {
    if (this.updateInProgress || this.isLastPageValue) return;

    this.updateInProgress = true;

    await this.fetchNextPageStream()
      .catch((error) => {
        console.error('Error fetching next page:', error);
      }).finally(() => {
        this.updateInProgress = false;
      });
  }

  isLastPageValueChanged(isLastPage:boolean, _previousValue:boolean) {
    if (isLastPage) {
      (this.element as HTMLElement).hidden = true;
      if (this.hasSkeletonTarget) this.skeletonTarget.remove();
    }
  }

  setupScrollPreservation() {
    if (!this.scrollableContainer || this.pageStreamHandler) return;

    const { signal } = this.abortController;

    this.pageStreamHandler = (event:TurboBeforeStreamRenderEvent) => {
      event.preventDefault();

      const stream = event.detail.newStream;
      const scrollContainer = this.scrollableContainer!;

      if (stream.target.includes(this.insertTargetIdValue)) {
        const isPrepend = stream.action === 'prepend';
        void DomHelpers.keepScroll(scrollContainer, isPrepend, () => {
          event.detail.render(stream);
          return Promise.resolve();
        });
      } else {
        event.detail.render(stream);
      }
    };

    document.addEventListener('turbo:before-stream-render', this.pageStreamHandler as EventListener, { signal });
  }

  private fetchNextPageStream():Promise<{ html:string, headers:Headers }> {
    const url = this.preparePageStreamsUrl();
    return this.turboRequests.requestStream(url);
  }

  private preparePageStreamsUrl():string {
    const baseUrl = window.location.origin;
    const url = new URL(this.urlValue, baseUrl);
    this.pageValue += 1;

    url.searchParams.set('page', this.pageValue.toString());
    url.searchParams.set('filter', this.indexOutlet.filterValue);

    return url.toString();
  }

  private async initializeTurboRequestService() {
    const context = await window.OpenProject.getPluginContext();
    this.turboRequests = context.services.turboRequests;
  }
}
