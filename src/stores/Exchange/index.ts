import { StoreConstructor } from '../core/StoreConstructor';
import { action, autorun, computed, observable } from 'mobx';
import { statusFetching } from '../../constants';
import {
  ACTION_TYPE,
  EXCHANGE_MODE,
  IOperation,
  NETWORK_TYPE,
  STATUS,
  TConfig,
  TFullConfig,
  TOKEN,
} from '../interfaces';
import * as operationService from 'services';
import { threshold, validators } from 'services';

import * as contract from '../../blockchain-bridge';
import {
  getExNetworkMethods,
  hmyMethodsERC20Web3,
  initNetworks,
} from '../../blockchain-bridge';
import { divDecimals, mulDecimals, sleep, uuid } from '../../utils';
import { sendHrc20Token } from './hrc20';
import { sendErc721Token } from './erc721';
import { getAddress } from '@harmony-js/crypto';
import { send1ETHToken } from './1ETH';
import { send1ONEToken } from './1ONE';
import { getChainConfig, getContractMethods, isNFT } from './helpers';
import { defaultEthClient } from './defaultConfig';
import { getNetworkBaseToken, getNetworkIcon, getNetworkName } from '../names';
import { sendHrc721Token } from './hrc721';
import { sendHrc1155Token } from './hrc1155';
import { sendErc1155Token } from './erc1155';
import * as services from '../../services';
import { MetamaskWarning } from '../../components/MetamaskWarning';
import { ValidatorsCountWarning } from '../../components/ValidatorsCountWarning';
import { ConfirmTokenBridge } from '../../components/ConfirmTokenBridge';
import { EthBridgeStore } from '../../pages/EthBridge/EthBridgeStore';
import { getTokenConfig, tokensConfigs } from '../../configs';
import { ITokenInfo } from '../../interfaces';

export enum EXCHANGE_STEPS {
  GET_TOKEN_ADDRESS = 'GET_TOKEN_ADDRESS',
  BASE = 'BASE',
  APPROVE = 'APPROVE',
  CONFIRMATION = 'CONFIRMATION',
  SENDING = 'SENDING',
  RESULT = 'RESULT',
}

export interface IStepConfig {
  id: EXCHANGE_STEPS;
  buttons: Array<{
    title: string;
    onClick: () => void;
    validate?: boolean;
    transparent?: boolean;
  }>;
  title?: string;
}

export interface ITransaction {
  oneAddress: string;
  ethAddress: string;
  amount: string | string[];
  approveAmount: string;
  erc20Address?: string;
  hrc20Address?: string;
  hrc721Address?: string;
  hrc1155Address?: string;
  hrc1155TokenId?: string;
  erc1155Address?: string;
  erc1155TokenId?: string;
  nftName?: string;
  nftImageUrl?: string;
  ensName?: string;
}

export class Exchange extends StoreConstructor {
  @observable error = '';
  @observable txHash = '';
  @observable actionStatus: statusFetching = 'init';
  @observable stepNumber = 0;
  @observable isFeeLoading = false;
  @observable isDepositAmountLoading = false;
  @observable depositAmount = 0;

  @observable network: NETWORK_TYPE = NETWORK_TYPE.ETHEREUM;

  defaultTransaction: ITransaction = {
    oneAddress: '',
    ethAddress: '',
    amount: '',
    approveAmount: '0',
    erc20Address: '',
    hrc20Address: '',
    hrc721Address: '',
    nftName: '',
    nftImageUrl: '',
    ensName: '',
  };

  @observable transaction = this.defaultTransaction;
  @observable mode: EXCHANGE_MODE = EXCHANGE_MODE.ETH_TO_ONE;
  @observable token: TOKEN;

  constructor(stores) {
    super(stores);

    setInterval(async () => {
      if (this.operation) {
        const operation = await operationService.getOperation(
          this.operation.id,
        );

        if (this.operation && this.operation.id === operation.id) {
          this.operation = operation;
          this.setStatus();
        }
      }
    }, 3000);

    autorun(() => {
      const { user, userMetamask } = this.stores;

      if (
        this.operation &&
        this.operation.erc20Address &&
        !this.stores.userMetamask.erc20Address &&
        this.network
      ) {
        if (userMetamask.isAuthorized && userMetamask.isNetworkActual) {
          this.stores.userMetamask.setToken(this.operation.erc20Address);
        } else if (user.isAuthorized && user.isNetworkActual) {
          this.stores.userMetamask.setTokenHRC20(this.operation.erc20Address);
        }
      }
    });

    window.onbeforeunload = (evt): void | string => {
      const isOperationInProgress =
        this.operation && this.operation.status === STATUS.IN_PROGRESS;

      const isUserOwnerEth =
        this.operation.type === EXCHANGE_MODE.ETH_TO_ONE &&
        this.operation.ethAddress === this.stores.userMetamask.ethAddress;

      const isUserOwnerHmy =
        this.operation.type === EXCHANGE_MODE.ONE_TO_ETH &&
        this.operation.oneAddress === this.stores.user.address;

      if (isOperationInProgress && (isUserOwnerEth || isUserOwnerHmy)) {
        evt.preventDefault();

        const dialogText =
          'Operation is in progress! Reloading the page can lead to desynchronization with the wallet.';

        evt.returnValue = dialogText;

        return dialogText;
      }
    };
  }

  @computed
  get step() {
    return this.stepsConfig[this.stepNumber];
  }

  @observable ethNetworkFee = 0;

  @computed
  get networkFee() {
    return this.mode === EXCHANGE_MODE.ETH_TO_ONE
      ? this.ethNetworkFee
      : this.depositAmount + 0.0134438;
  }

  stepsConfig: Array<IStepConfig> = [
    {
      id: EXCHANGE_STEPS.BASE,
      buttons: [
        {
          title: 'Continue',
          onClick: async () => {
            if (
              this.mode === EXCHANGE_MODE.ETH_TO_ONE &&
              (!this.stores.userMetamask.isNetworkActual ||
                !this.stores.userMetamask.isAuthorized)
            ) {
              throw new Error(
                `Your MetaMask in on the wrong network. Please switch on ${getNetworkName(this.stores.exchange.network)
                } ${process.env.NETWORK} and try again!`,
              );
            }

            if (
              this.stores.exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
              ((this.stores.user.isMetamask &&
                !this.stores.user.isNetworkActual) ||
                !this.stores.user.isAuthorized)
            ) {
              throw new Error(
                `Your MetaMask in on the wrong network. Please switch on Harmony ${process.env.NETWORK} and try again!`,
              );
            }

            // this.transaction.oneAddress = this.stores.user.address;

            this.transaction.erc20Address = this.stores.userMetamask.erc20Address;

            if (this.stores.user.hrc20Address) {
              this.transaction.hrc20Address = getAddress(
                this.stores.user.hrc20Address,
              ).checksum;
            }

            if (this.token === TOKEN.HRC721 && this.stores.user.hrc721Address) {
              this.transaction.hrc721Address = getAddress(
                this.stores.user.hrc721Address,
              ).checksum;
            } else if (this.token === TOKEN.HRC721) {
              alert('please click `Change token` button first!');
              return;
            }

            if (
              this.token === TOKEN.HRC1155 &&
              this.stores.user.hrc1155Address
            ) {
              this.transaction.hrc1155Address = getAddress(
                this.stores.user.hrc1155Address,
              ).checksum;
            } else if (this.token === TOKEN.HRC1155) {
              alert('please click `Change token` button first!');
              return;
            }

            if (
              this.token === TOKEN.ERC1155 &&
              this.stores.userMetamask.erc1155Address
            ) {
              this.transaction.erc1155Address = getAddress(
                this.stores.userMetamask.erc1155Address,
              ).checksum;
              this.transaction.erc1155TokenId = this.stores.erc20Select.hrc1155TokenId;
            } else if (this.token === TOKEN.ERC1155) {
              alert('please click `Change token` button first!');
              return;
            }

            // get NFT metadata
            if (this.token === TOKEN.ERC721 || this.token === TOKEN.ERC1155) {
              let nftAddress, nftTokenId;
              switch (this.token) {
                case TOKEN.ERC721:
                  nftAddress = this.transaction.erc20Address;
                  nftTokenId = this.transaction.amount[0];
                  break;
                case TOKEN.ERC1155:
                  nftAddress = this.transaction.erc1155Address;
                  nftTokenId = this.transaction.erc1155TokenId;
                  break;
              }

              const OpenSeaRes = await services.getOpenSeaSingleAsset(
                nftAddress,
                nftTokenId,
              );

              if (OpenSeaRes) {
                if (OpenSeaRes.name) {
                  this.transaction.nftName = OpenSeaRes.name;
                } else {
                  this.transaction.nftName =
                    OpenSeaRes.collection.name + ' #' + nftTokenId;
                }
                this.transaction.nftImageUrl = OpenSeaRes.image_preview_url;
              }
            }

            switch (this.mode) {
              case EXCHANGE_MODE.ETH_TO_ONE:
                this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
                break;
              case EXCHANGE_MODE.ONE_TO_ETH:
                this.transaction.oneAddress = this.stores.user.address;
                break;
            }

            this.transaction.approveAmount = '0';

            if (
              this.token === TOKEN.ERC721 ||
              this.token === TOKEN.HRC721 ||
              this.token === TOKEN.HRC1155 ||
              this.token === TOKEN.ERC1155 ||
              (this.token === TOKEN.ONE &&
                this.mode === EXCHANGE_MODE.ONE_TO_ETH) ||
              (this.token === TOKEN.ETH &&
                this.mode === EXCHANGE_MODE.ETH_TO_ONE)
            ) {
              this.stepNumber = this.stepNumber + 2;
            } else {
              await this.getAllowance();

              if (
                Number(this.allowance) / 1e18 >=
                Number(this.transaction.amount)
              ) {
                this.stepNumber = this.stepNumber + 2;
              } else {
                this.transaction.approveAmount = String(
                  this.transaction.amount,
                );
                this.stepNumber = this.stepNumber + 1;
              }
            }

            const exNetwork = getExNetworkMethods();

            switch (this.mode) {
              case EXCHANGE_MODE.ETH_TO_ONE:
                this.isFeeLoading = true;
                this.ethNetworkFee = await exNetwork.getNetworkFee();
                this.isFeeLoading = false;
                break;
              case EXCHANGE_MODE.ONE_TO_ETH:
                this.isFeeLoading = true;
                let otherOptions: Record<string, string> = {};
                if (
                  this.token === TOKEN.HRC721 &&
                  this.stores.user.hrc721Address
                ) {
                  const hasMapper = Number(
                    await exNetwork.ethMethodsHRC721.getMappingFor(
                      this.stores.user.hrc721Address,
                    ),
                  );
                  otherOptions = {
                    gas: hasMapper ? '0' : '2500000',
                  };
                }
                if (
                  this.token === TOKEN.HRC1155 &&
                  this.stores.user.hrc1155Address
                ) {
                  const hasMapper = Number(
                    await exNetwork.ethMethodsHRC1155.getMappingFor(
                      this.stores.user.hrc1155Address,
                    ),
                  );
                  otherOptions = {
                    gas: hasMapper ? '0' : '3000000',
                  };
                }
                // this.depositAmount = await getDepositAmount(
                //   this.network,
                //   otherOptions,
                // );

                this.depositAmount = Number(
                  (
                    Number(
                      await hmyMethodsERC20Web3.getFee(
                        this.stores.userMetamask.erc20Address,
                        this.stores.userMetamask.ethAddress,
                        this.transaction.amount,
                        this.stores.userMetamask.erc20TokenDetails.decimals,
                      ),
                    ) / 1e18
                  ).toFixed(0),
                );

                this.isFeeLoading = false;
                break;
            }
          },
          validate: true,
        },
      ],
    },
    {
      id: EXCHANGE_STEPS.APPROVE,
      buttons: [
        {
          title: 'Back',
          onClick: () => (this.stepNumber = this.stepNumber - 1),
          transparent: true,
        },
        {
          title: 'Continue',
          onClick: () => {
            this.stepNumber = this.stepNumber + 1;
          },
          validate: true,
        },
      ],
    },
    {
      id: EXCHANGE_STEPS.CONFIRMATION,
      buttons: [
        {
          title: 'Back',
          onClick: () => {
            if (Number(this.transaction.approveAmount) > 0) {
              this.stepNumber = this.stepNumber - 1;
            } else {
              this.stepNumber = 0;
            }
          },
          transparent: true,
        },
        {
          title: 'Confirm',
          onClick: () => {
            this.stepNumber = this.stepNumber + 1;
            this.sendOperation();
          },
        },
      ],
    },
    {
      id: EXCHANGE_STEPS.SENDING,
      buttons: [],
    },
    {
      id: EXCHANGE_STEPS.RESULT,
      buttons: [
        {
          title: 'Close',
          transparent: true,
          onClick: () => {
            this.setMode(this.mode);
            this.stepNumber = 0;
          },
        },
      ],
    },
  ];

  @action.bound
  setDestinationAddressByMode(address: string) {
    if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
      this.transaction.oneAddress = address;
    }

    if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      this.transaction.ethAddress = address;
    }
  }

  @action.bound
  setAddressByMode() {
    if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
      // this.transaction.oneAddress = this.stores.user.address;
      this.transaction.oneAddress = '';
      this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
    }

    if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      // this.transaction.ethAddress = this.stores.userMetamask.ethAddress;
      this.transaction.ethAddress = '';
      this.transaction.oneAddress = this.stores.user.address;
    }
  }

  @action.bound
  setMode(mode: EXCHANGE_MODE) {
    if (
      this.operation &&
      [STATUS.IN_PROGRESS, STATUS.WAITING].includes(this.operation.status)
    ) {
      return;
    }

    this.clear();
    this.mode = mode;
    this.setAddressByMode();
  }

  @action.bound
  setNetwork(network: NETWORK_TYPE) {
    if (
      this.operation &&
      [STATUS.IN_PROGRESS, STATUS.WAITING].includes(this.operation.status)
    ) {
      return;
    }

    this.clear();
    this.network = network;

    this.stores.userMetamask.erc20TokenDetails = null;
    this.stores.userMetamask.erc20Address = '';
    this.stores.userMetamask.ethBalance = '0';
    this.stores.userMetamask.erc20Balance = '0';
    this.stores.userMetamask.ethBUSDBalance = '0';
    this.stores.userMetamask.ethLINKBalance = '0';

    this.stores.user.hrc20Address = '';
    this.stores.user.balance = '0';
    this.stores.user.hrc20Balance = '0';
    this.stores.user.hrc20Balance = '0';
    this.stores.user.hmyBUSDBalance = '0';
    this.stores.user.hmyLINKBalance = '0';
    // this.setAddressByMode();

    console.log('### this.token', this.token);
    // if (!this.config.tokens.includes(this.token)) {
    this.setToken(this.config.tokens[0]);
    // } else {
    //   this.setToken(this.token);
    /// }

    this.setMode(this.mode);
  }

  @action.bound
  setToken(token: TOKEN) {
    // this.clear();
    console.log('### setToken', token);

    this.token = token;
    // this.setAddressByMode();

    if (token === TOKEN.ETH) {
      const token = getTokenConfig('');
      this.stores.user.setHRC20Token(token.hrc20Address);
      this.stores.userMetamask.erc20Address = '';

      this.stores.userMetamask.setTokenDetails({
        name: getNetworkBaseToken(this.network),
        decimals: '18',
        erc20Address: '',
        symbol: getNetworkBaseToken(this.network),
      });
    }

    if (token === TOKEN.ONE) {
      this.stores.user.setHRC20Mapping(process.env.ONE_HRC20, true);
    }
  }

  @observable operation: IOperation;

  @action.bound
  setStatus() {
    switch (this.operation.status) {
      case STATUS.ERROR:
        this.actionStatus = 'error';
        this.stepNumber = this.stepsConfig.length - 1;
        break;

      case STATUS.SUCCESS:
        this.actionStatus = 'success';
        this.stepNumber = this.stepsConfig.length - 1;
        break;

      case STATUS.WAITING:
      case STATUS.IN_PROGRESS:
        this.stepNumber = 3;
        this.actionStatus = 'fetching';
        break;
    }
  }

  @action.bound
  async setOperationId(operationId: string) {
    this.operation = await operationService.getOperation(operationId);

    this.mode = this.operation.type;
    this.token = this.operation.token;
    this.network = this.operation.network;
    this.transaction.amount = Array.isArray(this.operation.amount)
      ? this.operation.amount
      : String(this.operation.amount);
    this.transaction.ethAddress = this.operation.ethAddress;
    this.transaction.oneAddress = this.operation.oneAddress;
    this.transaction.erc20Address = this.operation.erc20Address;
    this.transaction.hrc721Address = this.operation.hrc721Address;
    this.transaction.hrc1155Address = this.operation.hrc1155Address;
    this.transaction.hrc1155TokenId = this.operation.hrc1155TokenId;
    this.transaction.erc1155Address = this.operation.erc1155Address;
    this.transaction.erc1155TokenId = this.operation.erc1155TokenId;

    this.setStatus();
  }

  @action.bound
  async createOperation() {
    this.operation = await operationService.createOperation({
      ...this.transaction,
      type: this.mode,
      token: this.token,
      network: this.network,
      id: uuid(),
    });

    return this.operation.id;
  }

  getActionByType = (type: ACTION_TYPE) =>
    this.operation.actions.find(a => a.type === type);

  @action.bound
  async sendOperation(id: string = '') {
    try {
      this.actionStatus = 'fetching';

      let operationId = id;

      if (!operationId) {
        operationId = await this.createOperation();

        this.stores.routing.push(
          this.token + '/operations/' + this.operation.id,
        );
      }

      // if (!operationId) {
      //   const bridgeSDK = new BridgeSDK({ logLevel: 2 }); // 2 - full logs, 1 - only success & errors, 0 - logs off
      //
      //   await bridgeSDK.init(configs.testnet);
      //
      //   await bridgeSDK.setUseOneWallet(true);
      //   await bridgeSDK.setUseMetamask(true);
      //
      //   await bridgeSDK.sendToken(
      //     {
      //       ...this.transaction,
      //       amount: Number(this.transaction.amount),
      //       type: this.mode,
      //       token: this.token,
      //     },
      //     id => this.setOperationId(id),
      //   );
      //
      //   return;
      // }

      await this.setOperationId(operationId);

      if (
        this.operation.status === STATUS.SUCCESS ||
        this.operation.status === STATUS.ERROR
      ) {
        return;
      }

      const confirmCallback = async (
        transactionHash,
        actionType: ACTION_TYPE,
      ) => {
        this.operation = await operationService.confirmAction({
          operationId,
          transactionHash,
          actionType,
        });
      };

      if (!this.stores.user.address || !this.stores.userMetamask.ethAddress) {
        await sleep(3000);
      }

      if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
        if (this.operation.ethAddress !== this.stores.userMetamask.ethAddress) {
          return;
        }
      }

      if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
        if (this.operation.oneAddress !== this.stores.user.address) {
          return;
        }
      }

      // if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      //   const hmyMethods = this.stores.user.isMetamask
      //     ? contract.hmyMethodsDeposit.hmyMethodsWeb3
      //     : contract.hmyMethodsDeposit.hmyMethods;
      //
      //   let depositOne = this.getActionByType(ACTION_TYPE.depositOne);
      //
      //   if (!depositOne) {
      //     throw new Error('Action not found: depositOne');
      //   }
      //
      //   if (depositOne && depositOne.status === STATUS.WAITING) {
      //     await hmyMethods.deposit(depositOne.depositAmount, hash =>
      //       confirmCallback(hash, depositOne.type),
      //     );
      //   }
      //
      //   while (
      //     [STATUS.WAITING, STATUS.IN_PROGRESS].includes(depositOne.status)
      //   ) {
      //     depositOne = this.getActionByType(ACTION_TYPE.depositOne);
      //
      //     await sleep(500);
      //   }
      //
      //   if (depositOne.status !== STATUS.SUCCESS) {
      //     return;
      //   }
      // }

      let ethMethods, hmyMethods;
      const exNetwork = getExNetworkMethods();

      switch (this.token) {
        case TOKEN.ERC20:
          ethMethods = exNetwork.ethMethodsERC20;

          if (this.network === NETWORK_TYPE.ETHEREUM) {
            hmyMethods = this.stores.user.isMetamask
              ? contract.hmyMethodsERC20.hmyMethodsWeb3
              : contract.hmyMethodsERC20.hmyMethods;
          } else {
            hmyMethods = this.stores.user.isMetamask
              ? contract.hmyMethodsBEP20.hmyMethodsWeb3
              : contract.hmyMethodsBEP20.hmyMethods;
          }
          break;

        case TOKEN.ONE:
          await send1ONEToken({
            transaction: this.transaction,
            mode: this.mode,
            stores: this.stores,
            getActionByType: this.getActionByType,
            confirmCallback: confirmCallback,
          });
          return;

        case TOKEN.ETH:
          await send1ETHToken({
            transaction: this.transaction,
            mode: this.mode,
            stores: this.stores,
            getActionByType: this.getActionByType,
            confirmCallback: confirmCallback,
          });
          return;

        case TOKEN.ERC721:
          await sendErc721Token({
            transaction: this.transaction,
            mode: this.mode,
            stores: this.stores,
            getActionByType: this.getActionByType,
            confirmCallback: confirmCallback,
          });
          return;

        case TOKEN.HRC721:
          await sendHrc721Token({
            transaction: this.transaction,
            mode: this.mode,
            stores: this.stores,
            getActionByType: this.getActionByType,
            confirmCallback: confirmCallback,
          });
          return;

        case TOKEN.HRC1155:
          await sendHrc1155Token({
            transaction: this.transaction,
            mode: this.mode,
            stores: this.stores,
            getActionByType: this.getActionByType,
            confirmCallback: confirmCallback,
          });
          return;

        case TOKEN.ERC1155:
          await sendErc1155Token({
            transaction: this.transaction,
            mode: this.mode,
            stores: this.stores,
            getActionByType: this.getActionByType,
            confirmCallback: confirmCallback,
          });
          return;

        case TOKEN.HRC20:
          await sendHrc20Token({
            transaction: this.transaction,
            mode: this.mode,
            stores: this.stores,
            getActionByType: this.getActionByType,
            confirmCallback: confirmCallback,
          });
          return;
      }

      // sendErc20token
      if (this.token === TOKEN.ERC20) {
        let getHRC20Action = this.getActionByType(ACTION_TYPE.getHRC20Address);

        while (
          getHRC20Action &&
          [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)
        ) {
          await sleep(3000);
          getHRC20Action = this.getActionByType(ACTION_TYPE.getHRC20Address);
        }

        if (!this.stores.user.hrc20Address) {
          await this.stores.userMetamask.setToken(
            this.transaction.erc20Address,
          );
        }

        if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
          let approveEthManger = this.getActionByType(
            ACTION_TYPE.approveEthManger,
          );

          if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
            const { approveAmount, erc20Address } = this.transaction;

            ethMethods.approveEthManger(
              erc20Address,
              approveAmount,
              this.stores.userMetamask.erc20TokenDetails.decimals,
              hash => confirmCallback(hash, approveEthManger.type),
            );
          }

          while (
            [STATUS.WAITING, STATUS.IN_PROGRESS].includes(
              approveEthManger.status,
            )
          ) {
            approveEthManger = this.getActionByType(
              ACTION_TYPE.approveEthManger,
            );

            await sleep(500);
          }

          if (approveEthManger.status !== STATUS.SUCCESS) {
            return;
          }

          const lockToken = this.getActionByType(ACTION_TYPE.lockToken);

          if (lockToken.status === STATUS.WAITING) {
            await ethMethods.lockToken(
              this.transaction.erc20Address,
              this.transaction.oneAddress,
              this.transaction.amount,
              this.stores.userMetamask.erc20TokenDetails.decimals,
              hash => confirmCallback(hash, lockToken.type),
            );
          }

          return;
        }

        if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
          const hrc20Address = this.stores.user.hrc20Address;

          let approveHmyManger = this.getActionByType(
            ACTION_TYPE.approveHmyManger,
          );

          if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
            await hmyMethods.approveHmyManger(
              hrc20Address,
              this.transaction.approveAmount,
              this.stores.userMetamask.erc20TokenDetails.decimals,
              hash => confirmCallback(hash, approveHmyManger.type),
            );
          }

          while (
            [STATUS.WAITING, STATUS.IN_PROGRESS].includes(
              approveHmyManger.status,
            )
          ) {
            approveHmyManger = this.getActionByType(
              ACTION_TYPE.approveHmyManger,
            );

            await sleep(500);
          }

          if (approveHmyManger.status !== STATUS.SUCCESS) {
            return;
          }

          const burnToken = this.getActionByType(ACTION_TYPE.burnToken);

          if (burnToken && burnToken.status === STATUS.WAITING) {
            await hmyMethods.burnToken(
              hrc20Address,
              this.transaction.ethAddress,
              this.transaction.amount,
              this.stores.userMetamask.erc20TokenDetails.decimals,
              hash => confirmCallback(hash, burnToken.type),
            );
          }

          return;
        }
      } else {
        if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
          let approveEthManger = this.getActionByType(
            ACTION_TYPE.approveEthManger,
          );

          if (approveEthManger && approveEthManger.status === STATUS.WAITING) {
            ethMethods.approveEthManger(this.transaction.approveAmount, hash =>
              confirmCallback(hash, approveEthManger.type),
            );
          }

          while (
            [STATUS.WAITING, STATUS.IN_PROGRESS].includes(
              approveEthManger.status,
            )
          ) {
            approveEthManger = this.getActionByType(
              ACTION_TYPE.approveEthManger,
            );

            await sleep(500);
          }

          if (approveEthManger.status !== STATUS.SUCCESS) {
            return;
          }

          const lockToken = this.getActionByType(ACTION_TYPE.lockToken);

          if (lockToken && lockToken.status === STATUS.WAITING) {
            await ethMethods.lockToken(
              this.transaction.oneAddress,
              this.transaction.amount,
              hash => confirmCallback(hash, lockToken.type),
            );
          }

          return;
        }

        if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
          let approveHmyManger = this.getActionByType(
            ACTION_TYPE.approveHmyManger,
          );

          if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
            await hmyMethods.approveHmyManger(
              this.transaction.approveAmount,
              hash => confirmCallback(hash, approveHmyManger.type),
            );
          }

          while (
            [STATUS.WAITING, STATUS.IN_PROGRESS].includes(
              approveHmyManger.status,
            )
          ) {
            approveHmyManger = this.getActionByType(
              ACTION_TYPE.approveHmyManger,
            );

            await sleep(500);
          }

          if (approveHmyManger.status !== STATUS.SUCCESS) {
            return;
          }

          const burnToken = this.getActionByType(ACTION_TYPE.burnToken);

          if (burnToken && burnToken.status === STATUS.WAITING) {
            await hmyMethods.burnToken(
              this.transaction.ethAddress,
              this.transaction.amount,
              hash => confirmCallback(hash, burnToken.type),
            );
          }

          return;
        }
      }

      return;
    } catch (e) {
      if (e.status && e.response.body) {
        this.error = e.response.body.message;
      } else {
        this.error = e.message || e;
      }

      this.actionStatus = 'error';
      this.operation = null;
    }

    this.stepNumber = this.stepsConfig.length - 1;
  }

  @observable allowance = '0';
  @observable allowanceStatus: statusFetching = 'init';
  @observable allowanceError = '';

  @computed get needToApprove() {
    const decimals = this.stores.userMetamask.erc20TokenDetails.decimals;

    return (
      mulDecimals(Number(this.transaction.amount), decimals).cmp(
        Number(this.allowance),
      ) > 0
    );
  }

  @action.bound
  clearAllowance = () => {
    this.allowance = '0';
    this.allowanceStatus = 'fetching';
    this.allowanceError = '';
  };

  @action.bound
  getAllowance = async () => {
    this.allowance = '0';
    this.transaction.approveAmount = '0';
    this.allowanceStatus = 'fetching';
    this.allowanceError = '';

    const { ethMethods, hmyMethods } = getContractMethods(
      this.token,
      this.network,
      this.stores.user.isMetamask,
    );

    try {
      if (this.mode === EXCHANGE_MODE.ONE_TO_ETH) {
        console.log(this.transaction.oneAddress, this.transaction.hrc20Address);

        this.allowance = await hmyMethods.allowance(
          this.transaction.oneAddress,
          this.transaction.hrc20Address,
        );
      }

      if (this.mode === EXCHANGE_MODE.ETH_TO_ONE) {
        console.log(this.transaction.ethAddress, this.transaction.erc20Address);

        this.allowance = await ethMethods.allowance(
          this.transaction.ethAddress,
          this.transaction.erc20Address,
        );
      }
    } catch (e) {
      this.allowanceError = e.message;
    }

    this.allowanceStatus = 'success';
  };

  clear() {
    this.transaction = {
      ...this.defaultTransaction,
      amount: this.transaction.amount,
    };
    this.operation = null;
    this.error = '';
    this.txHash = '';
    this.actionStatus = 'init';
    this.stepNumber = 0;
    this.stores.routing.push(`/${this.token}`);
  }

  @observable fullConfig: TFullConfig;

  @action.bound
  getConfig = async () => {
    this.fullConfig = await operationService.getConfig();
    initNetworks(this.fullConfig);
    this.setToken(this.token);
  };

  @computed
  get config(): TConfig {
    if (!this.fullConfig) {
      return defaultEthClient;
    }

    return this.fullConfig[this.network] || this.fullConfig[NETWORK_TYPE.ETHEREUM]
  }

  getExplorerByNetwork(network: NETWORK_TYPE) {
    if (!this.fullConfig) {
      return defaultEthClient.explorerURL;
    }

    return this.fullConfig[network]?.explorerURL;
  }

  @action.bound
  onClickHandler = async (
    needValidate: boolean,
    callback: () => void,
    ethBridgeStore: EthBridgeStore,
  ) => {
    const { actionModals, user, userMetamask, exchange } = this.stores;
    exchange.error = '';

    if (validators.length < threshold) {
      return actionModals.open(ValidatorsCountWarning, {
        title: '',
        applyText: 'Got it',
        closeText: '',
        noValidation: true,
        width: '500px',
        showOther: true,
        onApply: () => {
          return Promise.resolve();
        },
      });
    }

    // if (
    //   exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
    //   exchange.network === NETWORK_TYPE.BINANCE
    // ) {
    //   return actionModals.open(
    //     () => (
    //       <Box pad="large">
    //         <Text>
    //           <b>Harmony Bridge is temporarily suspended.</b>
    //           <br />
    //           <br />
    //           We are currently facing RPC issue on the Harmony side which we are
    //           actively working to resolve.
    //           <br />
    //           Meanwhile, we have disabled bridging temporarily.
    //           <br />
    //           <br />
    //           Sorry for the inconvenience. We will update soon.
    //         </Text>
    //       </Box>
    //     ),
    //     {
    //       title: '',
    //       applyText: 'Got it',
    //       closeText: '',
    //       noValidation: true,
    //       width: '500px',
    //       showOther: true,
    //       onApply: () => {
    //         return Promise.resolve();
    //       },
    //     },
    //   );
    // }

    // if (!user.isAuthorized) {
    //   debugger;
    //   if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
    //     if (!user.isOneWallet) {
    //       return actionModals.open(AuthWarning, {
    //         title: '',
    //         applyText: 'Got it',
    //         closeText: '',
    //         noValidation: true,
    //         width: '500px',
    //         showOther: true,
    //         onApply: () => {
    //           return Promise.resolve();
    //         },
    //       });
    //     } else {
    //       await user.signIn();
    //     }
    //   }
    // }

    if (
      !userMetamask.isAuthorized &&
      exchange.mode === EXCHANGE_MODE.ETH_TO_ONE
    ) {
      if (!userMetamask.isAuthorized) {
        await userMetamask.signIn(true);
      }
    }

    if (
      exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
      user.isMetamask &&
      !user.isNetworkActual
    ) {
      return actionModals.open(MetamaskWarning, {
        title: '',
        applyText: 'Got it',
        closeText: '',
        noValidation: true,
        width: '500px',
        showOther: true,
        onApply: () => {
          return Promise.resolve();
        },
      });
    }

    if ([TOKEN.ERC721].includes(exchange.token) && !userMetamask.erc20Address) {
      exchange.error = 'No token selected ';
      throw new Error('No token selected ');
    }

    if (needValidate) {
      if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
        const methods = getExNetworkMethods();

        if (!methods.web3.utils.isAddress(exchange.transaction.ethAddress)) {
          ethBridgeStore.addressValidationError = 'Invalid wallet Hex address';
          return;
        }
      }

      if (
        this.stores.tokens.allData.some(
          t =>
            t.erc20Address.toLowerCase() ===
            exchange.transaction.ethAddress.toLowerCase() ||
            t.hrc20Address.toLowerCase() ===
            exchange.transaction.ethAddress.toLowerCase() ||
            t.erc20Address.toLowerCase() ===
            exchange.transaction.oneAddress.toLowerCase() ||
            t.hrc20Address.toLowerCase() ===
            exchange.transaction.oneAddress.toLowerCase(),
        )
      ) {
        ethBridgeStore.addressValidationError =
          'You enter bridge contract address. Transfer to this address will result in loss of funds! Please, use only your wallet address';
        return;
      }

      ethBridgeStore.formRef
        .validateFields()
        .then(async () => {
          if (
            exchange.step.id === EXCHANGE_STEPS.BASE &&
            exchange.token === TOKEN.ERC721
          ) {
            this.stores.erc20Select.setENSToken(exchange.transaction.ensName);
          }

          try {
            if (exchange.step.id === EXCHANGE_STEPS.BASE) {
              await new Promise((res, rej) => {
                actionModals.open(ConfirmTokenBridge, {
                  title: '',
                  applyText: 'Yes I confirm',
                  closeText: 'Cancel',
                  noValidation: true,
                  width: '500px',
                  showOther: true,
                  onApply: () => {
                    res();
                    return Promise.resolve();
                  },
                  onClose: () => {
                    rej();
                    return Promise.resolve();
                  },
                });
              });
            }
          } catch (e) {
            return;
          }

          if (exchange.step.id === EXCHANGE_STEPS.APPROVE) {
            const amount = mulDecimals(
              exchange.transaction.amount.toString(),
              18,
            );
            const approve = mulDecimals(exchange.transaction.approveAmount, 18);

            if (approve.lt(amount)) {
              ethBridgeStore.addressValidationError =
                'Approve amount is less than required';
              throw new Error('Approve amount is less than required');
            }
          }

          callback();
        })
        .catch(error => {
          console.log('### error', error);
        });
    } else {
      callback();
    }
  };

  @computed
  get tokenInfo(): ITokenInfo {
    const { user, exchange, userMetamask, erc20Select } = this.stores;

    switch (exchange.token) {
      case TOKEN.ALL:
        return {
          label: '',
          maxAmount: '0',
          symbol: '',
          image: '/busd.svg',
          address: '',
        };
      case TOKEN.BUSD:
        return {
          label: 'BUSD',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hmyBUSDBalance
              : userMetamask.ethBUSDBalance,
          symbol: 'BUSD',
          image: '/busd.svg',
          address: '',
        };
      case TOKEN.LINK:
        return {
          label: 'LINK',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hmyLINKBalance
              : userMetamask.ethLINKBalance,
          symbol: 'LINK',
          image: '/link.png',
          address: '',
        };

      case TOKEN.HRC721:
      case TOKEN.ERC1155:
      case TOKEN.HRC1155:
      case TOKEN.ERC721:
        return {
          label: 'Ethereum Name Service',
          symbol: 'ENS',
          image: '/ethereum-name-service-ens.svg',
          address: '',
          maxAmount: '0',
        };

      case TOKEN.ERC20:
      case TOKEN.HRC20:
        const token = tokensConfigs.find(
          item => item.erc20Address === erc20Select.tokenAddress,
        );

        return {
          label: userMetamask.erc20TokenDetails
            ? userMetamask.erc20TokenDetails.name
            : (token && token.name) || '',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hrc20Balance
              : userMetamask.erc20Balance,
          totalTransferred:
              exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
                ? user.totalTransferred
                : "0",
          symbol:
            (token && token.symbol) || userMetamask.erc20TokenDetails?.symbol,
          image: token && token.image,
          address: token && token.erc20Address,
        } as ITokenInfo;

      case TOKEN.ETH:
        return {
          label: getNetworkBaseToken(exchange.network),
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? user.hrc20Balance
              : userMetamask.ethBalance,
          symbol: getNetworkBaseToken(exchange.network),
          image: getNetworkIcon(exchange.network),
          address: '',
        };

      case TOKEN.ONE:
      default:
        return {
          label: 'ONE',
          maxAmount:
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
              ? divDecimals(user.balance, 18)
              : userMetamask.erc20Balance,
          symbol: 'ONE',
          image: '/one.svg',
          address: '',
        };
      // return {
      //   label: 'BUSD',
      //   maxAmount:
      //     exchange.mode === EXCHANGE_MODE.ONE_TO_ETH
      //       ? user.hmyBUSDBalance
      //       : userMetamask.ethBUSDBalance,
      //   symbol: 'BUSD',
      //   image: '/busd.svg',
      //   address: '',
      // };
    }
  }

  getChainConfig() {
    return getChainConfig(this.mode, this.network);
  }

  getDefaultToken() {
    return tokensConfigs.find(token => {
      return token.network === this.stores.exchange.network;
    });
  }

  isNFT() {
    return isNFT(this.token);
  }
}
