const BASE_URL = 'https://80.78.243.224:8443/api'

interface ApiResponse<T> {
  data: T
  error?: string
}

interface ErrorPayload {
  error?: string
}

async function http<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)

    const text = await response.text()

    const raw = text ? JSON.parse(text) : null
    const data = raw as T
    const errorInfo = raw as ErrorPayload

    if (!response.ok) {
      const serverMessage = errorInfo.error ?? `HTTP error! Status: ${response.status}`
      throw new Error(serverMessage)
    }

    return { data }
  } catch (err: unknown) {
    return {
      data: null as unknown as T,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function get<T>(endpoint: string) {
  return http<T>(endpoint, { method: 'GET' })
}

export async function post<T, U>(endpoint: string, body: U) {
  return http<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function put<T, U>(endpoint: string, body: U) {
  return http<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function del<T>(endpoint: string) {
  return http<T>(endpoint, { method: 'DELETE' })
}
