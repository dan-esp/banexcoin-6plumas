import { Injectable } from '@nestjs/common';
import { EntityType } from '../../common/enums/entity-type.enum.js';

/**
 * Repository pattern: in-memory store for all parsed entity rows.
 *
 * Scoped as a singleton (NestJS default) so data persists for the lifetime
 * of the server process. To reset, use the clear() method or restart the server.
 *
 * Typed generics are used at call sites for read safety;
 * the underlying map uses unknown[] to remain entity-agnostic.
 */
@Injectable()
export class EtlStore {
  private readonly store = new Map<EntityType, unknown[]>();

  /** Replaces all stored rows for the given entity type. */
  set<T>(type: EntityType, rows: T[]): void {
    this.store.set(type, rows);
  }

  /** Returns all stored rows for the given entity type, or an empty array if none loaded. */
  get<T>(type: EntityType): T[] {
    return (this.store.get(type) ?? []) as T[];
  }

  /** Removes all stored rows for the given entity type. */
  clear(type: EntityType): void {
    this.store.delete(type);
  }

  /** Returns a snapshot of row counts per entity type for all loaded types. */
  status(): Record<string, number> {
    const snapshot: Record<string, number> = {};
    for (const [entityType, rows] of this.store) {
      snapshot[entityType] = rows.length;
    }
    return snapshot;
  }
}
