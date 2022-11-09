import React from 'react';
import { getAssetBalance } from '../utils';
import utils from 'web3-utils';
import { Text } from '../../../components/Base';
import { ITokenInfo } from '../../../stores/interfaces';
import { formatWithSixDecimals, formatWithTwoDecimals } from '../../../utils';
import { Box } from 'grommet';

interface Props {
  data: ITokenInfo;
  type: 'origin' | 'mapping';
}

export const TokenBalance: React.FC<Props> = ({ data, type }) => {
  const balance = getAssetBalance(data, type) || '0';
  const hBalance = utils.fromWei(balance);
  // @ts-ignore
  const usdBalance = hBalance * data.usdPrice;

  return (
    <Box direction="row" gap="4px">
      <Text>
        {formatWithSixDecimals(hBalance)} {data.symbol}
      </Text>
      <Text color="NGray">${formatWithTwoDecimals(usdBalance)}</Text>
    </Box>
  );
};

TokenBalance.displayName = 'TokenBalance';
