import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet/components/Box';

export const ModalContent = styled(Box)`
  max-height: 650px;
  border: 1px solid ${props => props.theme.modal.borderColor};
  background-color: ${props => props.theme.modal.bgColor};
  border-radius: 10px;
  min-width: 408px;
`;

ModalContent.displayName = 'ModalContent';
