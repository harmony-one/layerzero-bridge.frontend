import React, { useCallback, useContext, useMemo } from 'react';
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
import { Button } from 'grommet';

interface Props {}

const BridgeControlStyled = styled(BridgeControl)`
  max-width: 180px;
`;

export const TokenAmount: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  const maxAmount = exchange.tokenInfo.maxAmount;

  const handleMaxAmount = useCallback(() => {
    exchange.transaction.amount = maxAmount;
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
        <Button onClick={handleMaxAmount}>
          <Text size="xxsmall" color="NBlue">
            {formatWithSixDecimals(maxAmount)} Max Available
          </Text>
        </Button>
      }
    />
  );
});

TokenAmount.displayName = 'TokenAmount';
