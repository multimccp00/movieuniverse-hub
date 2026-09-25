// The one place that talks to the backend. Every block calls api(...) instead of fetch.

// localStorage key where the logged-in username is kept between visits
export const USER_KEY = 'username'

// An error that remembers the HTTP status (e.g. 401), so callers can react to it
class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// FastAPI sends errors as {detail: "text"} or, for invalid input (422),
// {detail: [{msg: "Value error, ..."}]}. Turn both into one readable sentence.
function errorMessage(data) {
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg.replace(/^Value error, /, '')
  return 'Something went wrong'
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  // Tell the backend who we are (see get_current_user in the backend)
  const user = localStorage.getItem(USER_KEY)
  if (user) headers['X-User'] = user
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  // "/api" goes through the Vite proxy to the backend
  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  // 204 = success with no content. .catch: some errors have no JSON body.
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, errorMessage(data))
  return data
}
