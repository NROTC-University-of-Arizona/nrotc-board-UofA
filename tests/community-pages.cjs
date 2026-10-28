// Run with the existing preview server on port 5173 and Playwright available.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.BOARD_TEST_URL || 'http://127.0.0.1:5173/';
const pages = ['index.html', 'clubs.html', 'ndt.html', 'marines.html', 'sep.html', 'sop.html'];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  const signedOut = await browser.newContext();
  const login = await signedOut.newPage();
  const protectedRequests = [];
  login.on('request', request => {
    if (/\/documents\/.*\.pdf|docs\.google\.com\/(?:spreadsheets|document)\//.test(request.url())) protectedRequests.push(request.url());
  });
  for (const file of pages) {
    await login.goto(base + file, { waitUntil: 'domcontentloaded' });
    await login.waitForURL('**/login.html?*');
    assert.equal(new URL(login.url()).searchParams.get('next'), file);
  }
  assert.equal(protectedRequests.length, 0, 'No PDF or Google document loads before login');
  assert.equal(await login.evaluate(() => BoardAuth.returnDestination('sep.html#sep-matrix-heading')), base + 'sep.html#sep-matrix-heading');
  assert.equal(await login.evaluate(() => BoardAuth.returnDestination('https://example.com/')), base + 'index.html');
  await login.evaluate(() => sessionStorage.setItem('nrotc-board-session', 'fall-2026-v1'));
  await login.reload({ waitUntil: 'domcontentloaded' });
  await login.waitForURL('**/sop.html');
  await signedOut.close();

  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width < 500, isMobile: width < 500, deviceScaleFactor: 2 });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-10-28T10:00:00-07:00'));
    await page.goto(base + 'login.html');
    await page.evaluate(() => sessionStorage.setItem('nrotc-board-session', 'fall-2026-v1'));
    for (const file of pages) {
      await page.goto(base + file, { waitUntil: 'domcontentloaded' });
      await page.locator('.deadline-banner:not([hidden])').waitFor();
      assert.equal(await page.locator('.deadline-copy strong').textContent(), 'Pay Wardroom for your ball ticket.');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file} overflows at ${width}`);
      const navigation = page.getByRole('navigation', { name: 'Main navigation' });
      assert.equal(await navigation.getByRole('link', { name: 'Plan of the Week' }).count(), 0);
      assert.equal(await navigation.getByRole('link', { name: 'Battalion Updates' }).count(), 0);
      assert.deepEqual(await navigation.locator(':scope > a, :scope > button, :scope > .nav-disclosure > button').evaluateAll(nodes => nodes.map(node => node.childNodes[0].textContent)), ['Quick Links', 'Club Spaces', 'Platoons', 'SEP', 'SOP', 'Log out']);
      const fallbackNav = await page.evaluate(async () => {
        const markup = await (await fetch(location.href)).text();
        return new DOMParser().parseFromString(markup, 'text/html').querySelector('[data-site-navigation]').textContent;
      });
      assert(!/Plan of the Week|Battalion Updates/.test(fallbackNav), 'Fallback navigation must omit removed tabs');
      assert.equal(await page.locator('.wordmark').getAttribute('href'), './');
      if (file !== 'index.html') assert.equal(await page.locator('footer a').getAttribute('href'), 'index.html');
      const bulletin = page.getByRole('button', { name: 'Quick Links' });
      await bulletin.click();
      assert.equal(await bulletin.getAttribute('aria-expanded'), 'true');
      assert.equal(await page.locator('#quick-links-menu .bulletin-link-group').count(), 3);
      assert.equal(await page.locator('#quick-links-menu .bulletin-resource-link').count(), 12);
      assert.deepEqual(await page.locator('#quick-links-menu h2').allTextContents(), ['Forms & Requests', 'Awards', 'Reference Resources']);
      assert.equal(await page.locator('#quick-links-menu .bulletin-full-link').getAttribute('href'), await page.evaluate(() => COMMUNITY_CONTENT.bulletinUrl));
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Open Full Weekly Bulletin ↗');
      await page.keyboard.press('Escape');
      assert.equal(await bulletin.getAttribute('aria-expanded'), 'false');
      assert(await bulletin.evaluate(el => el === document.activeElement));
      await bulletin.press('Enter');
      await page.getByRole('button', { name: 'Platoons' }).click();
      assert.equal(await bulletin.getAttribute('aria-expanded'), 'false');
      assert.equal(await page.locator('#platoon-menu a').count(), 2);
      await page.locator('.masthead').click({ position: { x: 1, y: 1 } });
      assert(await page.locator('#platoon-menu').evaluate(el => el.hidden));
      if (file === 'index.html') {
        assert.equal(await page.locator('#document-week option').count(), 3);
        assert.equal(await page.locator('#document-week').inputValue(), '2026-10-25');
        for (const [id, count] of [['2026-10-18', 4], ['2026-10-11', 3]]) {
          await page.selectOption('#document-week', id);
          if (width > 760) await page.locator('.pow-native-viewer').waitFor();
          else {
            await page.waitForFunction(n => document.querySelectorAll('.pdf-page').length === n, count);
            await page.locator('.pdf-page').last().scrollIntoViewIfNeeded();
            await page.locator('.pdf-page').last().locator('canvas').waitFor();
          }
        }
        assert.equal(await page.locator('#feedback-link').getAttribute('target'), '_blank');
        assert.equal(await page.locator('#pow-heading').textContent(), 'Plan of the Week');
        assert.equal(await page.locator('#support-heading').textContent(), 'Battalion Updates');
        assert.equal(await page.locator('#rotc-forms-heading').textContent(), 'ROTC Forms & Requirements');
        assert.equal(await page.locator('#rotc-forms a').count(), 0);

      }
      if (file === 'index.html') {
        assert.equal(await page.locator('#rotc-forms h3').textContent(), 'MIDN Evaluations');
        assert.equal(await page.locator('#rotc-forms time').getAttribute('datetime'), '2026-11-06T16:00:00-07:00');
        assert.equal(await page.locator('#rotc-forms time').textContent(), 'Nov 6, 2026 · 1600');
        assert.equal(await page.locator('#rotc-forms .form-reference').textContent(), 'See Appendix 3-A of the SOP.');
        assert.equal(await page.locator('#rotc-forms a').count(), 0, 'Evaluation uses an appendix reference without an invented form link');
      }
      if (file === 'sop.html') {
        assert.equal(await page.locator('#rotc-forms').count(), 0);
        assert.equal(await navigation.getByRole('link', { name: 'SOP', exact: true }).getAttribute('aria-current'), 'page');
        const originalSop = page.getByRole('link', { name: 'Open SOP PDF' });
        assert.equal(await originalSop.getAttribute('href'), base + 'documents/nrotcua-sop-1533-1.pdf');
        assert.equal(await originalSop.getAttribute('target'), '_blank');
        const sopResponse = await page.request.get(await originalSop.getAttribute('href'));
        assert(sopResponse.ok());
        assert.equal((await sopResponse.body()).subarray(0, 5).toString(), '%PDF-');
        if (width > 760) {
          assert.equal(await page.locator('.pow-native-viewer').getAttribute('src'), await originalSop.getAttribute('href'));
          assert.equal(await page.locator('.pow-native-viewer').getAttribute('title'), 'SOP PDF');
        } else {
          await page.waitForFunction(() => document.querySelectorAll('.pdf-page').length === 58);
          for (const index of [0, 41, 57]) {
            const pdfPage = page.locator('.pdf-page').nth(index);
            await pdfPage.scrollIntoViewIfNeeded();
            await pdfPage.locator('canvas').waitFor();
            assert(await pdfPage.locator('canvas').evaluate(canvas => canvas.width > 0 && canvas.clientWidth <= innerWidth));
            if (index === 41) await pdfPage.screenshot({ path: '/tmp/nrotc-sop-mobile-appendix.png' });
          }
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `/tmp/nrotc-sop-${width}.png` });
      }
      if (file === 'clubs.html') {
        assert.equal(await page.locator('.club-board').count(), 2);
        assert.equal(await page.locator('.club-photo').count(), 4);
      }
      if (file === 'ndt.html') {
        const resources = await page.evaluate(() => COMMUNITY_CONTENT.linkGroups.find(group => group.id === 'ndt').links);
        assert.equal(await page.locator('#ndt-resources iframe').count(), 3);
        for (const item of resources) {
          const panel = page.locator(`#ndt-${item.id}`);
          const original = panel.getByRole('link', { name: 'Open Document' });
          assert.equal(await original.getAttribute('href'), item.url);
          assert.equal(await original.getAttribute('target'), '_blank');
          const iframe = panel.locator('iframe');
          assert.equal(await iframe.getAttribute('src'), item.previewUrl);
          assert.equal(await iframe.getAttribute('title'), item.label);
          await iframe.scrollIntoViewIfNeeded();
          const frame = await (await iframe.elementHandle()).contentFrame();
          if (item.id === 'schedule') {
            // Docs draws its preview on canvases. Require real text/line pixels, not a blank frame.
            await frame.waitForFunction(() => [...document.querySelectorAll('canvas')].some(canvas => {
              if (!canvas.width || !canvas.height) return false;
              const context = canvas.getContext('2d');
              if (!context) return false;
              const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
              let darkPixels = 0;
              for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i + 3] > 200 && pixels[i] < 100 && pixels[i + 1] < 100 && pixels[i + 2] < 100) darkPixels++;
                if (darkPixels > 1000) return true;
              }
              return false;
            }), undefined, { timeout: 30000 });
            const editor = frame.locator('.kix-appview-editor');
            assert(await editor.evaluate(el => el.scrollHeight > el.clientHeight));
            await editor.evaluate(el => { el.scrollTop = el.scrollHeight; });
            assert(await editor.evaluate(el => el.scrollTop > 0), 'Schedule scrolls to later pages');
            await editor.evaluate(el => { el.scrollTop = 0; });
          } else {
            await frame.getByText(item.id === 'watchbill' ? 'COVE' : 'SQUAD 1', { exact: true }).first().waitFor();
            assert(await frame.locator('table tr').count() > 5, 'Spreadsheet includes data rows');
            // Verify the linked worksheet and the far end of each table, not just its heading.
            await frame.getByText(item.id === 'watchbill' ? '27 Oct' : 'SQUAD 6', { exact: true }).waitFor();
            if (item.id === 'watchbill') assert.equal(new URL(item.previewUrl).searchParams.get('gid'), '0');
            else assert(!new URL(item.previewUrl).searchParams.has('gid'), 'Squads uses its default worksheet');
            if (width < 500) {
              await frame.evaluate(() => window.scrollTo(document.documentElement.scrollWidth, 0));
              assert(await frame.evaluate(() => scrollX > 0), 'Wide spreadsheet scrolls horizontally on mobile');
              await frame.evaluate(() => window.scrollTo(0, 0));
            }
          }
          assert(await panel.locator('.viewer-guidance').isVisible());
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          await panel.screenshot({ path: `/tmp/nrotc-ndt-${item.id}-${width}.png` });
        }
        assert.equal(await page.locator('#platoon-board-heading').textContent(), 'NDT Notice Board');
        assert.equal(await page.locator('.empty-platoon-board .empty').textContent(), 'No notices posted yet.');
      }
      if (file === 'sep.html') {
        await page.waitForFunction(() => document.getElementById('sep-example-image').naturalWidth > 0);
        const ids = {
          a1: '1FAIpQLSfMnOxHkuni2upDRWWHUm5gvcOFkd5JFSt6DcVwg-UH8T3iBQ',
          a2: '1FAIpQLScMmY1Nins2nuim-3hQVKuSxb8qqPO9FwFfaoN7VmJrBgbVjA',
          a3: '1FAIpQLScYblMweIf873Ma-is88_OSXKHRw5tWdnJ6cJKTmeneS_Y9gQ',
          hq: '1FAIpQLSeNaF5qP2-Ar1vCWz_9VTaP3bUnF2IJXBeMazkxcdqMmptZDQ'
        };
        for (const [key, id] of Object.entries(ids)) assert.equal(await page.locator(`[data-sep-link="${key}"] a`).getAttribute('href'), `https://docs.google.com/forms/d/e/${id}/viewform?usp=publish-editor`);
        assert.equal(await page.locator('#sep-contact-email').getAttribute('href'), 'mailto:maragon03@arizona.edu');
        assert.equal(await page.locator('#sep-contact-phone').getAttribute('href'), 'tel:3109264808');
        assert.equal(await page.locator('.sheet-viewer').getAttribute('src'), 'https://docs.google.com/spreadsheets/d/1yEENA8UtvM4fTzHjqNpBfTAYp7LjI8eBQCuCWofKnnQ/gviz/tq?tqx=out:html&gid=1624471322');
        await page.locator('.sheet-viewer').scrollIntoViewIfNeeded();
        await page.frameLocator('.sheet-viewer').getByText('Infraction Type', { exact: true }).waitFor();
        await page.frameLocator('.sheet-viewer').getByText('For 3/C and up any offense is an MIR', { exact: true }).waitFor();
        await page.screenshot({ path: `/tmp/nrotc-sep-${width}.png`, fullPage: true });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: 'Quick Links' }).click();
        await page.screenshot({ path: `/tmp/nrotc-menu-${width}.png` });
        await page.keyboard.press('Escape');
      }
      // Every page's new shared logout control must clear the existing session.
      await page.getByRole('button', { name: 'Log out', exact: true }).click();
      await page.waitForURL('**/login.html');
      assert.equal(await page.evaluate(() => sessionStorage.getItem('nrotc-board-session')), null);
      await page.evaluate(() => sessionStorage.setItem('nrotc-board-session', 'fall-2026-v1'));
    }
    console.log(`PASS ${width}px: six pages, SOP deadline, menus, NDT viewer content and scrolling, logout, links, archived PDFs, clubs, no overflow`);
    await context.close();
  }

  const expiry = await browser.newContext({ timezoneId: 'America/New_York' });
  await expiry.addInitScript(() => sessionStorage.setItem('nrotc-board-session', 'fall-2026-v1'));
  const page = await expiry.newPage();
  await page.clock.install({ time: new Date('2026-10-30T23:59:58-07:00') });
  await page.goto(base + 'marines.html', { waitUntil: 'domcontentloaded' });
  assert(await page.locator('.deadline-banner').isVisible());
  await page.clock.fastForward(3000);
  assert(await page.locator('.deadline-banner').isHidden());
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert(await page.locator('.deadline-banner').isHidden());
  console.log('PASS expiration at Tucson midnight, including a different visitor timezone');
  assert.deepEqual(errors, []);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
