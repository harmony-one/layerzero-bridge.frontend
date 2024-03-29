import React, { useCallback, useEffect, useState } from 'react';
import { Box } from 'grommet/components/Box';
import * as s from './CustomTokenModal.styl';
import { Icon, Text, Title } from '../../../../components/Base';
import { Button as GrommetButton } from 'grommet/components/Button';
import { TOKEN } from '../../../../stores/interfaces';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';
import { Grid } from 'grommet';
import { TextInput, Button } from 'components/Base';
import { Form, isRequired, NumberInput } from '../../../../components/Form';
import { Spinner } from '../../../../ui';
import cn from 'classnames';
import { TokensField } from '../../../Exchange/AmountField';
import { formatWithSixDecimals, moreThanZero } from '../../../../utils';
import {
  isMultiNFT,
  isNFT,
  isNotNFT,
} from '../../../../stores/Exchange/helpers';
import { getInputPlaceholder } from 'pages/Exchange/ERC20Select';

interface Props {
  onClose?: () => void;
}

export const CustomTokenModal: React.FC<Props> = observer(({ onClose }) => {
  const { erc20Select, exchange, actionModals } = useStores();
  const [erc20, setErc20] = useState('');
  const [hrc1155TokenId, setHrc1155TokenIdOri] = useState('');

  const setHrc1155TokenId = hrc1155TokenId => {
    erc20Select.hrc1155TokenId = hrc1155TokenId;
    setHrc1155TokenIdOri(hrc1155TokenId);
  };

  useEffect(() => setErc20(erc20Select.tokenAddress), [
    erc20Select.tokenAddress,
  ]);

  const _isNFT = isNFT(exchange.token);
  const _isMultiNFT = isMultiNFT(exchange.token);
  const _isOtherTokens = isNotNFT(exchange.token);

  return (
    <Form data={exchange.transaction}>
      <Box
        direction="column"
        align="center"
        width="408px"
        gap="12px"
        margin={{ top: 'large' }}
      >
        <Box alignSelf="end">
          <GrommetButton onClick={onClose}>
            <Icon glyph="Close" color="white" />
          </GrommetButton>
        </Box>
        <Box
          direction="column"
          fill="horizontal"
          className={s.layer}
          pad="30px"
        >
          <Box margin={{ top: 'xsmall', bottom: 'medium' }}>
            <Text color="NGray4">
              {getInputPlaceholder(exchange.network, exchange.token)}
            </Text>
            <TextInput
              disabled={erc20Select.isLoading}
              placeholder="0x..."
              wrapperProps={{ className: s.input }}
              value={erc20}
              // @ts-ignore
              onChange={setErc20}
            />
          </Box>
          {_isMultiNFT && (
            <>
              <Text color="NGray4">
                {exchange.token.toUpperCase()} token ID
              </Text>
              <Box margin={{ bottom: 'medium' }}>
                <div style={{ width: '100%' }}>
                  <NumberInput
                    disabled={erc20Select.isLoading}
                    name={`hrc1155TokenId`}
                    type="integerString"
                    delimiter="."
                    placeholder="0"
                    style={{ width: '100%' }}
                    rules={[isRequired]}
                    value={hrc1155TokenId}
                    onChange={setHrc1155TokenId}
                  />
                </div>
              </Box>
            </>
          )}
          <Grid columns={['1/2', '1/2']}>
            <Box direction="column" align="start">
              {erc20 !== '' &&
                erc20Select.erc20VerifiedInfo &&
                erc20Select.erc20VerifiedInfo.collection
                  .safelist_request_status === 'verified' &&
                erc20Select.erc20VerifiedInfo.address === erc20 && (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://opensea.io/collection/${erc20Select.erc20VerifiedInfo.collection.slug}`}
                  >
                    <svg
                      width="186.5"
                      height="28"
                      role="img"
                      aria-label="VERIFIED BY: OPENSEA"
                    >
                      <clipPath id="r">
                        <rect width="186.5" height="28" rx="3" fill="#fff" />
                      </clipPath>
                      <g clip-path="url(#r)" shape-rendering="crispEdges">
                        <rect width="101.75" height="28" fill="#555" />
                        <rect
                          x="101.75"
                          width="84.75"
                          height="28"
                          fill="#0083e9"
                        />
                      </g>
                      <g
                        fill="#fff"
                        text-anchor="middle"
                        font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
                        text-rendering="geometricPrecision"
                        font-size="100"
                      >
                        <text
                          transform="scale(.1)"
                          x="508.75"
                          y="175"
                          textLength="777.5"
                          fill="#fff"
                        >
                          VERIFIED BY
                        </text>
                        <text
                          transform="scale(.1)"
                          x="1441.25"
                          y="175"
                          textLength="607.5"
                          fill="#fff"
                          font-weight="bold"
                        >
                          OPENSEA
                        </text>
                      </g>
                    </svg>
                  </a>
                )}
            </Box>
            <Box direction="column" align="end">
              {erc20Select.isLoading ? (
                <Spinner color="#fff" boxSize={12} />
              ) : (
                <Button
                  disabled={erc20Select.isLoading}
                  onClick={async () => erc20Select.setToken(erc20)}
                >
                  {erc20 ? 'Change token' : 'Select token'}
                </Button>
              )}
            </Box>
          </Grid>

          {erc20Select.error ? (
            <Box margin="xsmall">
              <Text color="red">{erc20Select.error}</Text>
            </Box>
          ) : null}

          {erc20Select.error &&
          (erc20Select.error.includes('This HRC20 address corresponds') ||
            erc20Select.error.includes('This address already using for')) ? (
            <Box margin="10px" fill={true} align="end">
              <Button
                disabled={erc20Select.isLoading}
                onClick={async () => {
                  return actionModals.open(
                    () => (
                      <Box pad="large" gap="10px">
                        <Title>Confirm</Title>
                        {/*<Text>{erc20Select.error}</Text>*/}
                        <Text>
                          Are you sure the HRC20 address you are using is not a
                          bridged HRC20?
                        </Text>
                      </Box>
                    ),
                    {
                      title: '',
                      applyText: 'Yes, i confirm',
                      closeText: 'Cancel',
                      noValidation: true,
                      width: '500px',
                      showOther: true,
                      onApply: () => {
                        return erc20Select.setToken(erc20, true);
                      },
                    },
                  );
                }}
              >
                Use address anyway
              </Button>
            </Box>
          ) : null}

          {erc20Select.isOk ? (
            <Box margin="10px">
              <Text color="green">Token selected successfully</Text>
            </Box>
          ) : null}

          <Box
            direction="column"
            gap="2px"
            fill={true}
            margin={{ top: 'xlarge', bottom: 'large' }}
          >
            {_isNFT && (
              <TokensField
                label={exchange.tokenInfo.label}
                maxTokens={exchange.tokenInfo.maxAmount}
              />
            )}

            {false && _isMultiNFT && (
              <NumberInput
                label={`${exchange.tokenInfo.label} Amount`}
                name="amount"
                type="decimal"
                precision="0"
                delimiter="."
                placeholder="0"
                style={{ width: '100%' }}
                rules={[
                  isRequired,
                  moreThanZero,
                  (_, value, callback) => {
                    const errors = [];

                    if (
                      value &&
                      Number(value) > Number(exchange.tokenInfo.maxAmount)
                    ) {
                      const defaultMsg = `Exceeded the maximum amount`;
                      errors.push(defaultMsg);
                    }

                    callback(errors);
                  },
                ]}
              />
            )}

            {false && _isMultiNFT && (
              <Text size="small" style={{ textAlign: 'right' }}>
                <b>*Max Available</b> = {exchange.tokenInfo.maxAmount || '0'}{' '}
                {exchange.tokenInfo.label}
              </Text>
            )}

            {false && _isOtherTokens && (
              <NumberInput
                label={`${exchange.tokenInfo.label} Amount`}
                name="amount"
                type="decimal"
                precision="6"
                delimiter="."
                placeholder="0"
                style={{ width: '100%' }}
                rules={[
                  isRequired,
                  moreThanZero,
                  (_, value, callback) => {
                    const errors = [];

                    if (
                      value &&
                      Number(value) > Number(exchange.tokenInfo.maxAmount)
                    ) {
                      const defaultMsg = `Exceeded the maximum amount`;
                      errors.push(defaultMsg);
                    }

                    callback(errors);
                  },
                ]}
              />
            )}

            {false && _isOtherTokens && (
              <Text size="small" style={{ textAlign: 'right' }}>
                <b>*Max Available</b> ={' '}
                {formatWithSixDecimals(exchange.tokenInfo.maxAmount)}{' '}
                {exchange.tokenInfo.label}
              </Text>
            )}
          </Box>
        </Box>

        <Box>
          <GrommetButton className={s.buttonCustomToken} onClick={onClose}>
            <Text color="NWhite" size="xsmall">
              Close
            </Text>
          </GrommetButton>
        </Box>
      </Box>
    </Form>
  );
});

CustomTokenModal.displayName = 'CustomTokenModal';
