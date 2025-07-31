export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function redirectToLogin(message = "Debes iniciar sesión para acceder a esta página") {
  // Store current location for redirect after login
  localStorage.setItem('redirectAfterLogin', window.location.pathname);
  window.location.href = `/login?message=${encodeURIComponent(message)}`;
}

export function getRedirectPath(): string {
  const savedPath = localStorage.getItem('redirectAfterLogin');
  localStorage.removeItem('redirectAfterLogin');
  return savedPath || '/';
}