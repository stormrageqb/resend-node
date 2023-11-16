import { version } from '../package.json';
import { ApiKeys } from './api-keys/api-keys';
import { Audiences } from './audiences/audiences';
import { Batch } from './batch/batch';
import { GetOptions, PostOptions, PutOptions } from './common/interfaces';
import { Domains } from './domains/domains';
import { Emails } from './emails/emails';
import { isResendErrorResponse } from './guards';
import { ErrorResponse, Fetch, Options } from './interfaces';
import { fetch } from 'undici';

const baseUrl = process.env.RESEND_BASE_URL || 'https://api.resend.com';
const userAgent = process.env.RESEND_USER_AGENT || `resend-node:${version}`;

export class Resend {
  private readonly fetch: Fetch = fetch;
  private readonly headers: Headers;

  readonly apiKeys = new ApiKeys(this);
  readonly domains = new Domains(this);
  readonly emails = new Emails(this);
  readonly batch = new Batch(this);
  readonly audiences = new Audiences(this);

  constructor(readonly key?: string, options: Options = {}) {
    if (!key) {
      this.key = process.env.RESEND_API_KEY;

      if (!this.key) {
        throw new Error(
          'Missing API key. Pass it to the constructor `new Resend("re_123")`',
        );
      }
    }

    if (options.fetch) {
      this.fetch = options.fetch;
    }

    this.headers = new Headers({
      Authorization: `Bearer ${this.key}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/json',
    });

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        this.headers.set(key, value);
      }
    }
  }

  async fetchRequest<T>(
    path: string,
    options = {},
  ): Promise<{ data: T | null; error: ErrorResponse | null }> {
    const response = await this.fetch(`${baseUrl}${path}`, options);

    if (!response.ok) {
      const error = await response.json() as any;
      if (isResendErrorResponse(error)) {
        return { data: null, error };
      }

      return { data: null, error };
    }

    const data = await response.json() as any;
    return { data, error: null };
  }

  async post<T>(path: string, entity?: unknown, options: PostOptions = {}) {
    const requestOptions = {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(entity),
      ...options,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }

  async get<T>(path: string, options: GetOptions = {}) {
    const requestOptions = {
      method: 'GET',
      headers: this.headers,
      ...options,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }

  async put<T>(path: string, entity: any, options: PutOptions = {}) {
    const requestOptions = {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(entity),
      ...options,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }

  async delete<T>(path: string, query?: unknown) {
    const requestOptions = {
      method: 'DELETE',
      headers: this.headers,
      body: JSON.stringify(query),
    };

    return this.fetchRequest<T>(path, requestOptions);
  }
}
