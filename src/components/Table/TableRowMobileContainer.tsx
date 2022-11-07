import React from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';

const RowContainer = styled(Box)`
  width: calc(100vw - 20px);
  overflow: hidden;
  border-radius: 10px;
  background: ${props => props.theme.table.bgColor};
`;

interface Props {}

export const TableRowMobileContainer: React.FC<Props> = ({ children }) => {
  return (
    <RowContainer
      direction="column"
      pad="16px"
      margin={{ top: '15px' }}
      gap="5px"
    >
      {children}
    </RowContainer>
  );
};

TableRowMobileContainer.displayName = 'TableRowMobileContainer';
