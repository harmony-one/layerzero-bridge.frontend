import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { ITextProps, Text } from 'components/Base';
import { Error } from 'ui';
import cn from 'classnames';
import * as styles from './feeds.styl';
import { useStores } from 'stores';
import {
  ACTION_TYPE,
  EXCHANGE_MODE,
  IAction,
  IOperation,
  STATUS,
  TOKEN,
} from 'stores/interfaces';
import { dateTimeFormat, truncateAddressString } from '../../utils';
import { getStepsTitle } from './steps-constants';
import axios from 'axios';
import styled from 'styled-components';
import { EntityStatus } from '../../components/EntityStatus';

const hmyRPCUrl = 'https://api.harmony.one';

export const getHmyTransactionByHash = async hash => {
  const res = await axios.post(hmyRPCUrl, {
    jsonrpc: '2.0',
    method: 'hmyv2_getTransactionByHash',
    params: [hash],
    id: 1,
  });

  if (!res.data?.result && res.data.error) {
    throw res.data.error.message;
  }

  return res.data.result;
};

export interface isLayerZeroOperation {
  srcUaAddress: string;
  dstUaAddress: string;
  updated: number;
  created: number;
  srcChainId: number;
  dstChainId: number;
  dstTxHash: string;
  dstTxError: null;
  srcTxHash: string;
  srcBlockHash: string;
  srcBlockNumber: string;
  srcUaNonce: number;
  status: string;
}

const statuses: Record<STATUS, string> = {
  waiting: 'Waiting',
  success: 'Success',
  in_progress: 'In progress',
  error: 'Error',
  canceled: 'Canceled',
};

const layerZeroStatusMap = {
  INFLIGHT: STATUS.IN_PROGRESS,
  DELIVERED: STATUS.SUCCESS,
  waiting: STATUS.WAITING,
};

const layerZeroStatus = {
  INFLIGHT: 'In progress',
  DELIVERED: 'Success',
  waiting: 'Waiting',
};

const getTextColor = props => {
  const colorMap: Record<TextState, string> = {
    pending: props.theme.palette.NGray3,
    completed: props.theme.textColor,
    active: props.theme.palette.Orange500,
  };

  return colorMap[props.state];
};

type TextState = 'pending' | 'active' | 'completed';

const StyledText = styled(Text)<ITextProps & { state?: TextState }>`
  color: ${props => getTextColor(props)};
`;

const StepRow = observer(
  ({
    operation,
    action,
    active,
    number,
    hrc20Address,
    token,
  }: {
    operation: IOperation;
    action: IAction;
    hrc20Address?: string;
    number: number;
    active: boolean;
    token: TOKEN;
  }) => {
    const { exchange } = useStores();

    const completed = action.status === STATUS.SUCCESS;

    // const [loaded, setLoaded] = React.useState(false);
    const [link, setLink] = React.useState('');
    const [lz, setLZ] = React.useState({
      status: STATUS.WAITING,
    } as isLayerZeroOperation);
    const [layerZeroHash, setLayerZeroHash] = React.useState('');

    const label =
      getStepsTitle(action.type, token, exchange.network) || action.type;

    // operation.actions[number - 1]?.status === STATUS.SUCCESS &&
    const isLayerZeroStep =
      action.type === ACTION_TYPE.unlockToken ||
      action.type === ACTION_TYPE.mintToken;

    const load = React.useCallback(
      async (stopRepeat = false) => {
        if (isLayerZeroStep) {
          const lzHash = exchange.operation.actions.find(
            a =>
              a.type === ACTION_TYPE.lockToken ||
              a.type === ACTION_TYPE.burnToken,
          ).transactionHash;

          setLayerZeroHash(lzHash);

          let hash = lzHash;

          if (operation.type === EXCHANGE_MODE.ONE_TO_ETH) {
            const res = await getHmyTransactionByHash(lzHash);
            hash = res.ethHash;
          }

          axios
            .get(`https://api-mainnet.layerzero-scan.com/tx/${hash}`)
            .then(res => {
              const lz: isLayerZeroOperation = res.data?.messages[0];

              if (!lz) {
                setLZ({ status: STATUS.WAITING } as any);
                // if (!stopRepeat) {
                //   setTimeout(() => load(true), 10000);
                // }
              } else {
                setLink(
                  `https://layerzeroscan.com/${lz.srcChainId}/address/${lz.srcUaAddress}/message/${lz.dstChainId}/address/${lz.dstUaAddress}/nonce/${lz.srcUaNonce}`,
                );
                setLZ(lz);
              }
            });
        }
      },
      [isLayerZeroStep, exchange.operation],
    );

    React.useEffect(() => {
      const intervalId = setInterval(() => load(), 10000);
      load();

      return () => clearInterval(intervalId);
    }, []);

    // if (isLayerZeroStep && !loaded) {
    //   return null;
    // }

    const textClassName = cn(
      styles.stepRow,
      active ? styles.active : '',
      completed ? styles.completed : '',
    );

    const textState: TextState = active
      ? 'active'
      : completed
      ? 'completed'
      : 'pending';

    const explorerUrl =
      (isEth(action.type)
        ? exchange.config.explorerURL
        : process.env.HMY_EXPLORER_URL) + '/tx/';

    return (
      <Box
        direction="column"
        style={{ paddingBottom: '8px', borderBottom: '1px solid #dedede' }}
        margin={{ bottom: '12px' }}
      >
        <StyledText state={textState}>{number + 1 + '. ' + label}</StyledText>
        <Box direction="row" justify="between">
          <Box direction="row" gap="8px">
            <StyledText state={textState}>Status: </StyledText>
            {isLayerZeroStep ? (
              <EntityStatus
                status={layerZeroStatusMap[lz.status]}
                label={layerZeroStatus[lz.status]}
              />
            ) : (
              <EntityStatus
                status={action.status}
                label={statuses[action.status]}
              />
            )}
          </Box>
          {action.timestamp && (
            <StyledText state={textState}>
              {dateTimeFormat(action.timestamp * 1000)}
            </StyledText>
          )}
        </Box>

        {isLayerZeroStep && link && (
          <Box direction="row" justify="between">
            <StyledText state={textState}>Layer zero tx:</StyledText>
            <a href={link} target="_blank">
              {truncateAddressString(layerZeroHash, 10)}
            </a>
          </Box>
        )}

        {action.transactionHash &&
        action.transactionHash !== 'skip' &&
        !isLayerZeroStep ? (
          <Box direction="row" justify="between">
            <StyledText state={textState}>Tx hash: </StyledText>
            <a href={explorerUrl + action.transactionHash} target="_blank">
              {truncateAddressString(action.transactionHash, 10)}
            </a>
          </Box>
        ) : null}

        {action.transactionHash &&
        action.transactionHash === 'skip' &&
        !isLayerZeroStep ? (
          <Box direction="row" justify="between">
            <StyledText state={textState}>Operation was skipped</StyledText>
          </Box>
        ) : null}

        {hrc20Address && (
          <>
            <Box
              direction="row"
              justify="between"
              align="center"
              className={textClassName}
            >
              <Box direction="row" align="center">
                <img
                  className={styles.imgToken}
                  style={{ height: 18 }}
                  src="/one.svg"
                />
                <Text>HRC20 address:</Text>
              </Box>
              <Box>
                <a
                  href={
                    process.env.HMY_EXPLORER_URL + '/address/' + hrc20Address
                  }
                  target="_blank"
                >
                  {truncateAddressString(hrc20Address, 10)}
                </a>
              </Box>
            </Box>
            {/*<AddTokenPanel />*/}
          </>
        )}

        {action.message && (
          <StyledText state={textState}>{action.message}</StyledText>
        )}
        {!isLayerZeroStep && action.error && <Error error={action.error} />}
        {isLayerZeroStep && lz.dstTxError && <Error error={lz.dstTxError} />}
      </Box>
    );
  },
);

StepRow.displayName = 'StepRow';

const isEth = type =>
  [
    'approveEthManger',
    'lockToken',
    'unlockToken',
    'unlockTokenRollback',
    'waitingBlockNumber',

    // HRC20
    'approveHRC20EthManger',
    'getERC20Address',
    'burnHRC20Token',
    'mintHRC20Token',
    'mintHRC20TokenRollback',

    // HRC721
    'getHRC721Address',
    'approveHRC721EthManger',
    'getHRC721Address',
    'burnHRC721Token',
    'mintHRC721Token',
    'mintHRC721TokenRollback',

    // HRC1155
    'getHRC1155Address',
    'approveHRC1155EthManger',
    'getHRC1155Address',
    'burnHRC1155Token',
    'mintHRC1155Token',
    'mintHRC1155TokenRollback',

    // ERC1155
    'approveERC1155EthManger',
    'lockERC1155Token',
    'unlockERC1155Token',
    'unlockERC1155TokenRollback',
  ].includes(type);

export const Steps = observer(() => {
  const { exchange, user } = useStores();

  if (!exchange.operation) {
    return null;
  }

  const steps = exchange.operation.actions;

  return (
    <Box direction="column" className={styles.stepsContainer}>
      {steps.map((action, idx) => (
        <StepRow
          key={action.id}
          operation={exchange.operation}
          action={action}
          number={idx}
          token={exchange.operation.token}
          active={
            action.status === STATUS.IN_PROGRESS ||
            (action.status === STATUS.WAITING &&
              (!!idx ? steps[idx - 1].status === STATUS.SUCCESS : true))
          }
          hrc20Address={
            action.type === ACTION_TYPE.getHRC20Address ? user.hrc20Address : ''
          }
        />
      ))}
    </Box>
  );
});

Steps.displayName = 'Steps';
