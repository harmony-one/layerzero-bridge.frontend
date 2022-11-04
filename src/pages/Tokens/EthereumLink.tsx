import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Box } from 'grommet';
import { NETWORK_TYPE } from '../../stores/interfaces';
import { useStores } from '../../stores';
import * as styles from './styles.styl';
import { NETWORK_ICON } from '../../stores/names';
import { truncateAddressString } from '../../utils';
import { TRUNCATE_ADDRESS } from '../../constants';

interface Props {
  value: string;
  network: NETWORK_TYPE;
}
export const EthereumLink: React.FC<Props> = observer(({ value, network }) => {
  const { exchange } = useStores();

  return (
    <Box
      direction="row"
      justify="start"
      align="center"
      style={{ marginTop: 4 }}
    >
      <img
        alt="network"
        className={styles.imgToken}
        style={{ height: 20 }}
        src={NETWORK_ICON[network]}
      />
      <a
        className={styles.addressLink}
        href={`${exchange.getExplorerByNetwork(network)}/token/${value}`}
        target="_blank"
        rel="noreferrer"
      >
        {truncateAddressString(value, TRUNCATE_ADDRESS)}
      </a>
    </Box>
  );
});
