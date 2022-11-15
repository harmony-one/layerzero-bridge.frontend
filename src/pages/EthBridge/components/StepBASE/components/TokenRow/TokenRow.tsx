import React, { useState } from 'react';
import { Box, Tip } from 'grommet';
import { Text } from '../../../../../../components/Base';
import { TokenControl } from '../TokenControl/TokenControl';
import { TokenAmount } from '../TokenAmount/TokenAmount';
import { observer } from 'mobx-react';
import { useStores } from '../../../../../../stores';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { TOKEN } from '../../../../../../stores/interfaces';
import { truncateAddressString } from '../../../../../../utils';
import { CircleQuestion } from 'grommet-icons';
import { TipContent } from '../../../../../../components/TipContent';
import { Link } from 'components/Link';
import { getTokenConfig } from '../../../../../../config';
import { isNFT } from '../../../../../../stores/Exchange/helpers';

const TokenAddresses = observer(() => {
  const { exchange, erc20Select } = useStores();

  const tokenConfig = getTokenConfig(erc20Select.tokenAddress);

  const originalAddress =
    exchange.token === TOKEN.HRC20
      ? tokenConfig.hrc20Address
      : tokenConfig.erc20Address;

  const mappedAddress =
    exchange.token !== TOKEN.HRC20
      ? tokenConfig.hrc20Address
      : tokenConfig.erc20Address;

  const originAddressLink =
    exchange.token === TOKEN.HRC20
      ? `${process.env.HMY_EXPLORER_URL}/address/${tokenConfig.hrc20Address}`
      : `${exchange.config.explorerURL}/token/${tokenConfig.erc20Address}`;

  const mappedAddressLink =
    exchange.token !== TOKEN.HRC20
      ? `${process.env.HMY_EXPLORER_URL}/address/${tokenConfig.hrc20Address}?activeTab=3`
      : `${exchange.config.explorerURL}/token/${tokenConfig.erc20Address}`;

  return (
    <Box>
      <Text bold>
        <Link
          monospace
          href={originAddressLink}
          target="_blank"
          rel="noreferrer"
        >
          {truncateAddressString(erc20Select.tokenAddress, 8)}
        </Link>
      </Text>
      <Text bold>
        <Link
          monospace
          href={mappedAddressLink}
          target="_blank"
          rel="noreferrer"
        >
          {truncateAddressString(mappedAddress, 8)}
        </Link>
      </Text>
    </Box>
  );
});

interface Props {}

export const TokenRow: React.FC<Props> = observer(() => {
  const { exchange, erc20Select } = useStores();

  const displayTokenAddress =
    [TOKEN.ERC20, TOKEN.HRC20].includes(exchange.token) &&
    erc20Select.tokenAddress;

  const [tipRef, setTipRef] = useState();

  const _isNFT = isNFT(exchange.token);

  return (
    <Box direction="column">
      {/*<Box justify="center" align="center" pad={{ bottom: '16px' }}>*/}
      {/*  <TokenSettings />*/}
      {/*</Box>*/}
      <Box direction="row-responsive" justify="center">
        <Box flex={{ grow: 1, shrink: 0 }} basis="33%">
          <TokenControl />
        </Box>
        <Box
          flex={{ grow: 0, shrink: 1 }}
          align="center"
          pad={{ vertical: '12px' }}
        >
          {exchange.tokenInfo && exchange.tokenInfo.image && (
            <img alt="token" src={exchange.tokenInfo.image} width="40" />
          )}
        </Box>

        {!_isNFT && (
          <Box flex={{ grow: 1, shrink: 0 }} basis="33%" align="center">
            <TokenAmount />
          </Box>
        )}
      </Box>
      {displayTokenAddress && (
        <Box justify="center" align="center" pad={{ top: '16px' }}>
          <BridgeControl
            gap="8px"
            title={
              <Box
                ref={ref => setTipRef(ref)}
                direction="row"
                align="center"
                gap="4px"
              >
                <Text>Token Address</Text>
                <Tip
                  dropProps={{
                    align: { bottom: 'top' },
                    target: tipRef,
                  }}
                  plain
                  content={
                    <TipContent round="7px" pad="xsmall">
                      <Text size="xsmall">
                        Make sure that you are transferring tokens to a liquid
                        address
                      </Text>
                    </TipContent>
                  }
                >
                  <CircleQuestion size="12px" />
                </Tip>
              </Box>
            }
            centerContent={<TokenAddresses />}
          />
        </Box>
      )}
    </Box>
  );
});

TokenRow.displayName = 'TokenRow';
