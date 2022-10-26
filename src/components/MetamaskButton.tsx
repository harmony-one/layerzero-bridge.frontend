import React from 'react';
import { Button } from 'grommet/components/Button';
import { Text } from './Base';
import { Box } from 'grommet/components/Box';
import styled from 'styled-components';

interface MetamaskButtonProps {
  active: boolean;
  onClick: () => void;
}

const StyledButton = styled(Button)`
  background-color: ${props => (props.active ? '#B56625' : '#999999')};
  border-radius: 14px;
  padding: 12px 12px;
  min-height: 40px;
  transition: background-color 300ms linear;
`;

export const MetamaskButton: React.FC<MetamaskButtonProps> = ({
  active,
  onClick,
}) => {
  return (
    <StyledButton active={active} onClick={onClick}>
      <Box direction="row" gap="12px" align="center" justify="center">
        <Text>Connect MetaMask</Text>
        <Box>
          <img src="/metamask.svg" height="24" />
        </Box>
        {/*<Text color="NWhite" size="xxsmall" lh="24px">*/}
        {/*  {label}*/}
        {/*</Text>*/}
        {/*{active && <Icon glyph="CloseCircle" />}*/}
        {/*{!active && <Icon glyph="AddCircle" />}*/}
      </Box>
    </StyledButton>
  );
};
