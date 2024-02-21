import { action, autorun, computed, observable } from 'mobx';
import { statusFetching } from '../constants';
import detectEthereumProvider from '@metamask/detect-provider';
import { StoreConstructor } from './core/StoreConstructor';
import {
  getExNetworkMethods,
  getHmyBalance,
  hmyMethodsBEP20,
  hmyMethodsERC1155,
  hmyMethodsERC20,
  hmyMethodsERC721,
  hmyMethodsERC721Hmy,
} from '../blockchain-bridge';
import { divDecimals } from '../utils';
import { EXCHANGE_MODE, ITokenInfo, NETWORK_TYPE, TOKEN } from './interfaces';
import Web3 from 'web3';
import { getNetworkERC20Token, getNetworkName } from './names';
import { isAddressEqual } from './UserStore';
import * as services from '../services';
import { getMetamaskConfig } from './Exchange/helpers';
import { buildTokenId } from '../utils/token';
import { getTokenConfig, numberToHex } from '../configs';

const defaults = {};

export interface IERC20Token {
  name: string;
  symbol: string;
  decimals?: string;
  erc20Address?: string;
}

export class UserStoreMetamask extends StoreConstructor {
  @observable public isAuthorized: boolean;
  @observable error: string = '';

  public status: statusFetching;

  @observable public isMetaMask = false;
  private provider: any;

  @observable public balance = '0';
  @observable public ethAddress: string;
  @observable public ethBalance: string = '0';
  @observable public ethBUSDBalance: string = '0';
  @observable public ethLINKBalance: string = '0';

  @observable erc20Address: string = '';
  @observable erc20ValidAddress: string = '';
  @observable erc721Address: string = '';
  @observable erc1155Address: string = '';
  @observable erc20TokenDetails: IERC20Token;
  @observable erc20Balance: string = '';

  @observable metamaskChainId = 0;

  @observable balances: Record<string, string> = {};

  constructor(stores) {
    super(stores);

    setInterval(() => this.getBalances(), 3 * 1000);

    const session = localStorage.getItem('harmony_metamask_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj && sessionObj.ethAddress) {
      this.signIn();
    }

    if (sessionObj && sessionObj.erc20Address && sessionObj.token) {
      const path = this.stores.routing.location.pathname.split('/');

      if (path.length && sessionObj.token === path[1]) {
        switch (sessionObj.token) {
          case TOKEN.ERC20:
            this.setToken(sessionObj.erc20Address);
            break;
          case TOKEN.ONE:
            setTimeout(() => {
              this.stores.user.setHRC20Mapping(sessionObj.hrc20Address, true);
            }, 1000);
            break;
          case TOKEN.HRC20:
            setTimeout(() => {
              this.stores.user.setHRC20Mapping(sessionObj.hrc20Address);
            }, 1000);
            break;
          case TOKEN.ERC721:
            this.setERC721Token(sessionObj.erc20Address);
            break;
        }
      }
    }

    autorun(() => {
      if (this.isNetworkActual) {
        this.signIn();
      }
    });
  }

  @computed public get isNetworkActual() {
    const config = this.stores.exchange.getChainConfig();

    return numberToHex(Number(this.metamaskChainId)) === config.chainId;

    switch (process.env.NETWORK) {
      case 'testnet':
        switch (this.stores.exchange.network) {
          case NETWORK_TYPE.ETHEREUM:
            return Number(this.metamaskChainId) === 42;
          case NETWORK_TYPE.BINANCE:
            return Number(this.metamaskChainId) === 97;
        }

      case 'mainnet':
        switch (this.stores.exchange.network) {
          case NETWORK_TYPE.ETHEREUM:
            return Number(this.metamaskChainId) === 1;
          case NETWORK_TYPE.BINANCE:
            return Number(this.metamaskChainId) === 56;
        }
    }

    return false;
  }

  @action.bound
  async updateBalance() {
    const balanceHex = await this.provider.request({
      method: 'eth_getBalance',
      params: [this.ethAddress, 'latest'],
    });

    const balance = Number(balanceHex);
    this.balance = balance.toString();
  }

  @action.bound
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      return this.setError('Please connect to MetaMask');
    } else {
      this.ethAddress = accounts[0];

      try {
        this.updateBalance();
      } catch (err) {
        console.log('### err', err);
      }

      const inputName =
        this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
          ? 'ethAddress'
          : 'oneAddress';

      this.stores.exchange.transaction[inputName] = this.ethAddress;

      this.syncLocalStorage();
    }
  }

  @action.bound
  setError(error: string) {
    this.error = error;
    this.isAuthorized = false;
  }

  @action.bound
  public async signOut() {
    console.log('### metamask signout');

    this.isAuthorized = false;
    this.ethBalance = '0';
    this.ethAddress = '';
    this.ethLINKBalance = '0';
    this.ethBUSDBalance = '0';

    this.syncLocalStorage();

    // await this.provider.request({
    //   method: 'wallet_requestPermissions',
    //   params: [
    //     {
    //       eth_accounts: {},
    //     },
    //   ],
    // });
  }

  @action.bound
  public async signIn(isNew = false) {
    console.log('### metamask signin');

    try {
      this.error = '';

      const provider = await detectEthereumProvider();

      // @ts-ignore
      if (provider !== window.ethereum) {
        console.error('Do you have multiple wallets installed?');
      }

      if (!provider) {
        return this.setError('MetaMask not found');
      }

      this.provider = provider;

      this.provider.on('accountsChanged', this.handleAccountsChanged);

      this.provider.on('disconnect', params => {
        console.log('### metamask disconnect', params);

        this.isAuthorized = false;
        this.ethAddress = null;
      });

      const handleChangeNetwork = chainId => {
        this.metamaskChainId = chainId;
      };

      this.provider.on('chainIdChanged', handleChangeNetwork);
      this.provider.on('chainChanged', handleChangeNetwork);

      this.provider
        .request({ method: 'eth_requestAccounts' })
        .then(async params => {
          this.handleAccountsChanged(params);

          // @ts-ignore
          const web3 = new Web3(window.ethereum);
          this.metamaskChainId = await web3.eth.net.getId();

          if (isNew) {
            await this.provider.request({
              method: 'wallet_requestPermissions',
              params: [
                {
                  eth_accounts: {},
                },
              ],
            });
          }

          this.isAuthorized = true;
        })
        .catch(err => {
          if (err.code === 4001) {
            this.isAuthorized = false;
            this.ethAddress = null;
            this.syncLocalStorage();
            return this.setError('Please connect to MetaMask.');
          } else {
            console.error(err);
          }
        });

      this.stores.user.signInMetamask();
    } catch (e) {
      console.log('### sign in error', e);
      return this.setError(e.message);
    }
  }

  @action
  public async switchNetwork(mode: EXCHANGE_MODE, network: NETWORK_TYPE) {
    const config = getMetamaskConfig(mode, network);
    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }],
      });

      await this.tokenBalanceWatcher();
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [config],
          });
        } catch (addError) {
          console.log('### addError', addError);
        }
      } else {
        console.log('### ex', switchError);
      }
    }
  }

  public syncLocalStorage() {
    localStorage.setItem(
      'harmony_metamask_session',
      JSON.stringify({
        ethAddress: this.ethAddress,
        erc20Address: this.erc20Address,
        hrc20Address: this.stores.user.hrc20Address,
        token: this.stores.exchange.token,
      }),
    );
  }

  @action.bound public async tokenBalanceWatcher() {
    this.loadTokenListBalance();
  }

  @action.bound public async loadTokenListBalance() {
    const walletAddress = this.stores.userMetamask.ethAddress;

    const tokens = this.stores.tokens.allData.filter(item => {
      return item.network === this.stores.exchange.network;
    });

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      const tokenId = buildTokenId(token);

      this.loadTokenBalance(token, walletAddress)
        .then(balance => {
          this.updateTokenBalance(
            tokenId,
            divDecimals(balance, token.decimals),
          );
        })
        .catch(ex => {
          console.error('### loadTokenBalance', ex);
        });
    }
  }

  @action.bound
  updateTokenBalance(tokenId: string, balance) {
    this.balances[tokenId] = balance;
  }

  getTokenBalance(tokenId: string) {
    return this.balances[tokenId] || 0;
  }

  @action.bound public async loadTokenBalance(
    token: ITokenInfo,
    walletAddress,
  ) {
    if (!this.isNetworkActual) {
      return 0;
    }

    const exchangeModeDirection = this.stores.exchange.mode;
    if (exchangeModeDirection === EXCHANGE_MODE.ONE_TO_ETH) {
      if (token.token === TOKEN.ONE) {
        // native token balance = ONE
        const res = await getHmyBalance(walletAddress);

        return Number(res.result).toString();
      }

      // hrc20 balance
      return await hmyMethodsERC20.hmyMethodsWeb3.checkHmyBalance(
        token.hrc20Address,
        walletAddress,
      );
    }

    const exNetwork = getExNetworkMethods(token.network);

    if (exchangeModeDirection === EXCHANGE_MODE.ETH_TO_ONE) {
      if (token.token === TOKEN.ETH) {
        await this.updateBalance();
        return this.balance;
      }

      return await exNetwork.ethMethodsERC20.checkEthBalance(
        token.erc20Address,
        walletAddress,
      );
    }

    // const isHarmonyNetwork =
    //   this.stores.exchange.network === NETWORK_TYPE.HARMONY;
    // const isNetworkOriginForToken =
    //   this.stores.exchange.network === token.network;
    // if (!isHarmonyNetwork && !isNetworkOriginForToken) {
    //   return 0;
    // }
    //
    // try {
    //   if (token.network === NETWORK_TYPE.HARMONY) {
    //     const contractAddress = getAssetsMappingAddress(token);
    //
    //     switch (token.token) {
    //       case TOKEN.ONE:
    //         return await getHmyBalance(walletAddress);
    //       case TOKEN.ETH:
    //         return await hmyMethodsERC20.hmyMethodsWeb3.checkHmyBalance(
    //           contractAddress,
    //           walletAddress,
    //         );
    //       case TOKEN.ERC20:
    //         return await hmyMethodsERC20.hmyMethodsWeb3.checkHmyBalance(
    //           contractAddress,
    //           walletAddress,
    //         );
    //       case TOKEN.HRC20:
    //         const hrc20ContractAddress = getAssetOriginAddress(token);
    //         return await hmyMethodsHRC20.hmyMethodsWeb3.checkHmyBalance(
    //           hrc20ContractAddress,
    //           walletAddress,
    //         );
    //       case TOKEN.LINK:
    //         return await hmyMethodsLINK.hmyMethodsWeb3.checkHmyBalance(
    //           walletAddress,
    //         );
    //       case TOKEN.BUSD:
    //         return await hmyMethodsBUSD.hmyMethodsWeb3.checkHmyBalance(
    //           walletAddress,
    //         );
    //       case TOKEN.HRC721:
    //         return await hmyMethodsHRC721.hmyMethodsWeb3.checkHmyBalance(
    //           contractAddress,
    //           walletAddress,
    //         );
    //       case TOKEN.ERC721:
    //         return await hmyMethodsERC721.hmyMethodsWeb3.checkHmyBalance(
    //           contractAddress,
    //           walletAddress,
    //         );
    //       case TOKEN.HRC1155:
    //         return await hmyMethodsHRC1155.hmyMethodsWeb3.balanceOf(
    //           contractAddress,
    //           walletAddress,
    //         );
    //       case TOKEN.ERC1155:
    //         return await hmyMethodsERC1155.hmyMethodsWeb3.balanceOf(
    //           contractAddress,
    //           walletAddress,
    //         );
    //     }
    //   }
    //
    //   const exNetwork = getExNetworkMethods(token.network);
    //   const contractAddress = getAssetOriginAddress(token);
    //   switch (token.token) {
    //     case TOKEN.ONE:
    //       const extContractAddress = getAssetsMappingAddress(token);
    //       return await exNetwork.ethMethodsERC20.checkEthBalance(
    //         extContractAddress,
    //         walletAddress,
    //       );
    //     case TOKEN.ETH:
    //       return await exNetwork.getEthBalance(walletAddress);
    //     case TOKEN.ERC20:
    //       return await exNetwork.ethMethodsERC20.checkEthBalance(
    //         contractAddress,
    //         walletAddress,
    //       );
    //     case TOKEN.HRC20:
    //       let address = await exNetwork.ethMethodsHRC20.getMappingFor(
    //         contractAddress,
    //         false,
    //       );
    //
    //       return await exNetwork.ethMethodsHRC20.checkEthBalance(
    //         address,
    //         walletAddress,
    //       );
    //     case TOKEN.LINK:
    //       return await exNetwork.ethMethodsLINK.checkEthBalance(walletAddress);
    //     case TOKEN.BUSD:
    //       return await exNetwork.ethMethodsBUSD.checkEthBalance(walletAddress);
    //     case TOKEN.HRC721:
    //       return await exNetwork.ethMethodsHRC721.checkEthBalance(
    //         contractAddress,
    //         walletAddress,
    //       );
    //     case TOKEN.ERC721:
    //       return await exNetwork.ethMethodsERС721.checkEthBalance(
    //         contractAddress,
    //         walletAddress,
    //       );
    //     case TOKEN.HRC1155:
    //       return await exNetwork.ethMethodsHRC1155.checkEthBalance(
    //         contractAddress,
    //         walletAddress,
    //       );
    //     case TOKEN.ERC1155:
    //       return await exNetwork.ethMethodsERC1155.checkEthBalance(
    //         contractAddress,
    //         walletAddress,
    //       );
    //   }
    // } catch (err) {
    //   console.log('### ========');
    //   console.log(`### err ${token.token} ${token.network}`, err.message);
    //
    //   return 0;
    // }
  }

  @action.bound public getBalances = async () => {
    const exNetwork = getExNetworkMethods();

    if (this.ethAddress && this.isNetworkActual) {
      try {
        if (this.erc20Address) {
          try {
            const erc20Balance = await exNetwork.ethMethodsERC20.checkEthBalance(
              this.erc20Address,
              this.ethAddress,
            );

            this.erc20Balance = divDecimals(
              erc20Balance,
              this.erc20TokenDetails.decimals,
            );
          } catch (e) {
            console.error('getBalances erc20Address error', e);
          }
        }

        try {
          let res = 0;

          if (this.stores.exchange.network === NETWORK_TYPE.ETHEREUM) {
            res = await exNetwork.ethMethodsLINK.checkEthBalance(this.ethAddress);
            this.ethLINKBalance = divDecimals(res, 18);

            res = await exNetwork.ethMethodsBUSD.checkEthBalance(this.ethAddress);
            this.ethBUSDBalance = divDecimals(res, 18);
          }
        } catch (e) {
          console.error('getBalances LINK error', e);
        }

        this.ethBalance = await exNetwork.getEthBalance(this.ethAddress);
      } catch (e) {
        console.error('getBalances error', e);
      }
    }
  };

  @action.bound public setToken = async (
    erc20Address: string,
    ignoreValidations = false,
  ) => {
    const exNetwork = getExNetworkMethods();

    this.erc20TokenDetails = null;
    this.erc20Address = '';
    this.erc20Balance = '0';
    this.stores.user.hrc20Address = '';
    this.stores.user.hrc20Balance = '0';

    if (!erc20Address) {
      throw new Error('Address field is empty');
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
      (!this.isNetworkActual || !this.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on ${getNetworkName(this.stores.exchange.network)
        } ${process.env.NETWORK} and try again!`,
      );
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
      ((this.stores.user.isMetamask && !this.stores.user.isNetworkActual) ||
        !this.stores.user.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on Harmony ${process.env.NETWORK} and try again!`,
      );
    }

    if (!ignoreValidations) {
      if (
        this.stores.tokens.allData
          .filter(t => t.token === TOKEN.HRC20)
          .find(
            t =>
              isAddressEqual(t.erc20Address, erc20Address) ||
              isAddressEqual(t.hrc20Address, erc20Address),
          )
      ) {
        throw new Error('This address already using for HRC20 token wrapper');
      }

      if (
        '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'.toLowerCase() ===
        erc20Address.toLowerCase()
      ) {
        throw new Error('This address already using for Native tokens');
      }

      if (
        this.stores.tokens.allData
          .filter(t => t.token === TOKEN.ERC721)
          .find(t => isAddressEqual(t.erc20Address, erc20Address))
      ) {
        throw new Error('This address already using for ERC721 token');
      }
    }

    this.erc20Address = erc20Address;

    let address;

    // TODO - hardcode for USELESS
    // if (erc20Address === '0x60d66a5152612F7D550796910d022Cb2c77B09de') {
    //   address = getTokenConfig(erc20Address).hrc20Address;
    // } else {
    //   if (this.stores.exchange.network === NETWORK_TYPE.ETHEREUM) {
    //     address = await hmyMethodsERC20.hmyMethods.getMappingFor(erc20Address);
    //   } else {
    //     address = await hmyMethodsBEP20.hmyMethods.getMappingFor(erc20Address);
    //   }
    // }

    address = getTokenConfig(erc20Address).hrc20Address;

    if (this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH && !address) {
      // throw new Error('Address not mapping');
      throw new Error(
        `Wrong token address. Use only a valid ${getNetworkERC20Token(this.stores.exchange.network)
        } token address, not HRC20 address`,
      );
    }

    try {
      this.erc20TokenDetails = await exNetwork.ethMethodsERC20.tokenDetails(
        erc20Address,
      );
    } catch (e) {
      if (this.stores.exchange.mode === EXCHANGE_MODE.ETH_TO_ONE) {
        throw new Error(
          `Wrong token address. Use only a valid ${getNetworkERC20Token(this.stores.exchange.network)
          } token address, not HRC20 address`,
        );
      }
    }

    this.erc20Address = erc20Address;

    if (!!Number(address)) {
      if (!this.erc20TokenDetails) {
        try {
          this.erc20TokenDetails = {
            ...(await hmyMethodsERC20.hmyMethods.tokenDetails(address)),
            erc20Address,
          };
        } catch (e) {
          if (this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
            throw new Error(
              `Wrong token address. Use only a valid ${getNetworkERC20Token(this.stores.exchange.network)
              } token address, not HRC20 address`,
            );
          }
        }
      }

      this.stores.user.hrc20Address = address;
      this.syncLocalStorage();
    } else {
      this.stores.user.hrc20Address = '';
    }
  };

  setTokenHRC20 = async (erc20Address: string) => {
    let address;

    if (this.stores.exchange.network === NETWORK_TYPE.ETHEREUM) {
      address = await hmyMethodsERC20.hmyMethods.getMappingFor(erc20Address);
    } else {
      address = await hmyMethodsBEP20.hmyMethods.getMappingFor(erc20Address);
    }

    this.erc20Address = erc20Address;

    if (!!Number(address)) {
      if (!this.erc20TokenDetails) {
        try {
          this.erc20TokenDetails = {
            ...(await hmyMethodsERC20.hmyMethods.tokenDetails(address)),
            erc20Address,
          };
        } catch (e) {
          if (this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
            throw new Error(
              `Wrong token address. Use only a valid ${getNetworkERC20Token(this.stores.exchange.network)
              } token address, not HRC20 address`,
            );
          }
        }
      }

      this.stores.user.hrc20Address = address;
      this.syncLocalStorage();
    } else {
      this.stores.user.hrc20Address = '';
    }
  };

  @action.bound public setERC721Token = async (erc20Address: string) => {
    const exNetwork = getExNetworkMethods();

    this.erc20TokenDetails = null;
    this.erc20Address = '';
    this.erc20Balance = '0';
    this.stores.user.hrc20Address = '';
    this.stores.user.hrc20Balance = '0';

    if (!erc20Address) {
      throw new Error('Address field is empty');
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
      (!this.isNetworkActual || !this.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on ${getNetworkName(this.stores.exchange.network)
        } ${process.env.NETWORK} and try again!`,
      );
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
      ((this.stores.user.isMetamask && !this.stores.user.isNetworkActual) ||
        !this.stores.user.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on Harmony ${process.env.NETWORK} and try again!`,
      );
    }

    if (
      this.stores.tokens.allData
        .filter(t => t.token === TOKEN.HRC20)
        .find(t => t.erc20Address === erc20Address)
    ) {
      throw new Error('This address already using for HRC20 token wrapper');
    }

    if (
      this.stores.tokens.allData
        .filter(t => t.token === TOKEN.ERC20)
        .find(t => t.erc20Address === erc20Address)
    ) {
      throw new Error('This address already using for ERC20 token');
    }

    if (
      '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'.toLowerCase() ===
      erc20Address.toLowerCase()
    ) {
      throw new Error('This address already using for Native tokens');
    }

    const tokenConfig = getTokenConfig(erc20Address);

    const hrc20Address = tokenConfig.hrc20Address;

    let details;

    if (this.stores.exchange.mode === EXCHANGE_MODE.ETH_TO_ONE) {
      details = await exNetwork.ethMethodsERС721.tokenDetailsERC721(
        erc20Address,
      );
    } else {
      try {
        details = await hmyMethodsERC721Hmy.tokenDetails(hrc20Address);
      } catch (e) {
        console.error(e);
        throw new Error('Token not found');
      }
    }

    this.erc20Address = erc20Address;
    this.stores.erc20Select.erc20VerifiedInfo = await services.hasOpenSeaValid(
      erc20Address,
    );

    this.erc20TokenDetails = { ...details, decimals: '0' };

    if (!!Number(hrc20Address)) {
      this.stores.user.hrc20Address = hrc20Address;
      this.syncLocalStorage();
    } else {
      this.stores.user.hrc20Address = '';
    }
  };

  @action.bound public setERC1155Token = async (erc1155Address: string) => {
    const exNetwork = getExNetworkMethods();

    this.erc20TokenDetails = null;
    this.erc20Address = '';
    this.erc20Balance = '0';
    this.stores.user.hrc20Address = '';
    this.stores.user.hrc20Balance = '0';

    if (!erc1155Address) {
      throw new Error('Address field is empty');
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
      (!this.isNetworkActual || !this.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on ${getNetworkName(this.stores.exchange.network)
        } ${process.env.NETWORK} and try again!`,
      );
    }

    if (
      this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
      ((this.stores.user.isMetamask && !this.stores.user.isNetworkActual) ||
        !this.stores.user.isAuthorized)
    ) {
      throw new Error(
        `Your MetaMask in on the wrong network. Please switch on Harmony ${process.env.NETWORK} and try again!`,
      );
    }

    if (
      this.stores.tokens.allData
        .filter(t => t.token === TOKEN.HRC20)
        .find(t => t.erc20Address === erc1155Address)
    ) {
      throw new Error('This address already using for HRC20 token wrapper');
    }

    if (
      this.stores.tokens.allData
        .filter(t => t.token === TOKEN.ERC20)
        .find(t => t.erc20Address === erc1155Address)
    ) {
      throw new Error('This address already using for ERC20 token');
    }

    if (
      '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'.toLowerCase() ===
      erc1155Address.toLowerCase()
    ) {
      throw new Error('This address already using for Native tokens');
    }

    const details = await exNetwork.ethMethodsERC1155.tokenDetailsERC1155(
      erc1155Address,
    );
    this.erc1155Address = erc1155Address;
    this.stores.erc20Select.erc20VerifiedInfo = await services.hasOpenSeaValid(
      erc1155Address,
    );
    const tokenId = this.stores.erc20Select.hrc1155TokenId || '0';

    this.erc20TokenDetails = { ...details, decimals: '0' };
    this.stores.userMetamask.erc20Balance = Number(
      await exNetwork.ethMethodsERC1155.balanceOf(erc1155Address, tokenId),
    ).toString();

    const address = await hmyMethodsERC1155.hmyMethods.getMappingFor(
      erc1155Address,
    );

    if (!!Number(address)) {
      const hmyMethodsBase = hmyMethodsERC1155;
      const hmyMethods = this.stores.user.isMetamask
        ? hmyMethodsBase.hmyMethodsWeb3
        : hmyMethodsBase.hmyMethods;

      try {
        this.stores.user.hrc20Balance = Number(
          await hmyMethods.balanceOf(address, tokenId),
        ).toString();
      } catch (e) {
        // nop
      }
      this.stores.user.hrc1155Address = address;
      this.syncLocalStorage();
    } else {
      this.stores.user.hrc1155Address = '';
    }
  };

  @action.bound public setTokenDetails = (tokenDetails: IERC20Token) => {
    this.erc20TokenDetails = tokenDetails;
  };

  @action public reset() {
    Object.assign(this, defaults);
  }
}
