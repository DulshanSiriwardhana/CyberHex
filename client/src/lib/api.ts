const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }

  return res.json();
}

export const api = {
  experiments: {
    list: (params?: { status?: string; page?: number }) =>
      request<any>(`/experiments?${new URLSearchParams(params as any)}`),
    get: (id: string) => request<any>(`/experiments/${id}`),
    create: (body: any) => request<any>('/experiments', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/experiments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/experiments/${id}`, { method: 'DELETE' }),
    run: (id: string) => request<any>(`/experiments/${id}/run`, { method: 'POST' }),
    stop: (id: string) => request<any>(`/experiments/${id}/stop`, { method: 'POST' }),
  },
  training: {
    start: (id: string, params?: any) =>
      request<any>(`/training/${id}/start`, { method: 'POST', body: JSON.stringify({ parameters: params }) }),
    status: (id: string) => request<any>(`/training/${id}/status`),
    logs: (id: string, page = 1) => request<any>(`/training/${id}/logs?page=${page}`),
  },
};