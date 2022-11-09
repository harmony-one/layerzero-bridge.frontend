import React from 'react';
import { TableRowMobileContainer } from '../../../components/Table/TableRowMobileContainer';
import { Text } from '../../../components/Base';
import { Box } from 'grommet';
import { TokenSymbol } from '../../Explorer/TokenSymbol';
import { ITokenInfo } from '../../../stores/interfaces';
import { AssetLink } from '../../Tokens/AssetLink';
import { TokenBalance } from './TokenBalance';
import { BoxExtendedProps } from 'grommet/components/Box';
import { Divider } from '../../../components/Divider/Divider';

const Row: React.FC<BoxExtendedProps> = ({ children, ...props }) => {
  return (
    <Box direction="row" align="center" gap="8px" {...props}>
      {children}
    </Box>
  );
};

interface Props {
  data: ITokenInfo;
}

export const TableRowMobile: React.FC<Props> = ({ data }) => {
  return (
    <TableRowMobileContainer>
      <Row>
        <Text>Symbol:</Text>
        <TokenSymbol
          token={data.token}
          erc20Address={data.erc20Address}
          hrc20Address={data.hrc20Address}
          network={data.network}
        />
      </Row>
      {/*<Row>*/}
      {/*  <Text>Type:</Text>*/}
      {/*  <Box>{data.type.toUpperCase()}</Box>*/}
      {/*</Row>*/}
      <Divider />
      <Row direction="column" align="left">
        <Text>Origin Address:</Text>
        <Box direction="row" align="center" gap="4px">
          <AssetLink data={data} type="origin" />
          <TokenBalance data={data} type="origin" />
        </Box>
      </Row>
      <Row direction="column" align="left">
        <Text>Mapping Address:</Text>
        <Box direction="row" align="center" gap="4px">
          <AssetLink data={data} type="mapping" />
          <TokenBalance data={data} type="mapping" />
        </Box>
      </Row>
    </TableRowMobileContainer>
  );
};

TableRowMobile.displayName = 'TableMobileRow';
