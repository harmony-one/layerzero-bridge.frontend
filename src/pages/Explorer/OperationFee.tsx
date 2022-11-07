import React from 'react';
import { getOperationFee } from './ExpandedRow';
import { EXCHANGE_MODE, IOperation } from '../../stores/interfaces';
import { Price } from './Components';

interface Props {
  operation: IOperation;
}

export const OperationFee: React.FC<Props> = ({ operation }) => {
  const fee = getOperationFee(operation);
  const isETH = operation.type === EXCHANGE_MODE.ETH_TO_ONE;

  return <Price value={fee} isEth={isETH} network={operation.network} />;
};

OperationFee.displayName = 'OperationFee';
