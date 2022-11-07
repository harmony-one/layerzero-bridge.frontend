import React from 'react';
import { EXCHANGE_MODE, IOperation } from '../../stores/interfaces';
import { HarmonyLink } from '../Tokens/HarmonyLink';
import { EthAddress } from './EthAddress';

interface Props {
  operation: IOperation;
}

export const OperationFromLink: React.FC<Props> = ({ operation }) => {
  if (operation.type === EXCHANGE_MODE.ETH_TO_ONE) {
    return <EthAddress address={operation.ethAddress} operation={operation} />;
  }

  return <HarmonyLink address={operation.oneAddress} />;
};

OperationFromLink.displayName = 'OperationFromLink';
