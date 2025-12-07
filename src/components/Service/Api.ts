import { IApi, ApiPostMethods } from "../../types";

export class Api implements IApi {
  readonly baseUrl: string;
  protected options: RequestInit;

  constructor(baseUrl: string, options: RequestInit = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      headers: {
        "Content-Type": "application/json",
        ...((options.headers as object) ?? {}),
      },
    };
  }

  protected handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) return response.json();
    else
      return response
        .json()
        .then((data) => Promise.reject(data.error ?? response.statusText));
  }

  async get<T extends object>(uri: string): Promise<T> {
    console.log(`API GET: ${this.baseUrl}${uri}`);
    const response = await fetch(this.baseUrl + uri, {
      ...this.options,
      method: "GET",
    });
    console.log(`API Response status: ${response.status}`);
    return this.handleResponse<T>(response);
  }

  async post<T extends object>(
    uri: string,
    data: object,
    method: ApiPostMethods = "POST"
  ): Promise<T> {
    console.log(`API POST: ${this.baseUrl}${uri}`, data);
    const response = await fetch(this.baseUrl + uri, {
      ...this.options,
      method,
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }
}
