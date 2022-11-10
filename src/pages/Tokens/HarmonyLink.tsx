import { Box } from 'grommet';
import * as styles from './styles.styl';
import { truncateAddressString } from '../../utils';
import * as React from 'react';
import { TRUNCATE_ADDRESS } from '../../constants';

interface Props {
  address: string;
}

export const HarmonyLink: React.FC<Props> = ({ address }) => (
  <Box direction="row" justify="start" align="center">
    <img
      alt="harmony address"
      className={styles.imgToken}
      style={{ width: '20px' }}
      src="/one.svg"
    />
    <a
      className={styles.addressLink}
      href={`${process.env.HMY_EXPLORER_URL}/address/${address}?activeTab=3`}
      target="_blank"
    >
      {truncateAddressString(address, TRUNCATE_ADDRESS)}
    </a>
  </Box>
);
