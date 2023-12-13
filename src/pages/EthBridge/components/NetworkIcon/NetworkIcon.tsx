import React from 'react';
import { Icon } from '../../../../components/Base';
import { NETWORK_TYPE } from '../../../../stores/interfaces';
import { networks } from '../../../../configs';

interface Props {
  network: NETWORK_TYPE;
}

export const NetworkIcon: React.FC<Props> = ({ network }) => {
  const glyph = networks[network].name;
  
  return <Icon size="32" glyph={glyph} />;
};

NetworkIcon.displayName = 'NetworkIcon';
