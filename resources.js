'use strict';

// One renderer serves the document hub and club page without requiring a backend.
(() => {
  if (!window.BoardAuth?.isSignedIn()) return;
  const content = window.SITE_CONTENT;
  function node(tag, className, text) {
    const result = document.createElement(tag);
    result.className = className;
    if (text !== undefined) result.textContent = text;
    return result;
  }

  // Allow local assets and HTTPS links, never executable URL schemes.
  function contentUrl(value) {
    if (!value || typeof value !== 'string') return null;
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === 'https:' ||
        (url.origin === window.location.origin && url.protocol === 'http:') ? url.href : null;
    } catch { return null; }
  }

  function documentLink(url, label) {
    const link = node('a', 'resource-button', label);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  let disposePdfPreview = () => {};
  // Touch-first devices avoid native PDF embeds, which may show only page one.
  const scrollingPdfLayout = window.matchMedia('(max-width: 760px), (hover: none) and (pointer: coarse)');

  function renderDocument(container, path, title, embed) {
    if (embed) disposePdfPreview();
    container.replaceChildren();
    const url = contentUrl(path);
    if (!url) {
      container.append(node('p', 'empty', `${title} has not been added for this week.`));
      return;
    }
    container.append(documentLink(url, `Open ${title} ↗`));
    if (embed && !scrollingPdfLayout.matches && navigator.pdfViewerEnabled !== false) {
      const frame = node('iframe', 'pow-native-viewer');
      frame.src = url;
      frame.title = title;
      // Keep the native viewer bounded even if an older stylesheet is cached.
      Object.assign(frame.style, { display: 'block', width: '100%', height: '75vh', minHeight: '380px', border: '0', marginTop: '16px' });
      container.append(frame);
      container.append(node('p', 'document-help', 'Use the PDF toolbar to change pages, zoom, print, or download. You can also open the PDF above.'));
    } else if (embed) {
      const preview = node('div', 'pow-page-preview');
      container.append(preview);
      let disposed = false;
      let destroyViewer = () => {};
      disposePdfPreview = () => { disposed = true; destroyViewer(); };
      preview.textContent = 'Loading PDF…';
      import('./pdf-preview.js?v=2').then(({ mountPdfPreview }) => {
        if (!disposed) destroyViewer = mountPdfPreview(preview, url);
      }).catch(() => {
        if (!disposed) preview.textContent = 'Preview unavailable. Use Open POW PDF above to read the document.';
      });
      container.append(node('p', 'document-help', 'Scroll down to read every page. For zoom, text selection, or download, use Open POW PDF above.'));
    }
  }

  const weekSelect = document.getElementById('document-week');
  if (weekSelect) {
    const weeks = [...content.weeks].sort((a, b) => b.id.localeCompare(a.id));
    weekSelect.disabled = weeks.length === 0;
    if (weeks.length) {
      weekSelect.replaceChildren();
      for (const week of weeks) {
        const option = node('option', '', week.label);
        option.value = week.id;
        weekSelect.append(option);
      }
      weekSelect.value = weeks.some(week => week.id === content.featuredWeekId)
        ? content.featuredWeekId : weeks[0].id;
      const displayWeek = () => {
        const week = weeks.find(entry => entry.id === weekSelect.value);
        renderDocument(document.getElementById('pow-document'), week.powUrl, 'POW PDF', true);
        renderDocument(document.getElementById('bulletin-document'), week.bulletinUrl, 'Weekly Bulletin', false);
      };
      weekSelect.addEventListener('change', displayWeek);
      scrollingPdfLayout.addEventListener('change', displayWeek);
      displayWeek();
    }
  }

  const clubBoards = document.getElementById('club-boards');
  if (!clubBoards || !content.clubs.length) return;
  clubBoards.replaceChildren();
  const directory = document.getElementById('club-directory');
  for (const [index, club] of content.clubs.entries()) {
    const section = node('section', 'wood-frame club-board');
    section.id = `club-${club.id || index}`;
    const headingId = `club-title-${index}`;
    section.setAttribute('aria-labelledby', headingId);
    const link = node('a', 'resource-button', club.name);
    link.href = `#${section.id}`;
    directory.append(link);
    const inner = node('div', 'club-inner');
    const heading = node('h2', '', club.name);
    heading.id = headingId;
    inner.append(heading, node('p', 'club-description', club.description));
    const posts = node('div', 'club-posts');
    for (const post of club.posts || []) {
      const card = node('article', 'note');
      card.append(node('h3', '', post.title));
      if (post.date) {
        const date = new Date(`${post.date}T12:00:00-07:00`);
        const label = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Phoenix', month: 'short', day: 'numeric', year: 'numeric'
        }).format(date);
        card.append(node('p', 'club-event-date', label + (post.time ? ` · ${post.time}` : '')));
      }
      if (post.location) card.append(node('p', '', post.location));
      const imageUrl = contentUrl(post.imageUrl);
      if (imageUrl) {
        const image = node('img', 'club-photo');
        image.src = imageUrl;
        image.alt = post.imageAlt || post.title;
        image.loading = 'lazy';
        card.append(image);
      }
      if (post.body) {
        const details = node('details', 'club-details');
        details.append(node('summary', '', 'Read notice'), node('p', '', post.body));
        card.append(details);
      }
      posts.append(card);
    }
    if (!posts.children.length) posts.append(node('p', 'empty', 'No notices or pictures posted yet.'));
    inner.append(posts);
    section.append(inner);
    clubBoards.append(section);
  }
})();
