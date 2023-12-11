import { networks } from '../configs';
import { NETWORK_TYPE } from './interfaces';

export const getNetworkName = (type: NETWORK_TYPE | 'ALL') => {
  return networks[type]?.name
}

export const getNetworkIcon = (type: NETWORK_TYPE | 'ALL') => {
  return networks[type]?.icon
}

export const getNetworkBaseToken = (type: NETWORK_TYPE | 'ALL') => {
  return networks[type]?.nativeCurrency.symbol
}

export const getNetworkERC20Token = (type: NETWORK_TYPE | 'ALL') => {
  return networks[type]?.erc20Token
}

export const getNetworkPrefix = (type: NETWORK_TYPE | 'ALL') => {
  return networks[type]?.prefix
}