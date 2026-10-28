'use strict';

// This is a convenience gate, not server-side authorization. Never store personal data in the session.
window.BoardAuth = (() => {
  const sessionKey = 'nrotc-board-session';
  const config = window.BOARD_AUTH_CONFIG;
  const protectedPage = document.documentElement.hasAttribute('data-login-required');
  function isSignedIn() {
    try { return sessionStorage.getItem(sessionKey) === config.version; }
    catch { return false; }
  }
  function loginUrl() {
    const requestedPage = location.pathname.split('/').pop() || 'index.html';
    return 'login.html?next=' + encodeURIComponent(requestedPage + location.search + location.hash);
  }
  function enforceLogin() {
    if (!isSignedIn()) {
      document.documentElement.removeAttribute('data-authenticated');
      location.replace(loginUrl());
      return false;
    }
    document.documentElement.setAttribute('data-authenticated', '');
    return true;
  }
  async function digest(value) {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  async function signIn(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return false;
    const [emailHash, passwordHash] = await Promise.all([
      digest('nrotc-email:' + normalizedEmail), digest('nrotc-password:' + password)
    ]);
    if (!config.emailHashes.includes(emailHash) || passwordHash !== config.passwordHash) return false;
    sessionStorage.setItem(sessionKey, config.version);
    return true;
  }
  // Only known site pages can be return destinations, including when hosted under a repository path.
  function returnDestination(value) {
    const base = new URL('./', location.href);
    try {
      const destination = new URL(value || 'index.html', base);
      const allowedPaths = ['index.html', 'clubs.html', 'ndt.html', 'marines.html', 'sep.html', 'sop.html'].map(page => new URL(page, base).pathname);
      if (destination.origin === base.origin && allowedPaths.includes(destination.pathname)) {
        return destination.href;
      }
    } catch { /* Invalid destinations use the homepage. */ }
    return new URL('index.html', base).href;
  }
  function logOut() {
    document.documentElement.removeAttribute('data-authenticated');
    try { sessionStorage.removeItem(sessionKey); } catch { /* The gate remains closed. */ }
    location.replace('login.html');
  }
  if (protectedPage) {
    enforceLogin();
    // Recheck pages restored by Back/Forward so logout cannot reveal a cached page.
    window.addEventListener('pageshow', enforceLogin);
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-logout]').forEach(button => button.addEventListener('click', logOut));
    });
  }
  return Object.freeze({ isSignedIn, signIn, returnDestination, logOut });
})();
