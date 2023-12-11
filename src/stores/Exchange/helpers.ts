import { EXCHANGE_MODE, NETWORK_TYPE, TOKEN } from '../interfaces';
import * as contract from '../../blockchain-bridge';
import { getExNetworkMethods } from '../../blockchain-bridge';
import { networks } from '../../configs';

export const getContractMethods = (
  token: TOKEN,
  network: NETWORK_TYPE,
  isMetamask: boolean,
) => {
  let ethMethods, hmyMethods;

  const exNetwork = getExNetworkMethods();

  return {
    ethMethods: exNetwork.ethMethodsERC20,
    hmyMethods: contract.hmyMethodsERC20Web3
  }

  switch (token) {
    case TOKEN.BUSD:
      ethMethods = exNetwork.ethMethodsBUSD;
      hmyMethods = isMetamask
        ? contract.hmyMethodsBUSD.hmyMethodsWeb3
        : contract.hmyMethodsBUSD.hmyMethods;
      break;

    case TOKEN.LINK:
      ethMethods = exNetwork.ethMethodsLINK;
      hmyMethods = isMetamask
        ? contract.hmyMethodsLINK.hmyMethodsWeb3
        : contract.hmyMethodsLINK.hmyMethods;
      break;

    case TOKEN.ERC20:
      ethMethods = exNetwork.ethMethodsERC20;

      if (network === NETWORK_TYPE.ETHEREUM) {
        hmyMethods = isMetamask
          ? contract.hmyMethodsERC20.hmyMethodsWeb3
          : contract.hmyMethodsERC20.hmyMethods;
      } else {
        hmyMethods = isMetamask
          ? contract.hmyMethodsBEP20.hmyMethodsWeb3
          : contract.hmyMethodsBEP20.hmyMethods;
      }
      break;

    case TOKEN.HRC721:
      ethMethods = exNetwork.ethMethodsHRC721;
      hmyMethods = isMetamask
        ? contract.hmyMethodsHRC721.hmyMethodsWeb3
        : contract.hmyMethodsHRC721.hmyMethods;
      break;
    case TOKEN.HRC1155:
      ethMethods = exNetwork.ethMethodsHRC1155;
      hmyMethods = isMetamask
        ? contract.hmyMethodsHRC1155.hmyMethodsWeb3
        : contract.hmyMethodsHRC1155.hmyMethods;
      break;
    case TOKEN.ERC1155:
      ethMethods = exNetwork.ethMethodsERC1155;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC1155.hmyMethodsWeb3
        : contract.hmyMethodsERC1155.hmyMethods;
      break;
    case TOKEN.ERC721:
      ethMethods = exNetwork.ethMethodsERС721;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC721.hmyMethodsWeb3
        : contract.hmyMethodsERC721.hmyMethods;
      break;

    case TOKEN.HRC20:
      ethMethods = exNetwork.ethMethodsHRC20;
      if (network === NETWORK_TYPE.ETHEREUM) {
        hmyMethods = isMetamask
          ? contract.hmyMethodsHRC20.hmyMethodsWeb3
          : contract.hmyMethodsHRC20.hmyMethods;
      } else {
        hmyMethods = isMetamask
          ? contract.hmyMethodsBHRC20.hmyMethodsWeb3
          : contract.hmyMethodsBHRC20.hmyMethods;
      }
      break;

    case TOKEN.ETH:
      ethMethods = exNetwork.ethMethodsBUSD;
      hmyMethods = isMetamask
        ? contract.hmyMethodsERC20.hmyMethodsWeb3
        : contract.hmyMethodsERC20.hmyMethods;
      break;

    case TOKEN.ONE:
      ethMethods = exNetwork.ethMethodsHRC20;
      hmyMethods = isMetamask
        ? contract.hmyMethodsHRC20.hmyMethodsWeb3
        : contract.hmyMethodsHRC20.hmyMethods;
      break;
  }

  return { ethMethods, hmyMethods };
};

export const getChainConfig = (mode: EXCHANGE_MODE, networkType: NETWORK_TYPE) => {
  if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
    return networks.HARMONY;
  }

  if (networks[networkType]) {
    return networks[networkType]
  }

  throw new Error('Unhandled network type');
};


export const getMetamaskConfig = (mode: EXCHANGE_MODE, networkType: NETWORK_TYPE) => {
  const config = getChainConfig(mode, networkType)

  return {
    chainId: config.chainId,
    chainName: config.chainName,
    nativeCurrency: config.nativeCurrency,
    rpcUrls: config.rpcUrls,
    blockExplorerUrls: config.blockExplorerUrls
  }
};

export const isNFT = (token: TOKEN) => {
  return token === TOKEN.ERC721 || token === TOKEN.HRC721;
};

export const isMultiNFT = (token: TOKEN) => {
  return token === TOKEN.ERC1155 || token === TOKEN.HRC1155;
};

export const isNotNFT = (token: TOKEN) => {
  return !isNFT(token) && !isMultiNFT(token);
};
