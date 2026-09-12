export interface PaginationMeta {
  page: number
  limit: number
  total: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiErrorBody {
  message: string | string[]
  statusCode: number
  error?: string
  errorCode?: string
}

export class ApiError extends Error {
  status: number
  body: ApiErrorBody | undefined

  constructor(status: number, body: ApiErrorBody | undefined) {
    super(Array.isArray(body?.message) ? body.message.join(', ') : (body?.message ?? `Error ${status}`))
    this.status = status
    this.body = body
  }
}
