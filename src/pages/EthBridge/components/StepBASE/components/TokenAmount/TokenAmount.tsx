import React, { useRef, useCallback, useContext, useMemo } from 'react';
import { Text } from '../../../../../../components/Base';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import {
  isLess,
  isPositive,
  isRequired,
  NumberInput,
} from '../../../../../../components/Form';
import { formatWithSixDecimals, moreThanZero } from '../../../../../../utils';
import { useStores } from '../../../../../../stores';
import * as s from './TokenAmount.styl';
import { observer } from 'mobx-react';
import { TOKEN } from '../../../../../../stores/interfaces';
import styled from 'styled-components';
import cn from 'classnames';
import { ThemeContext } from '../../../../../../themes/ThemeContext';
import { Box, Button } from 'grommet';
import { getTokenConfig } from '../../../../../../configs';
import { Tip } from 'grommet/components/Tip';
import { TipContent } from 'components/TipContent';
import { CircleQuestion } from 'grommet-icons';

interface Props { }

const BridgeControlStyled = styled(BridgeControl)`
  max-width: 180px;
`;

export const TokenAmount: React.FC<Props> = observer(() => {
  const { exchange } = useStores();
  const tipRef = useRef<HTMLDivElement>();

  //@ts-ignore
  const totalTransferred = exchange.tokenInfo.totalTransferred;
  const checkTotalTransferred = getTokenConfig(exchange.tokenInfo.address)?.checkTotalTransferred;

  const maxAmount = checkTotalTransferred ?
    Math.min(Number(exchange.tokenInfo.maxAmount), Number(totalTransferred)) :
    Number(exchange.tokenInfo.maxAmount);

  const handleMaxAmount = useCallback(() => {
    exchange.transaction.amount = String(maxAmount);
  }, [exchange.transaction.amount, maxAmount]);

  const themeContext = useContext(ThemeContext);

  const isLessThenMaxAmount = useMemo(() => {
    return isLess(Number(maxAmount), 'Not enough balance');
  }, [maxAmount]);

  return (
    <BridgeControlStyled
      title="Amount"
      gap="8px"
      centerContent={
        <NumberInput
          align="center"
          wrapperProps={{
            className: cn(s.wrapperClassName, {
              [s.wrapperDark]: themeContext.isDark(),
              [s.wrapperLight]: !themeContext.isDark(),
            }),
          }}
          margin="none"
          name="amount"
          type="decimal"
          min="0"
          precision="18"
          bgColor="transparent"
          border="none"
          delimiter="."
          placeholder="0"
          rules={[isRequired, isPositive, moreThanZero, isLessThenMaxAmount]}
          style={{ width: '100%', textAlign: 'center' }}
        />
      }
      bottomContent={
        <Box ref={ref => (tipRef.current = ref)}>
          <Button onClick={handleMaxAmount}>
            <Text size="xxsmall" color="NBlue">
              {formatWithSixDecimals(maxAmount)} Max Available
            </Text>
          </Button>

          {checkTotalTransferred &&
            <Box>
              <Text size="xxsmall" color="Basic500">
                {formatWithSixDecimals(exchange.tokenInfo.maxAmount)} Your balance
              </Text>

              <Box direction="row" gap="4px">
                <Text size="xxsmall" color="Basic500">
                  {formatWithSixDecimals(totalTransferred || 0)} Available for bridge
                </Text>
                <Tip
                  dropProps={{ align: { bottom: 'top' }, target: tipRef.current }}
                  plain
                  content={
                    <TipContent round="7px" pad="xsmall">
                      <Text size="xsmall">
                        The amount of USDC.e available for withdrawal is limited by the number of tokens locked on the external chain. If it is not enough, use another chain for withdrawal.
                      </Text>
                    </TipContent>
                  }
                >
                  <CircleQuestion size="12px" />
                </Tip>
              </Box>
            </Box>}
        </Box>
      }
    />
  );
});

TokenAmount.displayName = 'TokenAmount';
