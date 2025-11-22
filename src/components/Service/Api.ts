import { IApi, ApiPostMethods } from "../../types";

export class Api implements IApi {
  async get<T extends object>(uri: string): Promise<T> {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async post<T extends object>(
    uri: string,
    data: object,
    method: ApiPostMethods = "POST"
  ): Promise<T> {
    const response = await fetch(uri, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}
