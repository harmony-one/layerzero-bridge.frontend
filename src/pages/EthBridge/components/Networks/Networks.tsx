import React from 'react';
import { Box } from 'grommet/components/Box';
import { BridgeControl } from '../BridgeControl/BridgeControl';
import { useStores } from '../../../../stores';
import { EXCHANGE_MODE, NETWORK_TYPE } from '../../../../stores/interfaces';
import { NetworkIcon } from '../NetworkIcon/NetworkIcon';
import { NetworkHarmony } from '../StepBASE/components/NetworkHarmony/NetworkHarmony';
import { observer } from 'mobx-react';
import { Text } from '../../../../components/Base';
import { Transaction } from 'grommet-icons';
import { networks } from '../../../../configs';

interface NetworkProps {
  mode: EXCHANGE_MODE;
  title: 'From' | 'To';
  network: NETWORK_TYPE;
}

const Network: React.FC<NetworkProps> = ({ mode, network, title }) => {
  if (title === 'From' && mode === EXCHANGE_MODE.ONE_TO_ETH) {
    return <NetworkHarmony title={title} />;
  }

  if (title === 'To' && mode === EXCHANGE_MODE.ETH_TO_ONE) {
    return <NetworkHarmony title={title} />;
  }

  return (
    <BridgeControl
      title={title}
      centerContent={<NetworkIcon network={network} />}
      bottomContent={
        <Text size="small" uppercase>
          {networks[network].name}
        </Text>
      }
    />
  );
};

Network.displayName = 'Network';

interface Props {}

export const Networks: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  return (
    <Box
      direction="row"
      justify="around"
      align="center"
      style={{ height: '168px' }}
    >
      <Box>
        <Network title="From" mode={exchange.mode} network={exchange.network} />
      </Box>
      <Box>
        <Transaction />
      </Box>
      <Box>
        <Network title="To" mode={exchange.mode} network={exchange.network} />
      </Box>
    </Box>
  );
});

Networks.displayName = 'Networks';
