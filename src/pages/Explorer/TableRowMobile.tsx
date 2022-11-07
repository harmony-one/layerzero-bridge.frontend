import React from 'react';
import { Text } from '../../components/Base';
import { TableRowMobileContainer } from '../../components/Table/TableRowMobileContainer';
import { IOperation } from '../../stores/interfaces';
import { OperationFromLink } from './OperationFromLink';
import { OperationToLink } from './OperationToLink';
import { EntityStatus } from '../../components/EntityStatus';
import { TokenSymbol } from './TokenSymbol';
import { formatWithSixDecimals } from '../../utils';
import { OperationFee } from './OperationFee';
import { Box } from 'grommet';

interface Props {
  operation: IOperation;
}

const Row: React.FC = ({ children }) => {
  return (
    <Box direction="row" align="center" gap="8px">
      {children}
    </Box>
  );
};

export const TableRowMobile: React.FC<Props> = ({ operation }) => {
  return (
    <TableRowMobileContainer>
      <Row>
        <Text>From:</Text>
        <OperationFromLink operation={operation} />
      </Row>
      <Row>
        <Text>To:</Text>
        <OperationToLink operation={operation} />
      </Row>
      <Row>
        <Text>Status:</Text>
        <EntityStatus status={operation.status} />
      </Row>
      <Row>
        <Text>Token:</Text>
        <TokenSymbol
          token={operation.token}
          erc20Address={operation.erc20Address}
          hrc20Address={operation.hrc20Address}
          network={operation.network}
        />
      </Row>
      <Row>
        <Text>Amount:</Text>
        {formatWithSixDecimals(operation.amount)}
      </Row>
      <Row>
        <Text>Tnx Fee:</Text>
        <OperationFee operation={operation} />
      </Row>
    </TableRowMobileContainer>
  );
};

TableRowMobile.displayName = 'TableRowMobile';
