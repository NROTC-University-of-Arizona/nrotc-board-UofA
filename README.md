# Arizona NROTC Battalion Board

The University of Arizona NROTC document and resource board, built with HTML, CSS, and JavaScript.

## Current status

- Dark wooden board with University of Arizona, Navy, and Marine Corps imagery.
- A browser-only login gate on each resource page; no backend is required. See the login limits below.
- The homepage uses the POW PDF in place of separate event and duty boards.
- The homepage starts with a POW viewer and archive selector, followed by ROTC Forms & Requirements and Battalion Updates.
- Shared navigation provides bulletin resources, Club Spaces, NDT, Marine Platoon, SEP, and the SOP.
- Document viewers use the native PDF toolbar on laptops and vertically scrolling pages on mobile.
- OpenClaw/WhatsApp publishing is planned but is not connected.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | POW viewer, forms and requirements, and Battalion Updates |
| `styles.css` | Colors, typography, board styling, and responsive layouts |
| `app.js` | Historical notice renderer; no longer loaded by the homepage |
| `config.js` | Public display settings |
| `site-content.js` | POW archive, club posts, forms, updates, and feedback link |
| `resources.js` | PDF archive and club board rendering |
| `clubs.html` | Club Spaces page |
| `ndt.html`, `marines.html`, `sep.html`, `sop.html` | Platoon and resource pages |
| `community-content.js`, `community.js` | Shared navigation, deadline banner, and resource configuration/rendering |
| `support-board.js` | Forms and requirements, urgent updates, and feedback rendering |
| `pdf-preview.js` | Mobile PDF rendering |
| `login.html`, `login.js`, `auth.js`, `auth-config.js` | Browser-only login gate |
| `documents/` | Published POW archive and unit SOP |
| `tests/community-pages.cjs` | Desktop/mobile browser regression checks |
| `week-5.js` | Existing POW 5 event and duty draft |
| `assets/` | Logo images and source information |

## Publish with GitHub Pages

Keep these files at the repository root, with `assets` beside `index.html`.
In repository **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, and save.
Once deployment succeeds, the site URL is:
https://nrotc-university-of-arizona.github.io/nrotc-board-UofA/

## Add weekly PDFs

1. Create a `documents` folder beside `index.html` and put the approved PDFs inside it.
2. In `site-content.js`, add a record to `weeks`, for example:

```js
weeks: [
  {
    id: '2026-10-19',
    label: 'October 19–25, 2026',
    powUrl: 'documents/pow-2026-10-19.pdf',
    bulletinUrl: 'documents/bulletin-2026-10-19.pdf'
  }
],
```

Use a different date-based ID for each week. Keep previous entries and PDFs to retain the archive. Set `featuredWeekId` to the week that should open first, or leave it empty for the newest entry. Leave a missing PDF URL empty. An HTTPS PDF link also works; some external hosts block embedded previews, so the Open link is always available.

The viewer displays the PDF itself; it does not extract events into the event board. Send new PDFs here for review and preparation before publishing. Only add documents approved for publication.

## Add club spaces

In `site-content.js`, add clubs to the `clubs` array:

```js
clubs: [
  {
    id: 'example-club',
    name: 'Your club name',
    description: 'A short introduction.',
    posts: [
      {
        title: 'Club meeting',
        date: '2026-10-23',
        time: '1600',
        location: 'Meeting location',
        body: 'Full notice shown when someone selects Read notice.',
        imageUrl: 'assets/clubs/meeting.jpg',
        imageAlt: 'Members at a club meeting'
      }
    ]
  }
]
```

Create `assets/clubs` and add the photo there. Date, time, location, body, and image are optional; a photo post can just have a title, image URL, and image description. Use unique club IDs containing letters, numbers, and hyphens. Use four-digit times, such as `0550` or `1600`, without a timezone label. Each club gets a direct link such as `clubs.html#club-example-club`.

There is no visitor upload form. Send files here to prepare a local update, or upload them using GitHub's **Add file → Upload files** and edit `site-content.js`. Uploading an image alone does not add a post; the post must reference its exact path and filename. GitHub Pages serves saved files and cannot store visitor uploads by itself.

## Previous notice data

`week-5.js` and `app.js` are retained as historical project files but are no longer loaded by the homepage. The POW PDF replaces those event and duty boards.

## Files to include when publishing this update

Upload the changed HTML, JavaScript, and stylesheet files at the repository root, preserving their existing folder structure. Include any new referenced PDFs and images. Keep the existing authentication files, bundled PDF.js assets, older documents, and club photos. Commit only after reviewing the content: a commit to the configured publishing branch updates the public site. Git commits retain earlier versions; keeping older week entries also makes those weeks accessible to readers.

## Preview locally

From this directory, run:

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

Open http://127.0.0.1:5173 in your browser. No package installation or build step is required.

## Public content and future automation

Everything shipped with this site can be downloaded by visitors. Only publish information intended for the public. Never add credentials, member lists, or bot tokens to these files.

A future OpenClaw integration can update notice content through authorized GitHub commits. Its credentials must stay on the machine running the bot, outside the published website. This workflow is not implemented yet.

## License and artwork

No project-wide software license has been selected yet. Public repository visibility is not a software license. University and military logos are third-party marks; this project does not grant rights to those marks. See `assets/SOURCES.md` for the currently recorded asset information.

## Local login gate

All six resource pages use a browser-only login gate. `login.html`, `login.js`, `auth.js`, and `auth-config.js` must accompany the pages when publishing. The allowlist contains hashes for the 82 unique addresses in the FALL 2026 Contact Info worksheet only. The source workbook and plaintext credentials are not part of the website.

Emails are trimmed and compared in lowercase. The shared password is case-sensitive. Successful login uses sessionStorage for the tab; Log out clears it. Browser session restore or tab duplication may retain/copy sessionStorage according to browser behavior. This is not a verified identity system: hashes, JavaScript, PDFs, and photos remain publicly accessible, and visitors can bypass the gate.

To replace access credentials, regenerate auth-config.js hashes using SHA-256 of `nrotc-email:` followed by each normalized email and `nrotc-password:` followed by the exact shared password. Increment the config version when changing access so existing sessions must sign in again. Never put the roster or plaintext password in the repository. Preview using localhost or HTTPS, which provide the Web Crypto API.

## Battalion support board

The homepage has a dedicated ROTC Forms & Requirements wooden board above Battalion Updates. The Battalion Updates board contains last-minute updates, feedback, and a last-updated time. Configure them in `site-content.js` and include `support-board.js` when publishing. Keep `lastUpdatedAt` equal to the actual content update time (ISO timestamp with offset); update it whenever publishing content changes. The displayed time uses Tucson time in four-digit military format without a timezone suffix.

Add notices to `urgentUpdates` with `title`, `body`, `postedAt`, and optional `expiresAt`. Use ISO timestamps with offsets. Future and expired notices are hidden; active notices appear newest first. Leaving the array empty shows an honest no-updates message. `rotcForms` contains `{ label, url, dueAt, reference }` entries for forms and requirements. The URL, deadline, and reference are optional. Use an ISO timestamp with a Tucson offset (`-07:00`) for deadlines; the site displays military time. A requirement without a URL appears as text, such as MIDN Evaluations with its Appendix 3-A reference. Add only ROTC form links supplied by the site owner; do not populate this list automatically from the bulletin or general resources. An empty array displays “No ROTC forms posted yet.” This homepage section is separate from the Quick Links navigation dropdown.

Set `feedbackFormUrl` to the Google Form's HTTPS respondent link. The feedback button opens the form in a new tab; visitors submit reports through Google Forms. The website does not collect or store their answers. Form access and response settings are managed by the form owner in Google Forms.

## Scrolling POW preview

`pdf-preview.js` uses locally bundled PDF.js 6.4.299 to render the POW as vertically stacked pages. Pages render near the viewport and resize to fit the available width. Selecting another week cancels pending rendering and destroys the previous PDF worker. The original PDF button remains available for text selection, accessibility, zoom, and downloads.

When publishing this feature, include `pdf-preview.js` and the complete `assets/vendor/pdfjs/` directory alongside the updated frontend files. No CDN or build step is required. The vendor directory includes the matching library/worker, font and decoding resources, version record, and license. Keep these resources on the same version when upgrading PDF.js.

Preview via an HTTP server rather than opening HTML directly from disk. Check all pages of each POW at mobile and desktop widths, week switching, rotation, and the original PDF link. Confirm touch scrolling on a physical phone before publishing.

The preview keeps essential canvas sizing in its renderer and uses a separate `pow-page-preview` class so cached iframe styles cannot enlarge the pages. HTML references versioned stylesheet/renderer URLs; bump their version together when changing this feature. Regression checks should include forcing the previous stylesheet at desktop high pixel density, as well as normal mobile and desktop loads.

The responsive POW preview uses the browser’s native PDF toolbar on larger screens with a fine pointer. Screens at or below 760px, touch-first devices, and browsers reporting no native PDF support use scrolling PDF.js pages. Changing the layout or selected week disposes of the previous preview. Toolbar controls vary by desktop browser.

## Platoons, SEP, and shared navigation

The signed-in pages share `community.js` and `community-content.js`. The latter holds the deadline banner, verified bulletin resource groups, SEP image path, and SEP contact. These live separately from `site-content.js` so weekly POW updates preserve them. NDT has stacked viewers for its schedule, COVE watchbill, and squad organization, followed by an empty notice board. Marine Platoon has its own empty notice board; SEP has its example, Google Form links, and a Google Sheets preview. The shared navigation is Quick Links, Club Spaces, Platoons, SEP, SOP, and Log out. Quick Links displays the full bulletin and the forms, awards, and reference groups; SEP and NDT groups remain in the configuration for their dedicated pages.

To change the banner, edit `banner.message`, `deadlineLabel`, optional `url`, and `expiresAt`. Use an ISO timestamp with an explicit Tucson offset (`-07:00`). An empty message hides it; an empty expiration keeps it visible until removed. A past or invalid expiration hides it. The current payment reminder expires at the start of October 31, 2026 in Tucson, including on pages left open. This banner is configured manually; weekly document updates do not choose reminders automatically.

Bulletin links were read from the source bulletin on October 28, 2026. Google remains responsible for access and submissions. The site only links to the forms, and it does not change their permissions. If the matrix preview is unavailable or asks for access, the Open Infraction Matrix link remains available. The example image contains historical sample entries and is labeled accordingly.

All six signed-in pages use the existing browser gate, with matching allowed return destinations in `auth.js`. This remains the same convenience gate documented above; this update does not implement the separate secure-login migration. When publishing these resources, include the four resource HTML pages, both community scripts, `assets/sep/`, the SOP PDF, and updates to the existing pages, login page, auth script, stylesheet, and source notes. Keep the shared asset version suffix in sync across pages when changing navigation or styling.

Local verification: with the frontend served on port 5173, run `node tests/community-pages.cjs` from the repository root using Node with Playwright available. Set `BOARD_TEST_URL` to test a different HTTP server URL. It covers desktop/mobile navigation, login redirects and logout, actual content in all three NDT viewers, spreadsheet scrolling, SEP destinations, archive viewers, existing clubs, and banner expiration in a different visitor timezone. The test does not submit any external forms.

NDT preview URLs are configured alongside each original document link using `previewUrl` and `previewType`. The schedule uses Google Docs preview; the COVE table selects worksheet `gid=0`, and the squad table uses the default worksheet. Each viewer has an Open Document link and access guidance; Google sharing permissions remain unchanged. Wide tables scroll inside their frames on small screens.

The matrix uses Google’s HTML table view (`gviz/tq?tqx=out:html` for the verified worksheet gid 1624471322). The regular preview returned an empty body during verification because its scripts failed. The table view retains the cell values in a simple read-only table; scripts are disabled in its iframe because the table is server-rendered. The original Google Sheet link is always available for the full viewer.

The SOP page (`sop.html`) uses the same laptop/native and mobile/PDF.js viewers as the POW. Its PDF path lives in `community-content.js` under `sop.pdfUrl`, separate from weekly updates. The local source is `NROTCUAINST 1533.1 SOP.pdf`, copied unchanged to `documents/nrotcua-sop-1533-1.pdf` (58 pages). Appendix 3-A starts on PDF page 42. The evaluation deadline and reference are displayed only on the homepage forms board, configured by `rotcForms` in `site-content.js`. The SOP page contains the document viewer and its appendix guidance, without a duplicate forms board. No separate evaluation submission link is configured.
