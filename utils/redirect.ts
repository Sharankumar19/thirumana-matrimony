export function getRedirectPath(searchParams: URLSearchParams, fallback = '/search'): string {
  const redirect = searchParams.get('redirect');
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return fallback;
  }
  return redirect;
}

export const INTEREST_LOGIN_MESSAGE =
  'Please log in or create an account to express your interest in this profile.';
