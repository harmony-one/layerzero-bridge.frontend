import { StoreConstructor } from './core/StoreConstructor';
import { action, autorun, computed, observable, reaction } from 'mobx';
import { NETWORK_TYPE, OpenSeaValideResponse, TOKEN } from './interfaces';
import { NETWORK_ICON } from './names';
import { tokensMainnet } from '../pages/Exchange/tokens';
import { ensToTokenId } from '../utils/ens';
import Web3 from 'web3';

export class Erc20SelectStore extends StoreConstructor {
  @observable tokenAddress;
  @observable hrc1155TokenId = '0';
  @observable error = '';
  @observable isLoading = false;
  @observable erc20VerifiedInfo: OpenSeaValideResponse | null = null;

  constructor(stores) {
    super(stores);

    autorun(() => {
      if (stores.exchange.network) {
        this.tokenAddress = '';
        this.error = '';
      }
    });

    // autorun(() => {
    //   if (stores.exchange.mode && this.tokenAddress) {
    //     this.setToken(this.tokenAddress);
    //   }
    // });

    autorun(() => {
      if (stores.exchange.token) {
        this.tokenAddress = '';
        this.error = '';
      }
    });

    autorun(() => {
      if (stores.exchange.token === TOKEN.HRC20) {
        if (stores.user.hrc20Address) {
          this.tokenAddress = stores.user.hrc20Address;
        }
      } else {
        if (stores.userMetamask.erc20Address) {
          this.tokenAddress = stores.userMetamask.erc20Address;
        }
      }
    });

    reaction(
      () =>
        stores.userMetamask.isNetworkActual && stores.userMetamask.isAuthorized,
      () =>
        this.tokenAddress &&
        setTimeout(() => this.setToken(this.tokenAddress), 500),
    );

    reaction(
      () => stores.user.isMetamask && stores.user.isNetworkActual,
      () =>
        this.tokenAddress &&
        setTimeout(() => this.setToken(this.tokenAddress), 500),
    );

    reaction(
      () => !stores.user.isMetamask && stores.user.isAuthorized,
      () =>
        this.tokenAddress &&
        setTimeout(() => this.setToken(this.tokenAddress), 500),
    );
  }

  @action.bound
  resetERC20Token() {
    setTimeout(() => {
      this.tokenAddress = this.stores.erc20Select.tokensList[0].address;
    }, 500);
  }

  @action.bound
  setENSToken = async (ensName: string) => {
    const [name] = ensName.split('.');
    const tokenId = ensToTokenId(name);
    this.error = '';
    this.isLoading = true;

    try {
      const ownerAddress = await this.stores.exchange.getENSOwner(ensName);

      // @ts-ignore
      const web3 = new Web3(window.ethereum);

      const recordExist = await web3.eth.ens.recordExists(ensName);

      if (!recordExist) {
        throw new Error(`Record doesn't exist`);
      }

      if (
        ownerAddress.toLowerCase() !==
        this.stores.userMetamask.ethAddress.toLowerCase()
      ) {
        throw new Error(`You don't have access to this record`);
      }

      this.setToken('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85');

      //
      this.stores.userMetamask.erc20TokenDetails = {
        name: 'ENS',
        symbol: ensName,
        decimals: '0',
      };

      this.stores.exchange.transaction.amount = [tokenId];
    } catch (err) {
      this.isLoading = false;
      this.error = err.message;
    }
  };

  @action.bound
  setToken = async (
    value: string,
    ignoreValidations = false,
    tokenId?: string,
  ) => {
    this.tokenAddress = value;
    this.error = '';
    this.isLoading = true;

    try {
      switch (this.stores.exchange.token) {
        case TOKEN.ERC721:
          await this.stores.userMetamask.setERC721Token(value);
          break;

        case TOKEN.HRC721:
          await this.stores.user.setHRC721Mapping(value);
          break;

        case TOKEN.ERC1155:
          await this.stores.userMetamask.setERC1155Token(value);
          break;

        case TOKEN.HRC1155:
          await this.stores.user.setHRC1155Mapping(value);
          break;

        case TOKEN.ERC20:
          await this.stores.userMetamask.setToken(value, ignoreValidations);
          break;

        case TOKEN.HRC20:
          await this.stores.user.setHRC20Mapping(value, ignoreValidations);
          break;
      }
    } catch (e) {
      console.log('### setToken error', e);
      this.error = e.message;
    }

    this.isLoading = false;
  };

  @computed
  get isOk() {
    return !this.error && !this.isLoading && !!this.tokenAddress;
  }

  @computed
  get tokensList() {
    // if (
    //   this.stores.exchange.network === NETWORK_TYPE.ETHEREUM &&
    //   process.env.NETWORK !== 'testnet'
    // ) {
    //   return tokensMainnet;
    // }

    if (this.stores.exchange.token === TOKEN.HRC20) {
      return this.stores.tokens.allData
        .filter(t => !['ONE'].includes(t.symbol))
        .filter(t => t.network === this.stores.exchange.network)
        .filter(t => t.type === this.stores.exchange.token)
        .map(t => ({
          address: t.hrc20Address,
          label: `${t.name} (${t.symbol})`,
          symbol: t.symbol,
          image: NETWORK_ICON[t.network],
        }));
    }

    const { network } = this.stores.exchange;

    const filteredTokens = this.stores.tokens.allData
      .filter(t =>
        network === NETWORK_TYPE.ETHEREUM
          ? !['BUSD', 'LINK', 'ETH'].includes(t.symbol) &&
            !tokensMainnet.find(
              tm => tm.address.toLowerCase() === t.erc20Address.toLowerCase(),
            )
          : t.symbol !== 'BNB',
      )
      .filter(t => t.network === this.stores.exchange.network)
      .filter(t => t.type === this.stores.exchange.token)
      .map(t => ({
        address: t.erc20Address,
        href: '',
        label: `${t.name} (${t.symbol})`,
        symbol: t.symbol,
        image: NETWORK_ICON[t.network],
      }));

    return network === NETWORK_TYPE.ETHEREUM
      ? tokensMainnet.concat(filteredTokens)
      : filteredTokens;
  }
}
