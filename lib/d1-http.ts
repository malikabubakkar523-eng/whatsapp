/**
 * Cloudflare D1 HTTP Client for Vercel / Node.js Serverless Runtime.
 * Implements the standard D1Database interface using Cloudflare's official D1 REST API.
 */

export interface D1HttpConfig {
  accountId: string;
  databaseId: string;
  apiToken: string;
}

export interface D1Result<T = any> {
  results?: T[];
  success: boolean;
  meta?: any;
  error?: string;
}

export class D1HttpPreparedStatement {
  private sql: string;
  private params: any[];
  private config: D1HttpConfig;

  constructor(sql: string, config: D1HttpConfig, params: any[] = []) {
    this.sql = sql;
    this.config = config;
    this.params = params;
  }

  bind(...values: any[]): D1HttpPreparedStatement {
    return new D1HttpPreparedStatement(this.sql, this.config, values);
  }

  async run<T = any>(): Promise<D1Result<T>> {
    const res = await this.execute();
    return {
      results: res.results || [],
      success: res.success !== false,
      meta: res.meta || {},
    };
  }

  async all<T = any>(): Promise<D1Result<T>> {
    const res = await this.execute();
    return {
      results: res.results || [],
      success: res.success !== false,
      meta: res.meta || {},
    };
  }

  async raw<T = any>(): Promise<T[]> {
    const res = await this.execute();
    const rows = res.results || [];
    if (rows.length === 0) return [];
    return rows.map((row: any) => Object.values(row)) as T[];
  }

  async first<T = any>(colName?: string): Promise<T | null> {
    const res = await this.execute();
    const rows = res.results || [];
    if (rows.length === 0) return null;
    const firstRow = rows[0];
    if (colName) return firstRow[colName] ?? null;
    return firstRow as T;
  }

  private async execute(): Promise<any> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/d1/database/${this.config.databaseId}/query`;
    
    // Normalize parameters for SQLite
    const formattedParams = this.params.map((p) => {
      if (p instanceof Date) return p.toISOString();
      if (typeof p === "boolean") return p ? 1 : 0;
      if (p === undefined) return null;
      return p;
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: this.sql,
        params: formattedParams,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudflare D1 HTTP API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (!data.success && data.errors && data.errors.length > 0) {
      throw new Error(`Cloudflare D1 Error: ${data.errors[0]?.message || JSON.stringify(data.errors)}`);
    }

    // Cloudflare D1 returns array of results for each query in payload
    const queryResult = data.result?.[0] || { results: [], success: true, meta: {} };
    return queryResult;
  }
}

export class D1HttpClient {
  private config: D1HttpConfig;

  constructor(config: D1HttpConfig) {
    this.config = config;
  }

  prepare(query: string): D1HttpPreparedStatement {
    return new D1HttpPreparedStatement(query, this.config);
  }

  async batch<T = any>(statements: D1HttpPreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    for (const stmt of statements) {
      const res = await stmt.all<T>();
      results.push(res);
    }
    return results;
  }

  async exec(query: string): Promise<any> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/d1/database/${this.config.databaseId}/query`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: query }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`D1 exec failed: ${err}`);
    }

    return await response.json();
  }
}

/**
 * Creates a D1 client if Cloudflare credentials are provided in process.env.
 */
export function createD1HttpClientFromEnv(): D1HttpClient | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || "d4626968-e5c1-4ea0-acc5-c2c5ee09f3a2";
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN;

  if (accountId && apiToken && databaseId) {
    return new D1HttpClient({ accountId, databaseId, apiToken });
  }

  return null;
}
