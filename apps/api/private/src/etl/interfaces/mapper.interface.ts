/** Raw key-value record as extracted from CSV or XLSX before transformation. */
export type RawRow = Record<string, string>;

/** Describes a row that failed to transform, keeping the original data for inspection. */
export interface MapperError {
  rowIndex: number;
  message: string;
  raw: RawRow;
}

/** Contract for all entity mappers. */
export interface IMapper<T> {
  processAll(rows: RawRow[]): { results: T[]; errors: MapperError[] };
}
