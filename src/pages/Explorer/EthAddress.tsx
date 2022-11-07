import { observer } from 'mobx-react-lite';
import { IOperation } from '../../stores/interfaces';
import { useStores } from '../../stores';
import { NETWORK_ICON } from '../../stores/names';
import { Box } from 'grommet';
import * as styles from './styles.styl';
import { getChecksumAddress } from '../../blockchain-bridge';
import { truncateAddressString } from '../../utils';
import * as React from 'react';

export const EthAddress = observer<any>(
  (params: { address; operation: IOperation }) => {
    const { exchange } = useStores();
    const icon = NETWORK_ICON[params.operation.network];

    return (
      <Box
        direction="row"
        justify="start"
        align="center"
        style={{ marginTop: 4 }}
      >
        <img
          alt="token image"
          className={styles.imgToken}
          style={{ height: 20 }}
          src={icon}
        />
        <a
          className={styles.addressLink}
          href={`${exchange.getExplorerByNetwork(
            params.operation.network,
          )}/address/${getChecksumAddress(params.address)}`}
          target="_blank"
        >
          {truncateAddressString(getChecksumAddress(params.address), 5)}
        </a>
      </Box>
    );
  },
);
