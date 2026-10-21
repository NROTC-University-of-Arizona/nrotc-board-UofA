'use strict';

const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('login-password');
const loginMessage = document.getElementById('login-message');
const submitButton = document.getElementById('login-submit');
const destination = BoardAuth.returnDestination(new URLSearchParams(location.search).get('next'));
if (BoardAuth.isSignedIn()) location.replace(destination);

document.getElementById('show-password').addEventListener('change', event => {
  passwordInput.type = event.target.checked ? 'text' : 'password';
});
loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  submitButton.disabled = true;
  loginMessage.textContent = '';
  try {
    const accepted = await BoardAuth.signIn(document.getElementById('login-email').value, passwordInput.value);
    if (accepted) location.replace(destination);
    else loginMessage.textContent = 'Email or password is incorrect.';
  } catch {
    loginMessage.textContent = 'Unable to sign in. Allow browser session storage and use HTTPS or the local preview.';
  } finally {
    submitButton.disabled = false;
  }
});
