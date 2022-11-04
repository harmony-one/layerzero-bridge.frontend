import React from 'react';
import { ITokenInfo } from '../../../stores/interfaces';
import { getChecksumAddress } from '../../../blockchain-bridge';
import { Box } from 'grommet';
import { Text } from '../../../components/Base';
import { HarmonyLink } from '../HarmonyLink';
import { formatWithTwoDecimals } from '../../../utils';
import { EthereumLink } from '../EthereumLink';

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
    <Box
      style={{
        width: 'calc(100vw - 20px)',
        overflow: 'hidden',
        borderRadius: '5px',
        background: '#1B1B1C',
      }}
      direction="column"
      pad="medium"
      margin={{ top: '15px' }}
      gap="5px"
    >
      <Text bold={true}>
        {data.name} ({data.symbol})
      </Text>
      <Text>
        HRC20 Address: <HarmonyLink address={hrc20Address} />
      </Text>
      <Text>
        ERC20 Address:{' '}
        <EthereumLink value={data.erc20Address} network={data.network} />
      </Text>
      <Text>
        Total Locked USD: ${formatWithTwoDecimals(data.totalLockedUSD)}
      </Text>
    </Box>
  ) as any;
};

TableRowMobile.displayName = 'TableRowMobile';
