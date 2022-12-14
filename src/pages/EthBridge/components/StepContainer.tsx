import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

export const StepContainer = styled(Box)`
  width: 580px;
  border-radius: 25px;
  margin-top: 12px;
  background-color: ${props => props.theme.bridgeForm.bgColor};
  overflow: hidden;
  position: relative;
`;

StepContainer.displayName = 'StepContainer';
