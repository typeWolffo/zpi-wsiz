import { setupTestDatabase, closeTestDatabase } from './test-database';
import type { DatabasePg } from '../src/common';

/**
 * Klasa zarządzająca pojedynczą bazą danych dla wszystkich testów.
 * Teraz działa prawidłowo, ponieważ wszystkie testy uruchamiają się
 * w jednym procesie (bez izolacji).
 */
class SharedTestDb {
  private static instance: SharedTestDb;
  private _db: DatabasePg | null = null;
  private _connectionString: string = '';
  private _initialized: boolean = false;

  private constructor() {}

  public static getInstance(): SharedTestDb {
    if (!SharedTestDb.instance) {
      SharedTestDb.instance = new SharedTestDb();
    }
    return SharedTestDb.instance;
  }

  public async init(): Promise<void> {
    if (this._initialized) {
      return;
    }

    console.log('Inicjalizuję współdzieloną bazę danych testową...');
    const { db, connectionString } = await setupTestDatabase();
    this._db = db;
    this._connectionString = connectionString;
    this._initialized = true;
    console.log(`Inicjalizacja zakończona: ${connectionString}`);
  }

  public async close(): Promise<void> {
    if (!this._initialized) {
      return;
    }

    console.log('Zamykam współdzieloną bazę danych testową...');
    await closeTestDatabase();
    this._db = null;
    this._connectionString = '';
    this._initialized = false;
    console.log('Baza danych zamknięta.');
  }

  public get db(): DatabasePg {
    if (!this._initialized || !this._db) {
      throw new Error('Shared test database has not been initialized.');
    }
    return this._db;
  }

  public get connectionString(): string {
    if (!this._initialized) {
      throw new Error('Shared test database has not been initialized.');
    }
    return this._connectionString;
  }

  public get isInitialized(): boolean {
    return this._initialized;
  }
}

export const sharedTestDb = SharedTestDb.getInstance();
