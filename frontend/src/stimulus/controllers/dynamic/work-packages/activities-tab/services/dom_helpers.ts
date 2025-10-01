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
*
* Copyright (c) 37signals, LLC
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* See also the original source:
* * https://github.com/basecamp/once-campfire/blob/5c0526eaf7f83d129472a520fa673bfcb9c2f397/MIT-LICENSE
* * https://github.com/basecamp/once-campfire/blob/5c0526eaf7f83d129472a520fa673bfcb9c2f397/app/javascript/helpers/dom_helpers.js#L44-L65
*/

export namespace DomHelpers {
  /**
   * Preserves scroll position during DOM manipulations that change content height.
   *
   * This is crucial for infinite scroll UX - when older content is prepended above
   * the current view, we need to adjust scroll position so the user doesn't suddenly
   * jump to a different part of the content.
   *
   * @param {HTMLElement} container - The scrollable container
   * @param {boolean} top - Whether content is being added at the top (prepend)
   *                         true: adjust scroll for prepended content
   *                         false: maintain position for appended content
   * @param {Function} fn - Async function that performs the DOM manipulation
   *
   * Algorithm:
   * - Capture current scroll position and total height BEFORE DOM changes
   * - Execute the DOM manipulation (adding/removing content)
   * - Calculate height difference and adjust scroll position accordingly
   *
   * For prepend: scrollTop + heightDifference (push view down by added content height)
   * For append: maintain original scrollTop (new content below doesn't affect view)
   */
  export async function keepScroll(container:HTMLElement, top:boolean, fn:() => Promise<void>) {
    pauseInertiaScroll(container);

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;

    await fn();

    if (top) {
      container.scrollTop = scrollTop + (container.scrollHeight - scrollHeight);
    } else {
      container.scrollTop = scrollTop;
    }
  }

  /**
   * Temporarily pauses inertial/momentum scrolling to prevent scroll position drift.
   *
   * CRITICAL for iOS Safari and other mobile browsers with momentum scrolling!
   *
   * The Problem:
   * When programmatically setting scrollTop during an active momentum scroll,
   * the browser continues the inertial scroll AFTER our position adjustment,
   * causing the scroll position to drift away from our intended target.
   *
   * The Solution:
   * - Set overflow: hidden to immediately stop any momentum scrolling
   * - Use requestAnimationFrame to restore overflow on next frame
   * - This gives us a clean slate to set the exact scroll position
   *
   * Without this, scroll preservation would be unreliable on mobile devices,
   * especially during infinite scroll when users are actively scrolling up.
   *
   * @param {Element} container - The scrollable container to pause momentum on
   */
  function pauseInertiaScroll(container:HTMLElement) {
    container.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      container.style.overflow = '';
    });
  }
}
