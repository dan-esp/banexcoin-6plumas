import type { OracleConfig, OracleRateContext } from '../oracle.types';

export interface OracleProviderStrategy<TInput = void> {
  getRate(config: OracleConfig, input: TInput): Promise<OracleRateContext>;
}
