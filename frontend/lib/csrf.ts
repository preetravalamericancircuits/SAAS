// CSRF protection utilities for frontend

let csrfToken: string | null = null;

export async function getCSRFToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch('/api/v1/csrf/token', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrf_token;
      return csrfToken;
    }
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }

  throw new Error('Failed to obtain CSRF token');
}

export function getCSRFHeaders(): Record<string, string> {
  return {
    'X-Requested-With': 'XMLHttpRequest',
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
  };
}

export async function makeSecureRequest(url: string, options: RequestInit = {}): Promise<Response> {
  // Ensure we have a CSRF token for state-changing requests
  const method = options.method?.toUpperCase() || 'GET';
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  if (isStateChanging) {
    try {
      await getCSRFToken();
    } catch (error) {
      console.warn('Could not get CSRF token, proceeding with X-Requested-With header only');
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getCSRFHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

// Clear token on logout or error
export function clearCSRFToken(): void {
  csrfToken = null;
}