import * as React from 'react';
import { useState } from 'react';
import { Box, Image } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Icon, Text } from 'components/Base';
import { useStores } from 'stores';
import { formatWithSixDecimals } from 'utils';
import { EXCHANGE_MODE, NETWORK_TYPE, TOKEN } from '../../stores/interfaces';
import { Price } from '../Explorer/Components';
import { getNetworkBaseToken, getNetworkName } from '../../stores/names';
import { useMediaQuery } from 'react-responsive';
import styled from 'styled-components';
import { getBech32Address } from '../../blockchain-bridge';
import { AssetRowAddress, AssetRowCustom, AssetRowSimple } from './AssetRow';

const LiquidityWarning = styled(Box)`
  background-color: #e65454;
  padding: 12px;
  color: #ebf3f9;
  border-radius: 7px;
  text-align: center;
`;

// const DataItem = (props: {
//   text: any;
//   label: string;
//   icon: string;
//   iconSize: string;
//   color?: string;
//   link?: string;
// }) => {
//   return (
//     <Box direction="row" justify="between" gap="10px">
//       <Box direction="row" justify="start" align="center" gap="5px">
//         <Icon
//           glyph={props.icon}
//           size={props.iconSize}
//           color={props.color || '#1c2a5e'}
//           style={{ marginBottom: 2, width: 20 }}
//         />
//         <Text color="#1c2a5e" size={'small'}>
//           {props.label}
//         </Text>
//       </Box>
//       {props.link ? (
//         <a
//           href={props.link}
//           target="_blank"
//           style={{ color: props.color || '#1c2a5e' }}
//         >
//           <Text color={props.color || '#1c2a5e'} size={'small'} bold={true}>
//             {props.text}
//           </Text>
//         </a>
//       ) : (
//         <Text color={props.color || '#1c2a5e'} size={'small'} bold={true}>
//           {props.text}
//         </Text>
//       )}
//     </Box>
//   );
// };

export const Details = observer<{ showTotal?: boolean; children?: any }>(
  ({ showTotal, children }) => {
    const { exchange, tokens, userMetamask, user } = useStores();
    const [isShowDetail, setShowDetails] = useState(false);
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

    const [exPrice, setExPrice] = useState(0);

    const isETH = exchange.mode === EXCHANGE_MODE.ETH_TO_ONE;

    // React.useEffect(() => {
    //   const { operation } = exchange;

    //   if (isETH) {
    //     const methods = getExNetworkMethods();
    //     methods.ethMethodsERC20.getFee(
    //       operation.erc20Address,
    //       userMetamask.ethAddress,
    //       operation.amount,
    //       userMetamask.erc20TokenDetails.decimals
    //     ).then(fee => setExPrice(fee));
    //   } else {
    //     hmyMethodsERC20Web3.getFee(
    //       operation.hrc20Address,
    //       user.address,
    //       operation.amount,
    //       userMetamask.erc20TokenDetails.decimals
    //     ).then(fee => setExPrice(fee));
    //   }
    // }, [isETH])

    const getAmount = () => {
      switch (exchange.token) {
        case TOKEN.ERC20:
          return (
            <AssetRowSimple
              label={`${String(
                userMetamask.erc20TokenDetails &&
                  userMetamask.erc20TokenDetails.symbol,
              ).toUpperCase()} amount`}
              value={formatWithSixDecimals(
                exchange.transaction.amount.toString(),
              )}
            />
          );

        case TOKEN.HRC721:
        case TOKEN.ERC721:
          return (
            <>
              {Array.isArray(exchange.transaction.amount)
                ? exchange.transaction.amount.map((amount, idx) => (
                    <AssetRowSimple
                      key={idx}
                      label={`${String(
                        userMetamask.erc20TokenDetails &&
                          userMetamask.erc20TokenDetails.symbol,
                      ).toUpperCase()} token ID`}
                      value={amount}
                      copy
                    />
                  ))
                : null}
            </>
          );

        case TOKEN.ETH:
          return (
            <AssetRowSimple
              label={`${getNetworkBaseToken(exchange.network)} amount`}
              value={formatWithSixDecimals(
                exchange.transaction.amount.toString(),
              )}
            />
          );

        default:
          return (
            <AssetRowSimple
              label={`${String(exchange.token).toUpperCase()} amount`}
              value={formatWithSixDecimals(
                exchange.transaction.amount.toString(),
              )}
            />
          );
      }
    };

    const getImage = () => {
      if (exchange.transaction.nftImageUrl !== '') {
        return (
          <Box margin={{ bottom: '20px' }} align="center">
            <Box width="small" direction="row" margin={{ bottom: '5px' }}>
              <Image fit="cover" src={exchange.transaction.nftImageUrl} />
            </Box>
            <Box direction="row">
              <Text size="small" bold={true}>
                {exchange.transaction.nftName}
              </Text>
            </Box>
          </Box>
        );
      }
      return '';
    };

    const hasLiquidity = tokens.hasLiquidity(exchange.transaction.erc20Address);

    return (
      <Box direction="column">
        <AssetRowAddress
          label={`${getNetworkBaseToken(exchange.network)} address`}
          address={exchange.transaction.ethAddress}
          link={`${exchange.config.explorerURL}/token/${exchange.transaction.ethAddress}`}
        />
        <AssetRowAddress
          label="ONE address"
          address={exchange.transaction.oneAddress}
          link={`${process.env.HMY_EXPLORER_URL}/address/${getBech32Address(
            exchange.transaction.oneAddress,
          )}?activeTab=3`}
        />
        {getAmount()}

        {getImage()}

        {exchange.mode === EXCHANGE_MODE.ONE_TO_ETH ? (
          <AssetRowCustom label="Comission amount">
            {!exchange.isDepositAmountLoading ? (
              <Price
                value={Number(exchange.depositAmount.toFixed(2))}
                isEth={false}
                boxProps={{ pad: {} }}
                network={NETWORK_TYPE.HARMONY}
              />
            ) : (
              <Text>...loading</Text>
            )}
          </AssetRowCustom>
        ) : null}

        {/*<DataItem*/}
        {/*  icon="User"*/}
        {/*  iconSize="16px"*/}
        {/*  text={truncateAddressString(exchange.transaction.oneAddress)}*/}
        {/*  label="ONE address:"*/}
        {/*  link={EXPLORER_URL + `/address/${exchange.transaction.oneAddress}`}*/}
        {/*/>*/}

        {children ? <Box direction="column">{children}</Box> : null}

        {/*{!hasLiquidity ? (*/}
        {/*  <Box pad="small">*/}
        {/*    <LiquidityWarning>*/}
        {/*      Caution: This token doesn't have liquidity*/}
        {/*    </LiquidityWarning>*/}
        {/*  </Box>*/}
        {/*) : null}*/}

        {showTotal ? (
          <Box
            direction="column"
            pad={{ top: 'small' }}
            style={{ borderTop: '1px solid #dedede' }}
          >
            <AssetRowCustom label="Network Fee (total)">
              {!exchange.isFeeLoading ? (
                <Price
                  value={exchange.networkFee}
                  isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
                  boxProps={{ pad: {} }}
                  network={exchange.network}
                />
              ) : (
                <Text>...loading</Text>
              )}
            </AssetRowCustom>

            {!isShowDetail && !exchange.isFeeLoading ? (
              <Box
                direction="row"
                justify="end"
                margin={{ top: '-10px' }}
                onClick={() => setShowDetails(true)}
              >
                <Icon
                  size="14px"
                  glyph="ArrowDown"
                  style={{ marginRight: 10 }}
                />
                <Text size="small">Show more details</Text>
              </Box>
            ) : null}

            {!exchange.isFeeLoading &&
            exchange.mode === EXCHANGE_MODE.ONE_TO_ETH &&
            isShowDetail ? (
              <div style={{ opacity: 1 }}>
                <AssetRowCustom label="Approve">
                  <Price
                    value={0.97219}
                    isEth={false}
                    boxProps={{ pad: {} }}
                    network={exchange.network}
                  />
                </AssetRowCustom>
                {exchange.token === TOKEN.HRC721 ? (
                  <AssetRowCustom label="Lock Token">
                    <Price
                      value={0.0067219}
                      isEth={false}
                      boxProps={{ pad: {} }}
                      network={exchange.network}
                    />
                  </AssetRowCustom>
                ) : (
                  <AssetRowCustom label="Burn">
                    <Price
                      value={0.97219}
                      isEth={false}
                      boxProps={{ pad: {} }}
                      network={exchange.network}
                    />
                  </AssetRowCustom>
                )}
                <AssetRowCustom label={getNetworkName(exchange.network) + ' gas'}>
                  <Price
                    value={Number(exchange.depositAmount.toFixed(2))}
                    isEth={false}
                    boxProps={{ pad: {} }}
                    network={exchange.network}
                  />
                </AssetRowCustom>
              </div>
            ) : null}

            {!exchange.isFeeLoading &&
            exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
            isShowDetail ? (
              <div style={{ opacity: 1 }}>
                <AssetRowCustom label="Approve (~50000 gas)">
                  <Price
                    value={exchange.networkFee / 2}
                    isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
                    boxProps={{ pad: {} }}
                    network={exchange.network}
                  />
                </AssetRowCustom>
                {exchange.token === TOKEN.HRC721 ? (
                  <AssetRowCustom label="Burn token (~50000 gas)">
                    <Price
                      value={exchange.networkFee / 2}
                      isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
                      boxProps={{ pad: {} }}
                      network={exchange.network}
                    />
                  </AssetRowCustom>
                ) : (
                  <AssetRowCustom label="Lock token (~500000 gas)">
                    <Price
                      value={exchange.networkFee * 2.8}
                      isEth={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
                      boxProps={{ pad: {} }}
                      network={exchange.network}
                    />
                  </AssetRowCustom>
                )}
              </div>
            ) : null}

            {isShowDetail ? (
              <Box
                direction="row"
                justify="end"
                onClick={() => setShowDetails(false)}
              >
                <Icon size="14px" glyph="ArrowUp" style={{ marginRight: 10 }} />
                <Text size="small">Hide details</Text>
              </Box>
            ) : null}

            {/*<AssetRow*/}
            {/*  label="Total"*/}
            {/*  value={formatWithSixDecimals(*/}
            {/*    Number(exchange.transaction.amount) + exchange.networkFee,*/}
            {/*  )}*/}
            {/*/>*/}
          </Box>
        ) : null}

        {exchange.txHash ? (
          <Box direction="column" margin={{ top: 'large' }}>
            <AssetRowAddress
              label="Transaction hash"
              address={exchange.txHash}
              link=""
            />
          </Box>
        ) : null}
      </Box>
    );
  },
);

Details.displayName = 'Details';
