'use strict';
// All notices on this board are public. Replace these examples with approved public content.
const sampleNotices = [
  {id:'sample-1',category:'EVENT',title:'Battalion field meet',body:'A morning of friendly competition. Bring water, a team mindset, and your battalion PT gear.',location:'Campus recreation fields',startsAt:'2026-10-02T06:00:00-07:00',label:'BATTALION EVENT'},
  {id:'sample-2',category:'EVENT',title:'Leadership lab',body:'Come prepared for small-unit leadership exercises and this week’s professional development discussion.',location:'Naval Science building',startsAt:'2026-10-08T16:00:00-07:00',label:'PROFESSIONAL DEVELOPMENT'},
  {id:'sample-3',category:'VOLUNTEER',title:'Give back to Tucson',body:'Join the team for a morning sorting and packing food for our Tucson neighbors.',location:'Community food bank',startsAt:'2026-10-03T08:00:00-07:00',label:'COMMUNITY SERVICE'},
  {id:'sample-4',category:'VOLUNTEER',title:'Campus cleanup',body:'Help keep our campus mission-ready. Gloves and supplies will be provided.',location:'Meet at Old Main',startsAt:'2026-10-10T07:30:00-07:00',label:'CAMPUS SERVICE'},
  {id:'sample-5',category:'ANNOUNCEMENT',title:'A new home for the battalion.',body:'Events, opportunities to serve, and the latest word—all in one place. Check the board regularly.',label:'FROM THE WARDROOM'},
  {id:'sample-6',category:'ANNOUNCEMENT',title:'Uniform of the week',body:'Check the latest guidance from your chain of command before the next formation.',label:'BATTALION NOTICE'},
  {id:'sample-7',category:'ANNOUNCEMENT',title:'Have something to post?',body:'Send event details to the designated battalion board administrator.',label:'SPREAD THE WORD'}
];
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
  if(notice.startsAt) detail.append(element('p','',dateFormat({dateStyle:'full',timeStyle:'short'}).format(new Date(notice.startsAt))+' MST'));
  if(notice.location) detail.append(element('p','',notice.location));
  detail.append(element('p','notice-body',notice.body));
  if(config.demoMode) detail.append(element('p','','Sample notice for the design preview. This is not a scheduled battalion activity.'));
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
      card.append(element('div','note-label',notice.label || (category==='ANNOUNCEMENT'?'BATTALION NOTICE':category==='VOLUNTEER'?'COMMUNITY SERVICE':'BATTALION EVENT')),element('h3','',notice.title),element('p','',notice.body.length>140?notice.body.slice(0,137)+'…':notice.body));
      const action=element('button','note-button','Read notice ↗');action.addEventListener('click',()=>showNotice(notice));
      if(notice.startsAt) {
        const date=new Date(notice.startsAt), meta=element('div','note-meta'), day=element('div','date-block');
        day.append(element('small','',dateFormat({month:'short'}).format(date).toUpperCase()),document.createTextNode(dateFormat({day:'2-digit'}).format(date)));
        const details=element('div','meta-details');details.append(document.createTextNode(dateFormat({hour:'numeric',minute:'2-digit'}).format(date)+' MST'),document.createElement('br'),document.createTextNode(notice.location));
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
byId('board-status').textContent = config.demoMode ? 'PUBLIC BOARD · SAMPLE NOTICES' : 'PUBLIC BATTALION BOARD';
renderNotices(sampleNotices);
