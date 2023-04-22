import { NETWORK_TYPE } from './interfaces';

export const NETWORK_NAME: Record<NETWORK_TYPE, string> = {
  [NETWORK_TYPE.ETHEREUM]: 'Ethereum',
  [NETWORK_TYPE.BINANCE]: 'Binance',
  [NETWORK_TYPE.HARMONY]: 'Harmony',
  [NETWORK_TYPE.ARBITRUM]: 'Arbitrum',
};

export const NETWORK_ICON: Record<NETWORK_TYPE, string> = {
  [NETWORK_TYPE.ETHEREUM]: '/eth.svg',
  [NETWORK_TYPE.BINANCE]: '/binance.png',
  [NETWORK_TYPE.HARMONY]: '/one.png',
  [NETWORK_TYPE.ARBITRUM]: '/arbitrum.png',
};

export const NETWORK_BASE_TOKEN: Record<NETWORK_TYPE, string> = {
  [NETWORK_TYPE.ETHEREUM]: 'ETH',
  [NETWORK_TYPE.ARBITRUM]: 'ETH',
  [NETWORK_TYPE.BINANCE]: 'BNB',
  [NETWORK_TYPE.HARMONY]: 'ONE',
};

export const NETWORK_ERC20_TOKEN: Record<NETWORK_TYPE, string> = {
  [NETWORK_TYPE.ETHEREUM]: 'ERC20',
  [NETWORK_TYPE.ARBITRUM]: 'ERC20',
  [NETWORK_TYPE.BINANCE]: 'BEP20',
  [NETWORK_TYPE.HARMONY]: 'HRC20',
};

export const NETWORK_PREFIX: Record<NETWORK_TYPE, string> = {
  [NETWORK_TYPE.ETHEREUM]: '1',
  [NETWORK_TYPE.BINANCE]: 'bsc',
  [NETWORK_TYPE.HARMONY]: '1',
  [NETWORK_TYPE.ARBITRUM]: 'arb',
};
