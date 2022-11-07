import * as React from 'react';
import { IOperation, TOKEN } from 'stores/interfaces';
import { formatWithSixDecimals } from 'utils';
import * as styles from './styles.styl';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { Box } from 'grommet';
import { IColumn } from '../../components/Table';
import { ManageButton } from './ManageButton';
import { EntityStatus } from '../../components/EntityStatus';
import { TokenSymbol } from './TokenSymbol';
import { OperationFromLink } from './OperationFromLink';
import { OperationToLink } from './OperationToLink';
import { OperationAge } from './OperationAge';
import { OperationFee } from './OperationFee';

export const getColumns = (
  { user },
  manager: string = '',
): IColumn<IOperation & { manager: boolean }>[] => {
  const columns: IColumn<IOperation & { manager: boolean }>[] = [
    // {
    //   title: 'Type',
    //   key: 'type',
    //   dataIndex: 'type',
    //   width: 180,
    //   render: value => <OperationType type={value} />,
    // },

    {
      title: 'From',
      key: 'ethAddress',
      dataIndex: 'ethAddress',
      width: 200,
      render: (value, data) => <OperationFromLink operation={data} />,
    },

    {
      title: 'To',
      key: 'oneAddress',
      dataIndex: 'oneAddress',
      width: 200,
      render: (value, data) => <OperationToLink operation={data} />,
    },

    // {
    //   title: 'Eth address',
    //   key: 'ethAddress',
    //   dataIndex: 'ethAddress',
    //   width: 160,
    //   render: value => (
    //     <a
    //       className={styles.addressLink}
    //       href={`${process.env.ETH_EXPLORER_URL}/address/${value}`}
    //       target="_blank"
    //     >
    //       {truncateAddressString(value, 5)}
    //     </a>
    //   ),
    // },
    // {
    //   title: 'One address',
    //   key: 'oneAddress',
    //   dataIndex: 'oneAddress',
    //   width: 160,
    //   render: value => (
    //     <a
    //       className={styles.addressLink}
    //       href={`${process.env.HMY_EXPLORER_URL}/address/${value}`}
    //       target="_blank"
    //     >
    //       {truncateAddressString(value, 5)}
    //     </a>
    //   ),
    // },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      width: 140,
      render: value => (
        <EntityStatus status={value} />
        // <Box className={cn(styles.status, styles[value])}>{value}</Box>
      ),
    },
    {
      title: 'Asset',
      key: 'token',
      dataIndex: 'token',
      width: 100,
      render: (value, data) => (
        <TokenSymbol
          token={data.token}
          erc20Address={data.erc20Address}
          hrc20Address={data.hrc20Address}
          network={data.network}
        />
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'amount',
      width: 120,
      render: (value, data) =>
        data.token === TOKEN.ERC721 || data.token === TOKEN.HRC721
          ? value.length
          : formatWithSixDecimals(value),
    },
    {
      title: 'Age',
      key: 'timestamp',
      dataIndex: 'timestamp',
      width: 160,
      render: value => {
        return <OperationAge date={value} />;
      },
    },
    {
      title: 'Txn fee',
      key: 'fee',
      dataIndex: 'fee',
      className: styles.rightHeader,
      width: 180,
      render: (value, data) => {
        return <OperationFee operation={data} />;
      },
    },
  ];

  if (manager) {
    columns.push({
      title: 'Actions',
      key: 'manager',
      dataIndex: 'manager',
      className: styles.rightHeader,
      width: 180,
      render: (value, data) => {
        return <ManageButton operation={data} />;
      },
    });
  }

  return columns;
};

export const StatusField = (props: {
  text: string;
  error?: boolean;
  statusText: string;
}) => {
  return (
    <Box direction="row" gap="4px">
      {props.text}:{' '}
      <span
        style={{
          fontWeight: 'bold',
          color: !props.error ? 'rgb(0, 201, 167)' : 'red',
        }}
      >
        {props.statusText}
      </span>
    </Box>
  );
};

export const StatisticBlock = observer(() => {
  return (
    <Box direction="row" gap="30px">
      <StatusField text="Validator status" statusText="OK" />
      <StatusField text="Stuck operations" statusText="NO" />
      <StatusField text="Need to restart" statusText="NO" />
    </Box>
  );
});

export const StatisticBlockLight = observer(() => {
  const { operations } = useStores();

  return (
    <Box direction="row" gap="30px">
      <StatusField
        text="status"
        error={operations.fetchStatus === 'error'}
        statusText={operations.fetchStatus === 'error' ? 'OFFLINE' : 'ONLINE'}
      />
    </Box>
  );
});
