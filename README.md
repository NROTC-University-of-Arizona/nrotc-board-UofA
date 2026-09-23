# Arizona NROTC Battalion Board

A public bulletin board for upcoming events, volunteer opportunities, and announcements, built with HTML, CSS, and JavaScript.

## Current status

- Dark wooden board with University of Arizona, Navy, and Marine Corps imagery.
- Public reading access; no login or backend is required.
- Notices are currently fictional design examples, not scheduled battalion activities.
- OpenClaw/WhatsApp publishing is planned but is not connected.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and the three board sections |
| `styles.css` | Colors, typography, board styling, and responsive layouts |
| `app.js` | Notice content, rendering, and notice detail dialogs |
| `config.js` | Public display settings |
| `assets/` | Logo images and source information |

## Publish with GitHub Pages

Keep these files at the repository root, with `assets` beside `index.html`.
In repository **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, and save.
Once deployment succeeds, the site URL is:
https://thievishjoker-a11y.github.io/nrotc-board-Uofa/

## Update the notices

1. Edit the `sampleNotices` array near the top of `app.js`.
2. Use `EVENT`, `VOLUNTEER`, or `ANNOUNCEMENT` for each notice's category.
3. Give each notice a unique `id`, `title`, and `body`. Events also use `location` and `startsAt`.
4. Specify Tucson time with an explicit offset, for example `2026-10-02T06:00:00-07:00`.
5. After replacing all sample notices with approved public content, set `demoMode` to `false` in `config.js`.
6. Commit the changes to `main` and wait for GitHub Pages to finish publishing.

Notice text is rendered as text, not HTML. Keep valid JavaScript syntax when editing strings and arrays.

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
