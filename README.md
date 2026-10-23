# Arizona NROTC Battalion Board

A public bulletin board for upcoming events, volunteer opportunities, and announcements, built with HTML, CSS, and JavaScript.

## Current status

- Dark wooden board with University of Arizona, Navy, and Marine Corps imagery.
- Public reading access; no login or backend is required.
- The homepage uses the POW PDF in place of separate event and duty boards.
- The homepage starts with a POW PDF viewer, weekly bulletin link, and club-space link. POW 9 and its Google Docs weekly bulletin link are loaded for local review. Club names are pending.
- The document week selector changes the POW and weekly bulletin links.
- OpenClaw/WhatsApp publishing is planned but is not connected.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and the three board sections |
| `styles.css` | Colors, typography, board styling, and responsive layouts |
| `app.js` | Notice content, rendering, and notice detail dialogs |
| `config.js` | Public display settings |
| `site-content.js` | Weekly PDF links and club posts |
| `resources.js` | PDF archive and club board rendering |
| `clubs.html` | Club spaces page |
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

The viewer displays the PDF itself; it does not extract events into the event board. Send new PDFs here for review and preparation before publishing. The original POW has not been copied into the public assets automatically.

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

Upload `index.html`, `styles.css`, `clubs.html`, `site-content.js`, and `resources.js` alongside the existing files. Preserve `app.js`, `config.js`, `week-5.js`, and `assets/`. Include any referenced PDFs and club images. Commit only after reviewing the content: a commit to the configured publishing branch updates the public site. Git commits retain earlier versions; keeping older week entries also makes those weeks accessible to readers.

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

The homepage and Club Spaces now use a browser-only login gate. `login.html`, `login.js`, `auth.js`, and `auth-config.js` must accompany the pages when this change is eventually published. The allowlist contains hashes for the 82 unique addresses in the FALL 2026 Contact Info worksheet only. The source workbook and plaintext credentials are not part of the website.

Emails are trimmed and compared in lowercase. The shared password is case-sensitive. Successful login uses sessionStorage for the tab; Log out clears it. Browser session restore or tab duplication may retain/copy sessionStorage according to browser behavior. This is not a verified identity system: hashes, JavaScript, PDFs, and photos remain publicly accessible, and visitors can bypass the gate.

To replace access credentials, regenerate auth-config.js hashes using SHA-256 of `nrotc-email:` followed by each normalized email and `nrotc-password:` followed by the exact shared password. Increment the config version when changing access so existing sessions must sign in again. Never put the roster or plaintext password in the repository. Preview using localhost or HTTPS, which provide the Web Crypto API.

## Battalion support board

The homepage includes last-minute updates, quick links, feedback, and a last-updated time. Configure them in `site-content.js` and include `support-board.js` when publishing. Keep `lastUpdatedAt` equal to the actual content update time (ISO timestamp with offset); update it whenever publishing content changes. The displayed time uses Tucson time in four-digit military format without a timezone suffix.

Add notices to `urgentUpdates` with `title`, `body`, `postedAt`, and optional `expiresAt`. Use ISO timestamps with offsets. Future and expired notices are hidden; active notices appear newest first. Leaving the array empty shows an honest no-updates message. `quickLinks` contains labels and local or HTTPS URLs.

Set `feedbackFormUrl` to the Google Form's HTTPS respondent link. The feedback button opens the form in a new tab; visitors submit reports through Google Forms. The website does not collect or store their answers. Form access and response settings are managed by the form owner in Google Forms.

## Scrolling POW preview

`pdf-preview.js` uses locally bundled PDF.js 6.4.299 to render the POW as vertically stacked pages. Pages render near the viewport and resize to fit the available width. Selecting another week cancels pending rendering and destroys the previous PDF worker. The original PDF button remains available for text selection, accessibility, zoom, and downloads.

When publishing this feature, include `pdf-preview.js` and the complete `assets/vendor/pdfjs/` directory alongside the updated frontend files. No CDN or build step is required. The vendor directory includes the matching library/worker, font and decoding resources, version record, and license. Keep these resources on the same version when upgrading PDF.js.

Preview via an HTTP server rather than opening HTML directly from disk. Check all pages of each POW at mobile and desktop widths, week switching, rotation, and the original PDF link. Confirm touch scrolling on a physical phone before publishing.
