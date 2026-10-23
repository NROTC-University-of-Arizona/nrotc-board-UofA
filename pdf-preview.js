import { getDocument, GlobalWorkerOptions } from './assets/vendor/pdfjs/pdf.min.mjs';

const vendorUrl = new URL('./assets/vendor/pdfjs/', import.meta.url);
GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', vendorUrl).href;

/** Render pages near the viewport; return cleanup for week changes. */
export function mountPdfPreview(container, url) {
  // Keep essential geometry with the renderer so stale/missing CSS cannot
  // display high-density canvases at their much larger pixel-buffer size.
  Object.assign(container.style, { display: 'grid', gap: '16px', width: '100%', minWidth: '0', marginTop: '16px' });
  let disposed = false;
  let renderQueue = Promise.resolve();
  let resizeTimer;
  const pages = [];
  const status = document.createElement('p');
  status.className = 'pdf-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Loading PDF…';
  container.replaceChildren(status);

  const loadingTask = getDocument({
    url,
    cMapUrl: new URL('cmaps/', vendorUrl).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('standard_fonts/', vendorUrl).href,
    wasmUrl: new URL('wasm/', vendorUrl).href,
    iccUrl: new URL('iccs/', vendorUrl).href,
    isEvalSupported: false,
  });

  function queuePage(entry) {
    // Serialize work to avoid overwhelming phones with simultaneous canvases.
    renderQueue = renderQueue.then(async () => {
      if (disposed || !entry.nearViewport) return;
      const width = Math.floor(entry.surface.clientWidth);
      if (!width || entry.renderedWidth === width) return;
      entry.error?.remove();
      const viewport = entry.page.getViewport({ scale: width / entry.baseViewport.width });
      // Limit raster memory while retaining sharp text on high-density screens.
      const density = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4000000 / (viewport.width * viewport.height)));
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width * density);
      canvas.height = Math.ceil(viewport.height * density);
      Object.assign(canvas.style, { display: 'block', width: '100%', maxWidth: '100%', height: 'auto' });
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `PDF page ${entry.page.pageNumber}; open the original PDF for accessible text.`);
      try {
        entry.renderTask = entry.page.render({
          canvasContext: canvas.getContext('2d'), viewport,
          transform: [density, 0, 0, density, 0, 0],
        });
        await entry.renderTask.promise;
        if (disposed) return;
        entry.surface.replaceChildren(canvas);
        entry.renderedWidth = width;
      } catch (error) {
        if (disposed || error.name === 'RenderingCancelledException') return;
        entry.error = document.createElement('p');
        entry.error.className = 'pdf-page-error';
        entry.error.textContent = 'This page could not be previewed. Use Open POW PDF above.';
        entry.surface.append(entry.error);
      } finally {
        entry.renderTask = null;
      }
    });
  }

  const visibilityObserver = new IntersectionObserver(entries => {
    for (const observed of entries) {
      const entry = pages.find(page => page.figure === observed.target);
      if (!entry) continue;
      entry.nearViewport = observed.isIntersecting;
      if (entry.nearViewport) queuePage(entry);
    }
  }, { rootMargin: '700px 0px' });

  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const entry of pages) if (entry.nearViewport) queuePage(entry);
    }, 150);
  });
  resizeObserver.observe(container);

  (async () => {
    try {
      const pdf = await loadingTask.promise;
      for (let number = 1; number <= pdf.numPages; number++) {
        if (disposed) return;
        const page = await pdf.getPage(number);
        if (disposed) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const figure = document.createElement('figure');
        figure.className = 'pdf-page';
        Object.assign(figure.style, { margin: '0', minWidth: '0', width: '100%' });
        const caption = document.createElement('figcaption');
        caption.textContent = `Page ${number} of ${pdf.numPages}`;
        const surface = document.createElement('div');
        surface.className = 'pdf-page-surface';
        Object.assign(surface.style, { position: 'relative', width: '100%', overflow: 'hidden', background: 'white' });
        // Reserve each page's height before rendering so scrolling stays stable.
        surface.style.aspectRatio = `${baseViewport.width} / ${baseViewport.height}`;
        figure.append(caption, surface);
        const entry = { page, baseViewport, figure, surface, renderedWidth: 0, nearViewport: false };
        pages.push(entry);
        container.append(figure);
        visibilityObserver.observe(figure);
      }
      if (!disposed) status.textContent = `${pdf.numPages} pages · Scroll to read`;
    } catch {
      if (!disposed) status.textContent = 'Preview unavailable. Use Open POW PDF above to read the document.';
    }
  })();

  return () => {
    disposed = true;
    clearTimeout(resizeTimer);
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    for (const entry of pages) entry.renderTask?.cancel();
    // Destroy the worker and pending fetches when the selected week changes.
    loadingTask.destroy().catch(() => {});
  };
}
