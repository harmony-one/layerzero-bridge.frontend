import { ITokenInfo, NETWORK_TYPE, TOKEN } from 'stores/interfaces';
import stores from './stores';

export const layerZeroConfig = {
  ethereum: {
    endpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
    chainId: 101,
  },
  binance: {
    endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    chainId: 102,
  },
  harmony: {
    endpoint: '0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4',
    chainId: 116,
  },
};

// 1LINK token addresses
export const tokensConfigs: ITokenInfo[] = [
  {
    proxyERC20: '0xEe381e476b4335B8584A2026f3E845edaC2c69de',
    proxyHRC20: '0x6bEe6e5cf8E02833550B228D9CC6aD19Dae3743E',
    erc20Address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    hrc20Address: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
    //
    name: 'ChainLink Token',
    symbol: 'LINK',
    decimals: '18',
    image: '/link.png',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ERC20,
    type: TOKEN.ERC20,
    network: NETWORK_TYPE.ETHEREUM,
  },
  {
    erc20Address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    hrc20Address: '0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5',
    proxyERC20: '0x4f52b41a778761bd2eea5b7b7ed8cbdaa02cef3e',
    proxyHRC20: '0xB2238ca2E9704128ee24490ee774820735b57Caa',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: '6',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ERC20,
    type: TOKEN.ERC20,
    network: NETWORK_TYPE.ETHEREUM,
    image: '/usdc.svg',
  },
  {
    hrc20Address: '0xF2732e8048f1a411C63e2df51d08f4f52E598005',
    erc20Address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    proxyERC20: '0xF6a097b278383eF0A800ABD7d700b29B159B19b5',
    proxyHRC20: '0xACF6d3052bbE774187e3364A0E76d0f586131766',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: '6',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ERC20,
    type: TOKEN.ERC20,
    network: NETWORK_TYPE.ETHEREUM,
    image: '/usdt.svg',
  },
  {
    hrc20Address: '0xd068722E4e1387E4958300D1e625d2878f784125',
    erc20Address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    proxyERC20: '0x85db5268403700e901285E8B8Fb0CADf4212B95E',
    proxyHRC20: '0xb1fDEEC683bEbA148aA9fEdcf9EEb6d44215A62e',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: '18',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ERC20,
    type: TOKEN.ERC20,
    network: NETWORK_TYPE.ETHEREUM,
    image: '/dai.svg',
  },
  {
    hrc20Address: '0xFeee03BFBAA49dc8d11DDAab8592546018dfb709',
    erc20Address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    proxyERC20: '0xAd7514b8B1EADFad8B1Ff0873Dba52E304C87446',
    proxyHRC20: '0xADc724A6d7a77d28ED2F707317444A5e10df3a7a',
    name: 'Binance USD',
    symbol: 'BUSD',
    decimals: '18',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ERC20,
    type: TOKEN.ERC20,
    network: NETWORK_TYPE.ETHEREUM,
    image: '/busd.svg',
  },
  {
    hrc20Address: '0x1Aa1F7815103c0700b98f24138581b88d4cf9769',
    erc20Address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    proxyERC20: '0x98e871aB1cC7e3073B6Cc1B661bE7cA678A33f7F',
    proxyHRC20: '0xD39574a84aBe014f41E5e4Eb77D74A370ed9AD07',
    name: 'Binance BUSD',
    symbol: 'BUSD',
    decimals: '18',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ERC20,
    type: TOKEN.ERC20,
    network: NETWORK_TYPE.BINANCE,
    image: '/busd.svg',
  },
  {
    hrc20Address: '0x0',
    erc20Address: '0x03fF0ff224f904be3118461335064bB48Df47938',
    proxyERC20: '0x2332137Ae0386783FFBCF40d9f17E50890917e15',
    proxyHRC20: '0x5B18a4E73F9A4fe337A072516b317863Ad3046aA',
    name: 'Harmony ONE',
    symbol: 'ONE',
    decimals: '18',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ONE,
    type: TOKEN.ONE,
    network: NETWORK_TYPE.BINANCE,
    image: '/one.svg',
    adapterParams:
      '0x0001000000000000000000000000000000000000000000000000000000000007a120',
  },
  {
    hrc20Address: '0x0',
    erc20Address: '0xd5cd84d6f044abe314ee7e414d37cae8773ef9d3',
    proxyERC20: '0x234784eC001Db36C9c22785CAd902221Fd831352',
    proxyHRC20: '0x905582f21fB9855c809d5b8933272a292dfbB138',
    name: 'Harmony ONE',
    symbol: 'ONE',
    decimals: '18',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ONE,
    type: TOKEN.ONE,
    network: NETWORK_TYPE.ETHEREUM,
    image: '/one.svg',
    adapterParams:
      '0x0001000000000000000000000000000000000000000000000000000000000007a120',
  },
  {
    hrc20Address: '0xDC60CcF6Ae05f898F4255EF580E731b4011100Ec',
    erc20Address: '0x0',
    proxyERC20: '0x128AEdC7f41ffb82131215e1722D8366faaD0CD4',
    proxyHRC20: '0x7FFD57563EF54c464f23B5497dd1F54481E4c008',
    name: 'Binance Coin',
    symbol: 'BNB',
    decimals: '18',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ETH,
    type: TOKEN.ETH,
    network: NETWORK_TYPE.BINANCE,
    image: '/binance.png',
    //  adapterParams: '0x0001000000000000000000000000000000000000000000000000000000000007a120'
  },
  {
    hrc20Address: '0x4cC435d7b9557d54d6EF02d69Bbf72634905Bf11',
    erc20Address: '0x0',
    proxyERC20: '0x1Edb8BdeD80E1b87eD19EE7D97Ee80B4fDb615c1',
    proxyHRC20: '0xA17426d430BCaDb09B0d42992C5BE186f485a4Da',
    name: 'Ethereum Coin',
    symbol: 'ETH',
    decimals: '18',
    totalLocked: '0',
    totalSupply: '0',
    totalLockedNormal: '0',
    totalLockedUSD: '0',
    token: TOKEN.ETH,
    type: TOKEN.ETH,
    network: NETWORK_TYPE.ETHEREUM,
    image: '/eth.svg',
    //  adapterParams: '0x0001000000000000000000000000000000000000000000000000000000000007a120'
  },
];

export const getTokenConfig = (addr: string): ITokenInfo => {
  let token: ITokenInfo;

  if (stores.exchange.token === TOKEN.ERC20) {
    token = tokensConfigs.find(
      t =>
        t.erc20Address.toUpperCase() === addr.toUpperCase() ||
        t.hrc20Address.toUpperCase() === addr.toUpperCase(),
    );
  }

  if ([TOKEN.ONE, TOKEN.ETH].includes(stores.exchange.token)) {
    token = tokensConfigs.find(
      t =>
        t.type === stores.exchange.token &&
        t.network === stores.exchange.network,
    );
  }

  const config = layerZeroConfig[token.network.toLowerCase()];

  return { ...token, config };
};
