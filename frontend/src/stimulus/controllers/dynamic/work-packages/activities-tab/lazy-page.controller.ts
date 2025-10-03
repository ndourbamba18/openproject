/*
 * -- copyright
 * OpenProject is an open source project management software.
 * Copyright (C) the OpenProject GmbH
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

export default class LazyPageController extends BaseController {
  static values = {
    url: String,
    insertTargetId: String,
    page: { type: Number, default: 1 },
    isLoaded: { type: Boolean, default: false },
  };

  declare urlValue:string;
  declare insertTargetIdValue:string;
  declare pageValue:number;
  declare isLoadedValue:boolean;

  private turboRequests:TurboRequestsService;
  private abortController = new AbortController();
  private pageStreamHandler?:(_event:TurboBeforeStreamRenderEvent) => void;
  private stopObserving?:() => void;

  connect() {
    if (this.isLoadedValue) return;

    super.connect();
    void this.initializeTurboRequestService();
    this.setupScrollPreservation();
  }

  disconnect() {
    super.disconnect();
    this.tearDownScrollPreservation();
    this.stopObserving?.();
  }

  async appear(entry:IntersectionObserverEntry, observer:IntersectionObserver) {
    observer.unobserve(entry.target); // observe and emit `appear()` callback just once
    if (this.isLoadedValue) return;

    await this.fetchPageStream()
      .catch((error) => {
        console.error('Error fetching next page:', error);
      }).finally(() => {
        this.isLoadedValue = true;
      });
  }

  private setupScrollPreservation() {
    if (!this.scrollableContainer || this.pageStreamHandler) return;

    const { signal } = this.abortController;
    const scrollContainer = this.scrollableContainer;

    this.setupIntersectionObserver({ root: scrollContainer });

    this.pageStreamHandler = (event:TurboBeforeStreamRenderEvent) => {
      event.preventDefault();

      const stream = event.detail.newStream;
      const insertTargetId = this.insertTargetIdValue;

      if (insertTargetId && stream.target.includes(insertTargetId)) {
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

  private setupIntersectionObserver({ root }:{ root:HTMLElement }) {
    const [_observe, unobserve] = useIntersection(this, { root, threshold: 0.25, dispatchEvent: false });
    this.stopObserving = unobserve;
  }

  private tearDownScrollPreservation() {
    this.abortController.abort();
    if (this.pageStreamHandler) this.pageStreamHandler = undefined;
  }

  private fetchPageStream():Promise<{ html:string, headers:Headers }> {
    const url = this.preparePageStreamsUrl();
    return this.turboRequests.requestStream(url);
  }

  private preparePageStreamsUrl():string {
    const baseUrl = window.location.origin;
    const url = new URL(this.urlValue, baseUrl);

    url.searchParams.set('page', this.pageValue.toString());
    url.searchParams.set('filter', this.indexOutlet.filterValue);

    return url.toString();
  }

  private async initializeTurboRequestService() {
    const context = await window.OpenProject.getPluginContext();
    this.turboRequests = context.services.turboRequests;
  }
}
