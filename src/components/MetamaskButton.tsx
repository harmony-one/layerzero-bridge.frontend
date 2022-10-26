import React from 'react';
import { Button } from 'grommet/components/Button';
import cn from 'classnames';
import * as s from '../pages/EthBridge/components/StepBASE/components/Destination/Destination.styl';
import { Box } from 'grommet/components/Box';

interface MetamaskButtonProps {
  active: boolean;
  onClick: () => void;
}

export const MetamaskButton: React.FC<MetamaskButtonProps> = ({ active, onClick }) => {
  return (
    <Button
      className={cn(s.metamaskButton, { [s.active]: active })}
      onClick={onClick}
    >
      <Box direction="row" gap="8px" align="center">
        <Box>
          <img src="/metamask-fox-wordmark-horizontal.svg" height="42" />
        </Box>
        {/*<Text color="NWhite" size="xxsmall" lh="24px">*/}
        {/*  {label}*/}
        {/*</Text>*/}
        {/*{active && <Icon glyph="CloseCircle" />}*/}
        {/*{!active && <Icon glyph="AddCircle" />}*/}
      </Box>
    </Button>
  );
};