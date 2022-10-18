import React, { useCallback, useMemo } from 'react';
import { Button } from 'grommet';
import { observer } from 'mobx-react';
import { useStores } from '../../../stores';
import { EXCHANGE_MODE, NETWORK_TYPE } from '../../../stores/interfaces';
import styled from 'styled-components';

interface Props {}

const StyledButton = styled(Button)`
  background-color: ${props => props.theme.palette.NBlue};
  border-radius: 15px;
  padding: 4px 20px;
  font-size: 14px;
  color: ${props => props.theme.palette.NWhite};
`;

export const SwitchNetworkButton: React.FC<Props> = observer(() => {
  const { exchange, userMetamask } = useStores();

  const network = useMemo(() => {
    if (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH) {
      return NETWORK_TYPE.HARMONY;
    }

    return exchange.network;
  }, [exchange.mode, exchange.network]);

  const switchNetwork = useCallback(() => {
    userMetamask.switchNetwork(exchange.mode, exchange.network);
  }, [exchange.mode, exchange.network, userMetamask]);

  return (
    <StyledButton onClick={switchNetwork}>
      Switch MetaMask to {network}
    </StyledButton>
  );
});

SwitchNetworkButton.displayName = 'SwithNetwork';
