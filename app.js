'use strict';
// Content is reviewed separately from rendering; all external text uses textContent.
const currentWeek = window.BOARD_WEEK;
const boardNotices = [...currentWeek.events, ...currentWeek.volunteering];
const config = window.BOARD_CONFIG;
const byId = id => document.getElementById(id);
const dateFormat = options => new Intl.DateTimeFormat('en-US',{timeZone:'America/Phoenix',...options});
byId('today').textContent = dateFormat({month:'short',day:'numeric',year:'numeric'}).format(new Date()).toUpperCase();
function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text; // Untrusted post content is always rendered as text.
  return node;
}
function showNotice(notice) {
  const detail = byId('notice-details'); detail.replaceChildren();
  detail.append(element('div','eyebrow',notice.category.replaceAll('_',' ')),element('h2','',notice.title));
  if(notice.startsAt) detail.append(element('p','',dateFormat({dateStyle:'full'}).format(new Date(notice.startsAt)) + ' · ' + formatMilitaryTime(notice.startsAt)));
  if(notice.location) detail.append(element('p','',notice.location));
  detail.append(element('p','notice-body',notice.body));
  if (notice.date && !notice.startsAt) detail.append(element('p', '', formatCalendarDate(notice.date)));
  if (notice.uniform) detail.append(element('p', '', 'Uniform: ' + notice.uniform));
  if (notice.participants) detail.append(element('p', '', 'Participants: ' + notice.participants));
  byId('notice-dialog').showModal();
}
function renderNotices(notices) {
  for(const [category,containerId,countId] of [['EVENT','events','event-count'],['VOLUNTEER','volunteering','volunteer-count'],['ANNOUNCEMENT','announcements','announcement-count']]) {
    const container = byId(containerId); container.replaceChildren();
    const entries = notices.filter(notice => notice.category === category);
    byId(countId).textContent = String(entries.length).padStart(2,'0');
    if(!entries.length) container.append(element('p','empty','No notices posted yet.'));
    for(const notice of entries) {
      const card=element('article','note');
      if (category === 'VOLUNTEER') {
        card.append(element('h3', '', notice.title), element('p', '', formatCalendarDate(notice.date)));
        container.append(card);
        continue;
      }
      card.append(element('div','note-label',notice.label || (category==='ANNOUNCEMENT'?'BATTALION NOTICE':category==='VOLUNTEER'?'COMMUNITY SERVICE':'BATTALION EVENT')),element('h3','',notice.title));
      const action=element('button','note-button','Read notice ↗');action.addEventListener('click',()=>showNotice(notice));
      if(notice.startsAt) {
        const date=new Date(notice.startsAt), meta=element('div','note-meta'), day=element('div','date-block');
        day.append(element('small','',dateFormat({month:'short'}).format(date).toUpperCase()),document.createTextNode(dateFormat({day:'2-digit'}).format(date)));
        const details=element('div','meta-details');details.append(document.createTextNode(formatMilitaryTime(notice.startsAt)),document.createElement('br'),document.createTextNode(notice.location));
        meta.append(day,details,action);card.append(meta);
      } else card.append(action);
      container.append(card);
    }
  }
}
// Reload the static page to retrieve notices after a new GitHub Pages deployment.
for (const button of document.querySelectorAll('.close-dialog')) {
  button.addEventListener('click', () => button.closest('dialog').close());
}
byId('refresh-button').addEventListener('click', () => window.location.reload());
byId('board-status').textContent = 'POW 5 · SEP 20–26, 2026 · LOCAL REVIEW';
renderNotices(boardNotices);
renderDutyBoard();

// Explicit Tucson noon prevents a date-only notice shifting days across browser time zones.
function formatCalendarDate(value) {
  return dateFormat({ weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(value + 'T12:00:00-07:00'));
}

function dutyDateAndTime(entry) {
  return formatCalendarDate(entry.date) + '\n' + formatMilitaryTime(entry.startsAt);
}

function createRosterTable(tableId, headings, rows) {
  const table = byId(tableId);
  const head = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const label of headings) {
    const cell = element('th', '', label);
    cell.scope = 'col';
    headerRow.append(cell);
  }
  head.append(headerRow);
  const body = document.createElement('tbody');
  for (const values of rows) {
    const row = document.createElement('tr');
    values.forEach((value, index) => {
      const cell = element(index === 0 ? 'th' : 'td', '', value);
      if (index === 0) cell.scope = 'row';
      row.append(cell);
    });
    body.append(row);
  }
  table.append(head, body);
}

function renderDutyBoard() {
  createRosterTable('field-day-table', ['Date / time', 'Location', 'Senior member', 'Member', 'Standby'],
    currentWeek.fieldDay.map(entry => [dutyDateAndTime(entry), entry.location,
      entry.seniorMember, entry.member, entry.standby]));
  createRosterTable('colors-table', ['Date / time', 'Colors SGT', 'Colors bearer 1', 'Colors bearer 2', 'Observer', 'Standby'],
    currentWeek.colorsWatchbill.map(entry => [dutyDateAndTime(entry), entry.colorsSergeant,
      entry.colorsBearer1, entry.colorsBearer2, entry.observer, entry.standbys.join('\n')]));
}

// h23 keeps midnight at 0000, with every timestamp displayed in Tucson local time.
function formatMilitaryTime(timestamp) {
  const parts = dateFormat({hour: '2-digit', minute: '2-digit', hourCycle: 'h23'})
    .formatToParts(new Date(timestamp));
  return parts.filter(part => part.type === 'hour' || part.type === 'minute')
    .map(part => part.value).join('');
}
