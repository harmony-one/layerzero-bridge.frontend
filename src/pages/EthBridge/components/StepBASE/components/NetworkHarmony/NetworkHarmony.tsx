import React from 'react';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { NetworkIcon } from '../../../NetworkIcon/NetworkIcon';
import { NETWORK_TYPE } from '../../../../../../stores/interfaces';
import { Text } from '../../../../../../components/Base';
import { networks } from '../../../../../../configs';

interface Props {
  title: string;
}

export const NetworkHarmony: React.FC<Props> = ({ title }) => {
  return (
    <BridgeControl
      title={title}
      centerContent={<NetworkIcon network={NETWORK_TYPE.HARMONY} />}
      bottomContent={
        <Text size="small" uppercase>
          {networks[NETWORK_TYPE.HARMONY].name}
        </Text>
      }
    />
  );
};

NetworkHarmony.displayName = 'NetworkHarmony';
