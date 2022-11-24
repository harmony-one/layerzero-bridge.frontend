import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Grid } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { ITokenInfo, NETWORK_TYPE, TOKEN } from 'stores/interfaces';
import { formatWithTwoDecimals } from 'utils';
import * as styles from './styles.styl';
import { Text } from 'components/Base';
import { SearchInput } from 'components/Search';
import { getBech32Address } from '../../blockchain-bridge';
import { useMediaQuery } from 'react-responsive';
import { LayoutCommon } from '../../components/Layouts/LayoutCommon/LayoutCommon';
import { FilterTokenType } from './components/FilterTokenType';
import { FilterNetworkType } from './components/FilterNetworkType';
import { TokensHeader } from './components/TokensHeader/TokensHeader';
import styled from 'styled-components';
import { TokenSymbol } from '../Explorer/TokenSymbol';
import { TableRowMobile } from './components/TableRowMobile';
import { AssetLink } from './AssetLink';
import { getTokenTypeName } from '../../utils/token';

const StyledGrid = styled(Grid)`
  //grid-template-columns: auto auto auto auto;
  grid-template-areas: 'total total total total' 'filters filters filters filters' 'search search select select';

  row-gap: 12px;
  column-gap: 12px;

  @media (min-width: 850px) {
    //grid-template-columns: auto auto auto auto;
    grid-template-areas: 'total total total total' 'seagetAssetAddressrch search filters select';
    justify-content: space-between;
  }

  @media (min-width: 1150px) {
    //grid-template-columns: auto auto auto auto;
    grid-template-areas: 'total search filters select';
    justify-content: space-between;
  }
`;

const getColumns = ({ hmyLINKBalanceManager }): IColumn<ITokenInfo>[] => [
  {
    title: 'Symbol',
    key: 'symbol',
    dataIndex: 'symbol',
    width: 180,
    className: styles.leftHeader,
    render: (value, data) => (
      <TokenSymbol
        token={data.type}
        erc20Address={data.erc20Address}
        hrc20Address={data.hrc20Address}
        network={data.network}
      />
    ),
  },
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    width: 160,
    render: (value, data) => (
      <Text size="xxsmall" color="NGray">
        {value}
      </Text>
    ),
  },
  {
    title: 'Type',
    key: 'type',
    dataIndex: 'type',
    width: 100,
    render: (value, data) => (
      <Text size="xxsmall" color="NGray">
        {getTokenTypeName(data)}
      </Text>
    ),
  },
  {
    title: 'Origin Address',
    key: 'erc20Address',
    dataIndex: 'erc20Address',
    width: 180,
    render: (value, data) => <AssetLink data={data} type="origin" />,
  },
  {
    title: 'Mapping Address',
    key: 'hrc20Address',
    dataIndex: 'hrc20Address',
    width: 180,
    render: (value, data) => <AssetLink data={data} type="mapping" />,
  },
  // {
  //   title: 'Decimals',
  //   key: 'decimals',
  //   dataIndex: 'decimals',
  //   width: 100,
  //   className: styles.centerHeader,
  //   align: 'center',
  // },
  {
    title: 'Total Locked',
    // sortable: true,
    key: 'totalLockedNormal',
    dataIndex: 'totalLockedNormal',
    width: 140,
    render: value => (
      <Box direction="column" justify="center">
        {formatWithTwoDecimals(value)}
      </Box>
    ),
    // className: styles.centerHeader,
    // align: 'center',
  },
  {
    title: 'Total Locked USD',
    sortable: true,
    key: 'totalLockedUSD',
    defaultSort: 'asc',
    dataIndex: 'totalLockedUSD',
    width: 200,
    className: styles.rightHeaderSort,
    align: 'right',
    render: (value, data) => {
      let lockedMoney;
      if (data.type.indexOf('721') !== -1 || data.type.indexOf('1155') !== -1) {
        lockedMoney = '-';
      } else {
        lockedMoney = '$' + formatWithTwoDecimals(value);
      }
      return (
        <Box direction="column" justify="center" pad={{ right: 'medium' }}>
          {lockedMoney}
        </Box>
      );
    },
  },
];

export const Tokens = observer((props: any) => {
  const { tokens, user } = useStores();
  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState<NETWORK_TYPE | 'ALL'>('ALL');
  const [tokenType, setToken] = useState<TOKEN | 'ALL'>('ALL');

  const [columns, setColumns] = useState(getColumns(user));
  const isMobile: boolean = useMediaQuery({ query: '(max-width: 600px)' });

  useEffect(() => {
    tokens.selectedNetwork = network === 'ALL' ? undefined : network;
  }, [network]);

  useEffect(() => {
    tokens.init();
    tokens.fetch();
  }, []);

  useEffect(() => {
    setColumns(getColumns(user));
  }, [user.hmyLINKBalanceManager]);

  const onChangeDataFlow = (props: any) => {
    tokens.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - tokens.lastUpdateTime) / 1000);

  const filteredData = tokens.allData.filter(token => {
    // if (
    //   (token.type === 'erc20' || token.type === 'hrc20') &&
    //   !Number(token.totalSupply)
    // ) {
    //   return false;
    // }

    let iSearchOk = true;
    let isNetworkOk = true;
    let isTokenOk = true;

    if (search) {
      iSearchOk =
        Object.values(token).some(
          value =>
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(search.toLowerCase()),
        ) ||
        getBech32Address(token.hrc20Address).toLowerCase() ===
          search.toLowerCase();
    }

    if (network !== 'ALL') {
      isNetworkOk = token.network === network;
    }

    if (tokenType !== 'ALL') {
      isTokenOk = token.type === tokenType;
    }

    return iSearchOk && isNetworkOk && isTokenOk;
  });

  return (
    <LayoutCommon>
      <StyledGrid pad={{ vertical: '24px' }} fill="horizontal">
        <Box gridArea="total">
          <TokensHeader
            lastUpdate={lastUpdateAgo}
            totalLocked={tokens.totalLockedUSD}
          />
        </Box>

        <Box direction="column" gridArea="search" justify="end">
          <Text
            color="NGray4"
            style={{ fontSize: '10px', marginBottom: '8px' }}
          >
            SEARCH TOKEN
          </Text>
          <SearchInput value={search} onChange={setSearch} />
        </Box>
        <Box gridArea="filters" justify="end">
          <FilterNetworkType network={network} setNetwork={setNetwork} />
        </Box>
        <Box gridArea="select" justify="end">
          <FilterTokenType tokenType={tokenType} setToken={setToken} />
        </Box>
      </StyledGrid>

      <Box
        direction="row"
        wrap={true}
        fill="horizontal"
        justify="center"
        align="start"
      >
        <Table
          data={filteredData}
          columns={columns}
          isPending={tokens.isPending}
          hidePagination={true}
          dataLayerConfig={tokens.dataFlow}
          onChangeDataFlow={onChangeDataFlow}
          onRowClicked={() => {}}
          customItem={
            !isMobile
              ? undefined
              : {
                  dir: 'column',
                  render: (props: { params: ITokenInfo }) => {
                    return <TableRowMobile data={props.params} />;
                  },
                }
          }
        />
      </Box>
    </LayoutCommon>
  );
});
