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
  address: string;
  network: NETWORK_TYPE;
}
export const EthereumLink: React.FC<Props> = observer(
  ({ address, network }) => {
    const { exchange } = useStores();

    return (
      <Box direction="row" justify="start" align="center">
        <Box justify="center" align="center" className={styles.imgToken}>
          <img
            alt="network"
            style={{ height: 20 }}
            src={NETWORK_ICON[network]}
          />
        </Box>
        <a
          className={styles.addressLink}
          href={`${exchange.getExplorerByNetwork(network)}/token/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          {truncateAddressString(address, TRUNCATE_ADDRESS)}
        </a>
      </Box>
    );
  },
);
