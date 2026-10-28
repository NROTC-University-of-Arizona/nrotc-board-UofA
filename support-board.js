'use strict';

(() => {
  if (!window.BoardAuth?.isSignedIn()) return;
  const content = window.SITE_CONTENT;
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

  // Requirements may point to an SOP appendix instead of having a separate form link.
  // The homepage displays them on its dedicated forms board.
  const forms = document.getElementById('rotc-forms');
  if (forms) {
    for (const form of content.rotcForms || []) {
      if (!form.label?.trim()) continue;
      const entry = make('article', 'form-entry', '');
      const heading = make('h3', '', form.label);
      if (form.url) {
        try {
          const url = new URL(form.url, location.href);
          if (url.protocol !== 'https:' && !(url.origin === location.origin && url.protocol === 'http:')) continue;
          const anchor = make('a', 'form-link', form.label + ' ↗');
          anchor.href = url.href;
          if (url.origin !== location.origin) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }
          heading.replaceChildren(anchor);
        } catch { continue; /* Skip invalid configured links. */ }
      }
      entry.append(heading);
      if (form.dueAt && Number.isFinite(Date.parse(form.dueAt))) {
        const deadline = make('p', 'form-deadline', 'Due ');
        const time = make('time', '', formattedTimestamp(form.dueAt));
        time.dateTime = form.dueAt;
        deadline.append(time);
        entry.append(deadline);
      }
      if (form.reference) entry.append(make('p', 'form-reference', form.reference));
      forms.append(entry);
    }
    if (!forms.childElementCount) forms.append(make('p', '', 'No ROTC forms posted yet.'));
  }

  const updates = document.getElementById('urgent-updates');
  if (!updates) return;
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
