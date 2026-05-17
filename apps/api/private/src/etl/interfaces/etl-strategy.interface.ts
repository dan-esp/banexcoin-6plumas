import { RawRow } from './mapper.interface.js';

/** Contract for file extraction strategies (CSV, XLSX). */
export interface IEtlStrategy {
  /**
   * Reads a file buffer and returns an array of raw key-value rows.
   * Keys are the column header strings exactly as found in the file.
   */
  extractRows(buffer: Buffer): Promise<RawRow[]>;
}
