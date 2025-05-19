const BASE_URL = '/api' 

interface ApiResponse<T> {
  data: T
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
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! Status: ${response.status}`)
    }

    return { data }
  } catch (error) {
    return {
      data: null as unknown as T,
      error: error instanceof Error ? error.message : 'Unknown error',
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
