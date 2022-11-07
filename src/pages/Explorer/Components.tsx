import { Box, BoxProps } from 'grommet';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Text } from 'components/Base/components/Text';
import * as React from 'react';
import { EXCHANGE_MODE, NETWORK_TYPE } from 'stores/interfaces';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { formatWithSixDecimals } from '../../utils';
import { NETWORK_BASE_TOKEN } from '../../stores/names';

export const OperationType = (props: { type: EXCHANGE_MODE }) => {
  return (
    <Box
      direction={
        props.type === EXCHANGE_MODE.ETH_TO_ONE ? 'row' : 'row-reverse'
      }
      align="center"
      className={cn(styles.operationType)}
      margin={{ left: '20px' }}
    >
      <Box direction="row" align="center">
        <img
          alt="token"
          className={styles.imgToken}
          style={{ height: 20 }}
          src="/eth.svg"
        />
        <Text size="medium">ETH</Text>
      </Box>
      <Box direction="row" margin={{ horizontal: 'xsmall' }} align="center">
        <img src="/right.svg" />
      </Box>
      <Box direction="row" align="center">
        <img
          className={styles.imgToken}
          style={{ height: 18 }}
          src="/one.svg"
        />
        <Text size="medium">ONE</Text>
      </Box>
    </Box>
  );
};

export const Price = observer(
  (props: {
    value: number;
    isEth: boolean;
    network: NETWORK_TYPE;
    boxProps?: BoxProps;
  }) => {
    const { user } = useStores();

    const externalNetworkRate =
      props.network === NETWORK_TYPE.ETHEREUM ? user.ethRate : user.bnbRate;

    const rate = props.isEth ? externalNetworkRate : user.oneRate;

    return (
      <Box
        direction="column"
        align="end"
        justify="center"
        pad={{ right: 'medium' }}
        {...props.boxProps}
      >
        <Text bold style={{ fontSize: 14 }} nowrap>{`${formatWithSixDecimals(
          props.value,
        )} ${props.isEth ? NETWORK_BASE_TOKEN[props.network] : 'ONE'}`}</Text>
        <Text color="NGray" bold size="xsmall">
          ${formatWithSixDecimals(props.value * rate)}
        </Text>
      </Box>
    );
  },
);
