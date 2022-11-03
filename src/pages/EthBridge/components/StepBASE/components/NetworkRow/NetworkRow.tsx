import React from 'react';
import { Box } from 'grommet';
import { NetworkSourceControl } from '../NetworkSourceControl/NetworkSourceControl';
import { NetworkDestination } from '../NetworkDestination/NetworkDestination';
import { NetworkDirection } from '../NetworkDirection/NetworkDirection';
import { observer } from 'mobx-react';

interface Props {}

export const NetworkRow: React.FC<Props> = observer(() => {
  return (
    <Box direction="row" align="center">
      <Box basis="33%" flex={{ grow: 1, shrink: 0 }}>
        <NetworkSourceControl />
      </Box>
      <Box align="center" pad={{ vertical: '16px' }}>
        <NetworkDirection />
      </Box>
      <Box basis="33%" flex={{ grow: 1, shrink: 0 }}>
        <NetworkDestination />
      </Box>
    </Box>
  );
});

NetworkRow.displayName = 'NetworkRow';
