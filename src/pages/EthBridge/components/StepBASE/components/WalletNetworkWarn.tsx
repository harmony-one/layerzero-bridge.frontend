import React, { useMemo } from 'react';
import { StatusWarning } from 'grommet-icons';
import { Text } from '../../../../../components/Base';
import { Box } from 'grommet/components/Box';
import { EXCHANGE_MODE, NETWORK_TYPE } from '../../../../../stores/interfaces';
import { NETWORK_NAME } from '../../../../../stores/names';
import { useStores } from '../../../../../stores';
import { observer } from 'mobx-react';

interface Props {}

export const WalletNetworkWarn: React.FC<Props> = observer(() => {
  const { userMetamask, exchange } = useStores();

  const externalNetworkName = useMemo(() => {
    if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      return NETWORK_NAME[NETWORK_TYPE.HARMONY];
    }

    return NETWORK_NAME[exchange.network];
  }, [exchange.mode, exchange.network]);

  const destinationNetworkName = useMemo(() => {
    if (exchange.mode === EXCHANGE_MODE.ETH_TO_ONE) {
      return NETWORK_NAME[NETWORK_TYPE.HARMONY];
    }

    return NETWORK_NAME[exchange.network];
  }, [exchange.mode, exchange.network]);

  const externalSubNetworkName =
    exchange.network === NETWORK_TYPE.ETHEREUM
      ? process.env.NETWORK === 'mainnet'
        ? 'mainnet'
        : 'kovan'
      : process.env.NETWORK === 'mainnet'
      ? 'mainnet'
      : 'testnet';

  return (
    <Box direction="row" gap="xsmall" align="center">
      {/*<StatusWarning color="#FF0000" />*/}
      <Text size="xsmall" align="center">
        You have authorised with MetaMask, but the selected network does not
        match&nbsp;
        <span style={{ color: 'rgb(0, 173, 232)' }}>
          {externalNetworkName}: {externalSubNetworkName}
        </span>
        . Please change network to {externalSubNetworkName} for transfer&nbsp;
        {externalNetworkName}&nbsp;->&nbsp;{destinationNetworkName} with
        MetaMask.
      </Text>
    </Box>
  );
});

WalletNetworkWarn.displayName = 'WalletNetworkWarn';
