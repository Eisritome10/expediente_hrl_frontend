import { ApiError, type ApiErrorBody } from '@/types/common'
import { tokenStorage } from '@/api/token-storage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return false

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
  if (!response.ok) return false

  const session = (await response.json()) as { accessToken: string; refreshToken: string }
  tokenStorage.setTokens(session.accessToken, session.refreshToken)
  return true
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options

  const doFetch = () => {
    const finalHeaders = new Headers(headers)
    finalHeaders.set('Content-Type', 'application/json')
    if (auth) {
      const accessToken = tokenStorage.getAccessToken()
      if (accessToken) finalHeaders.set('Authorization', `Bearer ${accessToken}`)
    }
    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  let response = await doFetch()

  if (response.status === 401 && auth) {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null
    })
    const refreshed = await refreshPromise
    if (refreshed) {
      response = await doFetch()
    } else {
      tokenStorage.clear()
    }
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => undefined)) as ApiErrorBody | undefined
    throw new ApiError(response.status, errorBody)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
