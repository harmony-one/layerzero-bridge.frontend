import { NETWORK_TYPE, TOKEN } from "stores/interfaces";
import { tokensConfigs } from "./tokens";
import { networks } from "./networks";
import stores from "stores";
import { ITokenInfo } from "stores/interfaces";

export const numberToHex = (value: number): string => {
    return '0x' + value.toString(16);
};

export const getTokenConfig = (addr: string): ITokenInfo => {
    let token: ITokenInfo;

    if(![TOKEN.ONE, TOKEN.ETH].includes(stores.exchange.token) && !addr) {
      return null;
    }
  
    if ([TOKEN.ERC20, TOKEN.ERC721].includes(stores.exchange.token)) {
      token = tokensConfigs.find(
        t => {
          return t.erc20Address.toUpperCase() === addr.toUpperCase() ||
          t.hrc20Address.toUpperCase() === addr.toUpperCase();
        }
      );
    }
  
    if ([TOKEN.ONE, TOKEN.ETH].includes(stores.exchange.token)) {
      token = tokensConfigs.find(
        t =>
          t.type === stores.exchange.token &&
          t.network === stores.exchange.network,
      );
    }
  
    if (!token) {
      return null;
    }
  
    const config = networks[token.network]?.layerzero;
  
    return { ...token, config };
  };
  
  export const findTokenConfig = (token: {
    erc20Address: string;
    hrc20Address: string;
    network: NETWORK_TYPE;
  }) => {
    const { erc20Address, hrc20Address, network } = token;
  
    return tokensConfigs.find(
      t =>
        (t.erc20Address.toLowerCase() === erc20Address.toLowerCase() ||
          t.hrc20Address.toLowerCase() === hrc20Address.toLowerCase()) &&
        network === t.network,
    );
  };
  