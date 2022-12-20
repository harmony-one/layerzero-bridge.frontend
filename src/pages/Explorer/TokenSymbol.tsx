import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import ReactTooltip from 'react-tooltip';
import { Box } from 'grommet';
import { sliceByLength } from '../../utils';
import { Text } from '../../components/Base';
import { NETWORK_TYPE, TOKEN } from '../../stores/interfaces';
import { findTokenConfig } from '../../config';

interface TokenSymbolProps {
  token: TOKEN;
  network: NETWORK_TYPE;
  erc20Address?: string;
  hrc20Address?: string;
}

export const TokenSymbol = observer((props: TokenSymbolProps) => {
  const { tokens } = useStores();
  const { network, token, erc20Address = '', hrc20Address = '' } = props;

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  const tokenInfo = useMemo(() => {
    return findTokenConfig({ erc20Address, hrc20Address, network });
  }, [erc20Address, hrc20Address, network]);

  if (!tokenInfo) {
    return <Box>{token}</Box>;
  }

  return (
    <Box direction="row" align="center" gap="4px">
      <img alt="token" src={tokenInfo.image} height="16" width="16" />{' '}
      <Text nowrap size="small" margin={{ top: '2px' }}>
        {sliceByLength(tokenInfo.symbol, 9)}
      </Text>
    </Box>
  );
});

TokenSymbol.displayName = 'ERC20Token';
