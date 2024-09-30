import React from 'react';
import { NetworkButton } from './NetworkButton/NetworkButton';
import { NETWORK_TYPE } from '../../../stores/interfaces';
import { Box } from 'grommet';
import { networks } from '../../../configs';

interface Props {
  network: NETWORK_TYPE | 'ALL';
  setNetwork: (value: NETWORK_TYPE | 'ALL') => void;
}

export const FilterNetworkType: React.FC<Props> = React.memo(
  ({ network, setNetwork }) => {
    return (
      <Box direction="row" gap="9px">
        <NetworkButton
          type={'ALL'}
          selectedType={network}
          onClick={() => setNetwork('ALL')}
        />
        {
          Object.keys(networks)
            .filter(key => key !== NETWORK_TYPE.HARMONY)
            .map((key: NETWORK_TYPE, idx) => <NetworkButton
              key={idx}
              type={key}
              selectedType={network}
              onClick={() => setNetwork(key)}
            />)
        }
      </Box>
    );
  },
);

FilterNetworkType.displayName = 'FilterNetworkType';
