import * as React from 'react';
import { Box } from 'grommet';
import { NumberInput } from 'components/Form/Fields';
import { isRequired } from 'components/Form/validations';
import { Button, Text } from 'components/Base';
import { useStores } from 'stores';
import { observer } from 'mobx-react-lite';
import { CloseIcon, SliceTooltip } from 'ui';
import { TOKEN } from '../../stores/interfaces';

export const TokensField = observer<{ label: string; maxTokens: string }>(
  (params: { label: string; maxTokens: string }) => {
    const { exchange } = useStores();

    const isMultiToken = Array.isArray(exchange.transaction.amount);
    const tokenIds = Array.isArray(exchange.transaction.amount)
      ? exchange.transaction.amount
      : [];

    return (
      <>
        <Text color="NGray4">
          {exchange.token === TOKEN.HRC721 ? (
            <>
              <SliceTooltip value={params.label} maxLength={18} /> Token ID
            </>
          ) : (
            <>
              <SliceTooltip value={params.label} maxLength={18} /> Token IDs
            </>
          )}
        </Text>
        <Box direction="column" align="end" fill={true}>
          {isMultiToken
            ? tokenIds.map((t, idx) => (
                <Box
                  direction="row"
                  justify="between"
                  key={String(idx)}
                  style={{ width: '100%' }}
                  fill={true}
                >
                  <div style={{ width: '100%' }}>
                    <NumberInput
                      name={`amount[${idx}]`}
                      type="integerString"
                      delimiter="."
                      placeholder="0"
                      style={{ width: '100%', padding: '8px 8px' }}
                      rules={[isRequired]}
                    />
                  </div>
                  {!!idx ? (
                    <Box
                      margin={{ horizontal: 'medium', top: '15px' }}
                      align="start"
                      onClick={() => {
                        if (isMultiToken && tokenIds.length > 1) {
                          exchange.transaction.amount = tokenIds.filter(
                            (a, id) => id !== idx,
                          );
                        }
                      }}
                    >
                      <CloseIcon hover={true} />
                    </Box>
                  ) : null}
                </Box>
              ))
            : null}
          {exchange.token !== TOKEN.HRC721 && (
            <Button
              style={{ width: 180, top: 10 }}
              onClick={() => {
                if (
                  isMultiToken &&
                  tokenIds.length < Number(params.maxTokens)
                ) {
                  Array.isArray(exchange.transaction.amount) &&
                    exchange.transaction.amount.push('0');
                }
              }}
            >
              Add Token Id
            </Button>
          )}
        </Box>
      </>
    );
  },
);
