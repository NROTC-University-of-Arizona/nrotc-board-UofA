'use strict';

// Shared navigation and resource pages use verified links from one editable file.
(() => {
  if (!window.BoardAuth?.isSignedIn()) return;
  const content = window.COMMUNITY_CONTENT;
  if (!content) return;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.protocol === 'https:' ||
        (url.protocol === 'http:' && url.origin === location.origin) ? url.href : null;
    } catch { return null; }
  }

  function resourceLink(item, className = 'resource-button', label = item.label) {
    const url = safeUrl(item.url);
    if (!url) return null;
    const link = element('a', className, label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function appendLink(parent, item, className, label) {
    if (!item) return;
    const link = resourceLink(item, className, label);
    if (link) parent.append(link);
  }

  const banner = element('aside', 'deadline-banner');
  banner.setAttribute('aria-label', 'Battalion reminder');
  banner.hidden = true;
  document.body.prepend(banner);
  const reminder = content.banner;
  let expiryTimer;
  function updateBanner() {
    clearTimeout(expiryTimer);
    banner.replaceChildren();
    const expiry = reminder?.expiresAt ? Date.parse(reminder.expiresAt) : Infinity;
    const remaining = expiry - Date.now();
    banner.hidden = !reminder?.message?.trim() || Number.isNaN(expiry) || remaining <= 0;
    if (banner.hidden) return;
    banner.append(element('span', 'deadline-tag', 'ACTION REQUIRED'));
    const text = element('div', 'deadline-copy');
    text.append(element('strong', '', reminder.message));
    if (reminder.deadlineLabel) text.append(element('span', '', reminder.deadlineLabel));
    banner.append(text);
    appendLink(banner, { url: reminder.url, label: 'View details ↗' }, 'deadline-link');
    // An explicit offset keeps expiration on Tucson time, regardless of visitor timezone.
    if (Number.isFinite(remaining)) expiryTimer = setTimeout(updateBanner, Math.min(remaining, 2147483647));
  }
  updateBanner();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateBanner();
  });
  window.addEventListener('pageshow', updateBanner);

  const nav = document.querySelector('[data-site-navigation]');
  if (nav) {
    nav.replaceChildren();
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const disclosures = [];
    function localLink(parent, label, path, isCurrent = false) {
      const link = element('a', 'nav-link', label);
      link.href = path;
      if (isCurrent) link.setAttribute('aria-current', 'page');
      parent.append(link);
      return link;
    }
    function closeDropdowns(except = null) {
      for (const disclosure of disclosures) {
        if (disclosure === except) continue;
        disclosure.panel.hidden = true;
        disclosure.button.setAttribute('aria-expanded', 'false');
      }
    }
    function dropdown(label, id, className = '') {
      const wrapper = element('div', 'nav-disclosure');
      const button = element('button', 'nav-toggle', label);
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', id);
      const chevron = element('span', 'nav-chevron', '⌄');
      chevron.setAttribute('aria-hidden', 'true');
      button.append(chevron);
      const panel = element('div', `nav-panel ${className}`);
      panel.id = id;
      panel.hidden = true;
      const disclosure = { wrapper, button, panel };
      disclosures.push(disclosure);
      button.addEventListener('click', () => {
        const opening = panel.hidden;
        closeDropdowns();
        panel.hidden = !opening;
        button.setAttribute('aria-expanded', String(opening));
      });
      wrapper.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden) {
          event.preventDefault();
          closeDropdowns();
          button.focus();
        }
      });
      wrapper.addEventListener('focusout', event => {
        if (!wrapper.contains(event.relatedTarget)) {
          panel.hidden = true;
          button.setAttribute('aria-expanded', 'false');
        }
      });
      panel.addEventListener('click', event => {
        if (event.target.closest('a')) closeDropdowns();
      });
      wrapper.append(button, panel);
      nav.append(wrapper);
      return panel;
    }

    const bulletin = dropdown('Quick Links', 'quick-links-menu', 'bulletin-menu');
    appendLink(bulletin, { label: 'Open Full Weekly Bulletin ↗', url: content.bulletinUrl }, 'bulletin-full-link');
    const groups = element('div', 'bulletin-link-groups');
    for (const group of content.linkGroups || []) {
      // SEP and NDT keep their resources on their dedicated pages.
      if (group.id === 'sep' || group.id === 'ndt') continue;
      const section = element('section', 'bulletin-link-group');
      section.append(element('h2', '', group.title));
      const list = element('ul');
      for (const item of group.links) {
        const link = resourceLink(item, 'bulletin-resource-link');
        if (!link) continue;
        const row = element('li');
        row.append(link);
        list.append(row);
      }
      section.append(list);
      groups.append(section);
    }
    bulletin.append(groups);
    localLink(nav, 'Club Spaces', 'clubs.html', currentPage === 'clubs.html');
    const platoons = dropdown('Platoons', 'platoon-menu', 'platoon-menu');
    localLink(platoons, 'NDT', 'ndt.html', currentPage === 'ndt.html');
    localLink(platoons, 'Marine Platoon', 'marines.html', currentPage === 'marines.html');
    localLink(nav, 'SEP', 'sep.html', currentPage === 'sep.html');
    localLink(nav, 'SOP', 'sop.html', currentPage === 'sop.html');
    const logout = element('button', 'logout-button', 'Log out');
    logout.type = 'button';
    logout.dataset.logout = '';
    nav.append(logout);
    // auth.js attaches logout after deferred scripts finish, at DOMContentLoaded.
    document.addEventListener('click', event => {
      for (const disclosure of disclosures) {
        if (!disclosure.wrapper.contains(event.target)) {
          disclosure.panel.hidden = true;
          disclosure.button.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  const getGroup = id => content.linkGroups.find(group => group.id === id)?.links || [];
  const ndtResources = document.getElementById('ndt-resources');
  if (ndtResources) {
    for (const item of getGroup('ndt')) {
      const panel = element('section', 'resource-card ndt-document');
      panel.id = `ndt-${item.id}`;
      const heading = element('h2', '', item.label);
      heading.id = `${panel.id}-heading`;
      panel.setAttribute('aria-labelledby', heading.id);
      const header = element('div', 'resource-heading');
      header.append(heading);
      appendLink(header, item, 'resource-button', 'Open Document ↗');
      panel.append(header);

      const previewUrl = safeUrl(item.previewUrl);
      if (previewUrl) {
        const frame = element('iframe', `ndt-viewer ${item.previewType === 'sheet' ? 'sheet-viewer' : 'document-viewer'}`);
        frame.title = item.label;
        frame.loading = 'lazy';
        if (item.previewType === 'sheet') {
          // Match SEP's script-free table view; worksheet selection stays in the configured URL.
          frame.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
        }
        frame.src = previewUrl;
        panel.append(frame);
      }
      const guidance = element('p', 'viewer-guidance',
        'If the preview is blank or asks for access, use Open Document and sign in with your authorized Google account.');
      guidance.id = `${panel.id}-help`;
      panel.querySelector('iframe')?.setAttribute('aria-describedby', guidance.id);
      panel.append(guidance);
      ndtResources.append(panel);
    }
  }

  const sepPage = document.getElementById('sep-resources');
  if (sepPage) {
    const links = getGroup('sep');
    for (const placeholder of sepPage.querySelectorAll('[data-sep-link]')) {
      const item = links.find(link => link.id === placeholder.dataset.sepLink);
      appendLink(placeholder, item, 'resource-button', placeholder.dataset.label || item?.label);
    }
    const exampleUrl = safeUrl(content.sepExample.imageUrl);
    const exampleLink = document.getElementById('sep-example-link');
    if (exampleUrl) {
      exampleLink.href = exampleUrl;
      const image = document.getElementById('sep-example-image');
      image.src = exampleUrl;
      image.alt = content.sepExample.imageAlt;
    }
    const matrix = links.find(link => link.id === 'matrix');
    const matrixPreviewUrl = safeUrl(matrix?.previewUrl);
    if (matrixPreviewUrl) {
      const frame = element('iframe', 'sheet-viewer');
      frame.title = 'SEP Infraction Matrix Fall 2026';
      frame.loading = 'lazy';
      // Google serves this worksheet as a live, read-only HTML table.
      // Unlike the standard preview, it requires no viewer scripts.
      frame.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
      frame.src = matrixPreviewUrl;
      document.getElementById('sep-matrix-viewer').append(frame);
    }
    const contact = content.sepContact;
    document.getElementById('sep-contact-name').textContent = contact.name;
    const email = document.getElementById('sep-contact-email');
    email.textContent = contact.email;
    email.href = `mailto:${contact.email}`;
    const phone = document.getElementById('sep-contact-phone');
    phone.textContent = contact.phone;
    phone.href = `tel:${contact.phone.replace(/[^+\d]/g, '')}`;
  }
})();
