import { Injectable, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

@Injectable()
export class DatabaseService implements OnModuleDestroy, OnModuleInit {
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is required for clinical API");
    this.pool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    try { await this.pool.query("SELECT 1"); }
    catch { throw new ServiceUnavailableException("Database unavailable"); }
  }

  async onModuleDestroy(): Promise<void> { await this.pool.end(); }

  query<T extends QueryResultRow = QueryResultRow>(sql: string, args: unknown[] = []): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, args);
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
