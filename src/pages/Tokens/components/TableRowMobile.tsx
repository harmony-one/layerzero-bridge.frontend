import React from 'react';
import { ITokenInfo } from '../../../stores/interfaces';
import { getChecksumAddress } from '../../../blockchain-bridge';
import { Text } from '../../../components/Base';
import { HarmonyLink } from '../HarmonyLink';
import { formatWithTwoDecimals } from '../../../utils';
import { EthereumLink } from '../EthereumLink';
import { TableRowMobileContainer } from '../../../components/Table/TableRowMobileContainer';

interface Props {
  data: ITokenInfo;
}

export const TableRowMobile: React.FC<Props> = ({ data }) => {
  const hrc20Address =
    String(data.hrc20Address).toLowerCase() ===
    String(process.env.ONE_HRC20).toLowerCase()
      ? String(data.hrc20Address).toLowerCase()
      : getChecksumAddress(data.hrc20Address);

  return (
    <TableRowMobileContainer>
      <Text bold={true}>
        {data.name} ({data.symbol})
      </Text>
      <Text>
        HRC20 Address: <HarmonyLink address={hrc20Address} />
      </Text>
      <Text>
        ERC20 Address:{' '}
        <EthereumLink address={data.erc20Address} network={data.network} />
      </Text>
      <Text>
        Total Locked USD: ${formatWithTwoDecimals(data.totalLockedUSD)}
      </Text>
    </TableRowMobileContainer>
  );
};

TableRowMobile.displayName = 'TableRowMobile';
