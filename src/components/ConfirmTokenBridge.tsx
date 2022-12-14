import React from 'react';
import { Box } from 'grommet';
import { Text, Title } from './Base';

interface Props {}

export const ConfirmTokenBridge: React.FC<Props> = () => {
  return (
    <Box pad="large">
      <Title>Important</Title>
      <Text size="xsmall">
        <br />
        <li>Bridge does not swap tokens, it only wraps it.</li>
        <br />
        <li>Never use exchange wallet (e.g. Binance) in bridge</li>
        <br />
        <li>Double check the receiver address</li>
        <br />
        <li>
          Make sure that the token you are bridging has liquidity (or use) on
          Harmony
        </li>
      </Text>
    </Box>
  );
};

ConfirmTokenBridge.displayName = 'ConfirmTokenBridge';
