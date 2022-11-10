import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import { ITokenInfo, NETWORK_TYPE, TOKEN } from 'stores/interfaces';
import * as styles from './styles.styl';
import { SearchInput } from 'components/Search';
import { getBech32Address } from '../../blockchain-bridge';
import { useMediaQuery } from 'react-responsive';
import { LayoutCommon } from '../../components/Layouts/LayoutCommon/LayoutCommon';
import { NetworkButton } from '../Tokens/components/NetworkButton/NetworkButton';
import { AssetLink } from '../Tokens/AssetLink';
import { TableRowMobile } from './components/TableRowMobile';
import { TokenBalance } from './components/TokenBalance';

const getColumns = ({ hmyLINKBalanceManager }): IColumn<ITokenInfo>[] => [
  {
    title: 'Symbol',
    key: 'symbol',
    dataIndex: 'symbol',
    width: 140,
    className: styles.leftHeader,
    render: (value, data) => (
      <Box direction="row" justify="start" pad={{ left: 'medium' }}>
        {value ? value.toUpperCase() : '--'}
        {/*<AddTokenIcon {...data} />*/}
      </Box>
    ),
  },
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    width: 160,
  },
  {
    title: 'Type',
    key: 'type',
    dataIndex: 'type',
    width: 100,
    render: (value, data) => (
      <Box direction="row" justify="start">
        {value.toUpperCase()}
      </Box>
    ),
  },
  {
    title: 'Origin Address',
    key: 'erc20Address',
    dataIndex: 'erc20Address',
    width: 380,
    render: (value, data) => {
      return (
        <Box direction="column" gap="4px">
          <AssetLink data={data} type="origin" />
          <TokenBalance data={data} type="origin" />
        </Box>
      );
    },
  },
  {
    title: 'Mapping Address',
    key: 'hrc20Address',
    dataIndex: 'hrc20Address',
    width: 380,
    render: (value, data) => {
      return (
        <Box direction="column" gap="4px">
          <AssetLink data={data} type="mapping" />
          <TokenBalance data={data} type="mapping" />
        </Box>
      );
    },
  },
  // {
  //   title: 'Decimals',
  //   key: 'decimals',
  //   dataIndex: 'decimals',
  //   width: 100,
  //   className: styles.centerHeader,
  //   align: 'center',
  // },
];

export const Portfolio = observer(() => {
  const { tokens, user, portfolio } = useStores();
  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState<NETWORK_TYPE | 'ALL'>('ALL');
  const [tokenType, setToken] = useState<TOKEN | 'ALL'>('ALL');

  const [columns, setColumns] = useState(getColumns(user));
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

  useEffect(() => {
    tokens.selectedNetwork = network === 'ALL' ? undefined : network;
  }, [network]);

  const loadUserOperations = async () => {
    await tokens.init();
    await tokens.fetch();

    const ethAddress = '0x3998b67218d591758c1704b1c4fa1a87abeeb443';
    const oneAddress = '0x3998b67218d591758c1704b1c4fa1a87abeeb443';
    // const ethAddress = userMetamask.ethAddress;
    // const oneAddress = user.address;

    await portfolio.loadOperationList(ethAddress, oneAddress);
  };

  useEffect(() => {
    loadUserOperations();
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
      {!isMobile ? (
        <Box
          pad={{ horizontal: '9px' }}
          margin={{ top: 'medium', bottom: 'medium' }}
          // style={{ maxWidth: 500 }}
          direction={isMobile ? 'column' : 'row'}
          justify="between"
          align={isMobile ? 'start' : 'end'}
          gap="40px"
        >
          <SearchInput value={search} onChange={setSearch} />
          <Box direction="row" gap="10px" align="end">
            <NetworkButton
              type="ALL"
              selectedType={network}
              onClick={() => setNetwork('ALL')}
            />
            <NetworkButton
              type={NETWORK_TYPE.BINANCE}
              selectedType={network}
              onClick={() => setNetwork(NETWORK_TYPE.BINANCE)}
            />
            <NetworkButton
              type={NETWORK_TYPE.ETHEREUM}
              selectedType={network}
              onClick={() => setNetwork(NETWORK_TYPE.ETHEREUM)}
            />
            {/*<Box direction="column" style={{ width: 300 }} gap="5px">*/}
            {/*  <Text>Token:</Text>*/}
            {/*  <Select*/}
            {/*    size="full"*/}
            {/*    value={tokenType}*/}
            {/*    options={[*/}
            {/*      { text: 'ALL', value: 'ALL' },*/}
            {/*      { text: 'ERC20', value: TOKEN.ERC20 },*/}
            {/*      { text: 'HRC20', value: TOKEN.HRC20 },*/}
            {/*      { text: 'ERC721', value: TOKEN.ERC721 },*/}
            {/*      { text: 'ERC1155', value: TOKEN.ERC1155 },*/}
            {/*      { text: 'HRC721', value: TOKEN.HRC721 },*/}
            {/*      { text: 'HRC1155', value: TOKEN.HRC1155 },*/}
            {/*    ]}*/}
            {/*    onChange={setToken}*/}
            {/*  />*/}
            {/*</Box>*/}
          </Box>
        </Box>
      ) : (
        <Box direction="column">
          <Box
            direction="row"
            gap="10px"
            align="start"
            margin={{ top: '20px', bottom: '10px' }}
          >
            <NetworkButton
              type="ALL"
              selectedType={network}
              onClick={() => setNetwork('ALL')}
            />
            <NetworkButton
              type={NETWORK_TYPE.BINANCE}
              selectedType={network}
              onClick={() => setNetwork(NETWORK_TYPE.BINANCE)}
            />
            <NetworkButton
              type={NETWORK_TYPE.ETHEREUM}
              selectedType={network}
              onClick={() => setNetwork(NETWORK_TYPE.ETHEREUM)}
            />
          </Box>
          <SearchInput value={search} onChange={setSearch} />
        </Box>
      )}

      <Box direction="row" wrap fill justify="center" align="start">
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
