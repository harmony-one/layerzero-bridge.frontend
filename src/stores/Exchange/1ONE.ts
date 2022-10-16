import {
  ACTION_TYPE,
  EXCHANGE_MODE,
  IAction,
  NETWORK_TYPE,
  STATUS,
} from '../interfaces';
import { sleep } from 'utils';
import { ITransaction } from './index';
import { IStores } from '../index';
import { hmyMethodsERC20Web3 } from '../../blockchain-bridge/hmy';
import { getExNetworkMethods } from '../../blockchain-bridge/eth';
import { getTokenConfig } from '../../config';

export const send1ONEToken = async (params: {
  transaction: ITransaction;
  stores: IStores;
  mode: EXCHANGE_MODE;
  getActionByType: (action: ACTION_TYPE) => IAction;
  confirmCallback: (hash: string, action: ACTION_TYPE) => void;
}) => {
  const {
    getActionByType,
    confirmCallback,
    transaction,
    stores,
    mode,
  } = params;

  // const hmyMethodsBase =
  //   stores.exchange.network === NETWORK_TYPE.ETHEREUM
  //     ? hmyMethodsHRC20
  //     : hmyMethodsBEP20;

  // const hmyMethods = stores.user.isMetamask
  //   ? hmyMethodsBase.hmyMethodsWeb3
  //   : hmyMethodsBase.hmyMethods;

  const ethMethods = getExNetworkMethods().ethMethodsERC20;

  // let getHRC20Action = getActionByType(ACTION_TYPE.getERC20Address);

  // while (
  //   getHRC20Action &&
  //   [STATUS.IN_PROGRESS, STATUS.WAITING].includes(getHRC20Action.status)
  // ) {
  //   await sleep(3000);
  //   getHRC20Action = getActionByType(ACTION_TYPE.getERC20Address);
  // }

  // if (!stores.userMetamask.erc20Address) {
  //   await stores.user.setHRC20Mapping(process.env.ONE_HRC20, true);
  // }

  if (mode === EXCHANGE_MODE.ONE_TO_ETH) {
    const approveHmyManger = getActionByType(ACTION_TYPE.approveHmyManger);

    confirmCallback('skip', approveHmyManger.type);

    const lockToken = getActionByType(ACTION_TYPE.burnToken);

    if (lockToken.status === STATUS.WAITING) {
      await hmyMethodsERC20Web3.burnToken(
        '',
        transaction.ethAddress,
        transaction.amount,
        18,
        hash => confirmCallback(hash, lockToken.type),
      );
    }

    return;
  }

  if (mode === EXCHANGE_MODE.ETH_TO_ONE) {
    const erc20Address = getTokenConfig('').erc20Address;

    let approveHmyManger = getActionByType(ACTION_TYPE.approveEthManger);

    if (approveHmyManger && approveHmyManger.status === STATUS.WAITING) {
      await ethMethods.approveEthManger(
        erc20Address,
        transaction.approveAmount,
        stores.userMetamask.erc20TokenDetails.decimals,
        hash => confirmCallback(hash, approveHmyManger.type),
      );
    }

    while (
      [STATUS.WAITING, STATUS.IN_PROGRESS].includes(approveHmyManger.status)
    ) {
      approveHmyManger = getActionByType(ACTION_TYPE.approveEthManger);

      await sleep(500);
    }

    if (approveHmyManger.status !== STATUS.SUCCESS) {
      return;
    }

    const burnToken = getActionByType(ACTION_TYPE.burnToken);

    if (burnToken && burnToken.status === STATUS.WAITING) {
      await ethMethods.lockToken(
        erc20Address,
        transaction.oneAddress,
        transaction.amount,
        stores.userMetamask.erc20TokenDetails.decimals,
        hash => confirmCallback(hash, burnToken.type),
      );
    }

    return;
  }
};
