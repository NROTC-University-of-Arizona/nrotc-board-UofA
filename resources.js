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

  function renderDocument(container, path, title, embed) {
    container.replaceChildren();
    const url = contentUrl(path);
    if (!url) {
      container.append(node('p', 'empty', `${title} has not been added for this week.`));
      return;
    }
    container.append(documentLink(url, `Open ${title} ↗`));
    if (embed) {
      const frame = node('iframe', 'pdf-viewer');
      frame.src = url;
      frame.title = title;
      container.append(frame);
      container.append(node('p', 'document-help', 'If the preview does not display on your device, use the Open PDF link above.'));
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
        renderDocument(document.getElementById('bulletin-document'), week.bulletinUrl, 'weekly bulletin', false);
      };
      weekSelect.addEventListener('change', displayWeek);
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
