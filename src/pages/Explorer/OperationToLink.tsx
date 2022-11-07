import React from 'react';
import { EXCHANGE_MODE, IOperation } from '../../stores/interfaces';
import { HarmonyLink } from '../Tokens/HarmonyLink';
import { EthAddress } from './EthAddress';

interface Props {
  operation: IOperation;
}

export const OperationToLink: React.FC<Props> = ({ operation }) => {
  if (operation.type === EXCHANGE_MODE.ONE_TO_ETH) {
    return <EthAddress address={operation.ethAddress} operation={operation} />;
  }

  return <HarmonyLink address={operation.oneAddress} />;
};

OperationToLink.displayName = 'OperationFromLink';
