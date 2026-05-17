import { IMapper, MapperError, RawRow } from '../interfaces/mapper.interface.js';

/**
 * Template Method pattern: defines the algorithm skeleton for processing rows.
 *
 * processAll() handles iteration and error isolation — a single bad row
 * does not abort the entire file. Subclasses implement only doMap()
 * to perform the actual field extraction and type conversion.
 */
export abstract class BaseMapper<T> implements IMapper<T> {
  processAll(rows: RawRow[]): { results: T[]; errors: MapperError[] } {
    const results: T[] = [];
    const errors: MapperError[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        results.push(this.doMap(rows[i]));
      } catch (err: unknown) {
        errors.push({
          rowIndex: i,
          message: (err as Error).message,
          raw: rows[i],
        });
      }
    }

    return { results, errors };
  }

  /** Subclasses implement field extraction and type conversion for a single row. */
  protected abstract doMap(raw: RawRow): T;
}
