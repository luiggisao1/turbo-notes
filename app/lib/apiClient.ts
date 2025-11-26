type TokenPair = { access: string | null; refresh?: string | null };

const ACCESS_KEY = 'app_access_token';
const REFRESH_KEY = 'app_refresh_token';

function readTokens(): TokenPair {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  return {
    access: localStorage.getItem(ACCESS_KEY),
    refresh: localStorage.getItem(REFRESH_KEY),
  };
}

function writeTokens(tokens: TokenPair) {
  if (typeof window === 'undefined') return;
  if (tokens.access) localStorage.setItem(ACCESS_KEY, tokens.access);
  else localStorage.removeItem(ACCESS_KEY);

  if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh);
  else localStorage.removeItem(REFRESH_KEY);
}

function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

class ApiClient {
  private static instance: ApiClient | null = null;
  private refreshUrl: string;

  private constructor(refreshUrl?: string) {
    this.refreshUrl = refreshUrl || (process?.env?.NEXT_PUBLIC_AUTH_REFRESH_URL as string) || 'http://localhost:8000/auth/refresh/';
  }

  static getInstance(refreshUrl?: string) {
    if (!ApiClient.instance) ApiClient.instance = new ApiClient(refreshUrl);
    return ApiClient.instance;
  }

  async setTokens(tokens: TokenPair) {
    writeTokens(tokens);
  }

  getAccessToken(): string | null {
    return readTokens().access;
  }

  getRefreshToken(): string | null | undefined {
    return readTokens().refresh;
  }

  async fetchWithAuth(input: RequestInfo, init: RequestInit = {}, options: { retry?: boolean } = {}): Promise<Response> {
    const token = this.getAccessToken();
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const mergedInit: RequestInit = { ...init, headers };
    let res = await fetch(input, mergedInit);

    if (res.status !== 401) return res;

    if (options.retry === false) {
      return res;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return res;
    }

    try {
      const refreshRes = await fetch(this.refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshRes.ok) {
        clearTokens();
        return res;
      }

      const data = await refreshRes.json().catch(() => null) as any;
      const newAccess = data?.access || data?.token || data?.access_token;
      const newRefresh = data?.refresh || data?.refresh_token;
      if (!newAccess) {
        clearTokens();
        return res;
      }

      writeTokens({ access: newAccess, refresh: newRefresh ?? refreshToken });

      const retryHeaders = new Headers(init.headers || {});
      retryHeaders.set('Authorization', `Bearer ${newAccess}`);
      const retryInit: RequestInit = { ...init, headers: retryHeaders };
      return await this.fetchWithAuth(input, retryInit, { retry: false });
    } catch (err) {
      console.error('Refresh failed', err);
      clearTokens();
      return res;
    }
  }

  logout() {
    clearTokens();
  }
}

const apiClient = ApiClient.getInstance();
export default apiClient;
