/**
 * REQ-006 / REQ-012: send the visitor to the product login page and remember
 * where they were so sign-in returns them there. Full navigation keeps this
 * usable from outside React (the axios interceptor).
 */
export function redirectToLogin(returnTo) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  const target = returnTo || `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?redirect=${encodeURIComponent(target)}`);
}

export function isUnauthorized(error) {
  return error?.response?.status === 401;
}

export function isLimitReached(error) {
  return (
    error?.response?.status === 422 &&
    error?.response?.data?.error_code === 'FAVORITES_LIMIT_REACHED'
  );
}

export function isNotFound(error) {
  return error?.response?.status === 404;
}
