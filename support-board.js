'use strict';

(() => {
  if (!window.BoardAuth?.isSignedIn()) return;
  const content = window.SITE_CONTENT;
  const updates = document.getElementById('urgent-updates');
  if (!updates) return;
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  };
  function formattedTimestamp(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return 'Not available';
    const options = {timeZone: 'America/Phoenix'};
    const day = new Intl.DateTimeFormat('en-US', {...options, month:'short', day:'numeric', year:'numeric'}).format(date);
    const time = new Intl.DateTimeFormat('en-US', {...options, hour:'2-digit',minute:'2-digit',hourCycle:'h23'})
      .formatToParts(date).filter(part => ['hour','minute'].includes(part.type)).map(part => part.value).join('');
    return `${day} · ${time}`;
  }
  const modified = document.getElementById('site-last-updated');
  modified.textContent = formattedTimestamp(content.lastUpdatedAt);
  if (Number.isFinite(Date.parse(content.lastUpdatedAt))) modified.dateTime = content.lastUpdatedAt;

  // Expiration is evaluated again while the page remains open.
  function renderUpdates() {
    const now = Date.now();
    const active = (content.urgentUpdates || []).filter(update =>
      Date.parse(update.postedAt) <= now && (!update.expiresAt || Date.parse(update.expiresAt) > now)
    ).sort((a,b) => Date.parse(b.postedAt)-Date.parse(a.postedAt));
    updates.replaceChildren();
    if (!active.length) updates.append(make('p', 'empty', 'No last-minute updates posted. Check the POW for the weekly schedule.'));
    for (const update of active) {
      const card = make('article', 'note', '');
      card.append(make('div','note-label','BATTALION UPDATE'),make('h3','',update.title),
        make('p','update-body',update.body),make('p','update-posted','Posted '+formattedTimestamp(update.postedAt)));
      updates.append(card);
    }
  }
  renderUpdates();
  setInterval(renderUpdates, 60000);
  for (const link of content.quickLinks || []) {
    try {
      const url = new URL(link.url, location.href);
      if (url.protocol !== 'https:' && !(url.origin === location.origin && url.protocol === 'http:')) continue;
      const anchor = make('a','quick-link',link.label+' ↗');
      anchor.href = url.href;
      if (url.origin !== location.origin) {anchor.target='_blank';anchor.rel='noopener noreferrer';}
      document.getElementById('quick-links').append(anchor);
    } catch { /* Skip invalid configured links. */ }
  }
  const feedbackLink = document.getElementById('feedback-link');
  try {
    const url = new URL(content.feedbackFormUrl);
    if (url.protocol !== 'https:') throw new Error('HTTPS required');
    feedbackLink.href = url.href;
    feedbackLink.hidden = false;
  } catch {
    document.getElementById('feedback-help').textContent = 'The feedback form is not available yet.';
  }
})();
