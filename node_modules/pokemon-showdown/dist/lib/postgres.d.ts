/**
 * Library made to simplify accessing / connecting to postgres databases,
 * and to cleanly handle when the pg module isn't installed.
 * @author mia-pi-git
 */
import type * as PG from 'pg';
import type { SQLStatement } from 'sql-template-strings';
import * as Streams from './streams';
interface MigrationOptions {
    table: string;
    migrationsFolder: string;
    baseSchemaFile: string;
}
export declare class PostgresDatabase {
    private pool;
    constructor(config?: AnyObject);
    destroy(): Promise<void>;
    query(statement: string | SQLStatement, values?: any[]): Promise<any[]>;
    static getConfig(): AnyObject;
    transaction(callback: (conn: PG.PoolClient) => any, depth?: number): Promise<any>;
    stream<T = any>(query: string): Streams.ObjectReadStream<T>;
    ensureMigrated(opts: MigrationOptions): Promise<void>;
}
export {};
