import React, { useCallback, useMemo } from 'react';
import { Icon, Text } from '../../../../../../components/Base';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { Button } from 'grommet/components/Button';
import { Box } from 'grommet';
import { useStores } from '../../../../../../stores';
import { ModalIds } from '../../../../../../modals';
import { observer } from 'mobx-react';
import { TOKEN } from '../../../../../../stores/interfaces';
import { isMultiNFT, isNFT } from '../../../../../../stores/Exchange/helpers';

interface Props {}

export const TokenControl: React.FC<Props> = observer(() => {
  const { routing, exchange } = useStores();

  const handleChangeToken = useCallback(() => {
    routing.goToModal(ModalIds.BRIDGE_TOKEN_CHOOSE);
  }, [routing]);

  const title = useMemo(() => {
    const title =
      isNFT(exchange.token) || isMultiNFT(exchange.token)
        ? 'Select Token'
        : 'Select token';

    if (exchange.token === TOKEN.ALL) {
      return title;
    }

    if (exchange.tokenInfo) {
      return exchange.tokenInfo.symbol || exchange.tokenInfo.label || title;
    }

    return title;
  }, [exchange.token, exchange.tokenInfo]);

  const centerContent = (
    <Box direction="row" gap="8px">
      <Text size="large">{title}</Text>
      <Icon size="10px" glyph="ArrowDownFilled" />
    </Box>
  );
  return (
    <BridgeControl
      title="Choose Token"
      gap="8px"
      centerContent={
        <Box height="32px" justify="center">
          <Button onClick={handleChangeToken}>{centerContent}</Button>
        </Box>
      }
      bottomContent={
        exchange.tokenInfo && (
          <Text size="xxsmall" color="NGray">
            {exchange.tokenInfo.label}
          </Text>
        )
      }
    />
  );
});

TokenControl.displayName = 'TokenControl';
