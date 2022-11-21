import React, { useEffect, useState } from 'react';
import { useStores } from '../../../../../stores';
import { Form, Input, isRequired } from '../../../../../components/Form';
import { Box } from 'grommet/components/Box';
import { Text } from '../../../../../components/Base';
import { Button } from 'components/Base';
import * as s from '../../ENSTokenModal/ENSTokenModal.styl';
import styled from 'styled-components';
import { BridgeControl } from '../../BridgeControl/BridgeControl';
import { observer } from 'mobx-react';

const BridgeControlStyled = styled(BridgeControl)`
  max-width: 180px;
`;

interface Props {}

export const ENSInput: React.FC<Props> = observer(() => {
  const { erc20Select, exchange } = useStores();

  const [ensName, setEnsName] = useState('');

  const handleClickContinue = () => {
    erc20Select.setENSToken(ensName);
  };

  return (
    <Form style={{ width: 'auto' }} data={exchange.transaction}>
      <BridgeControlStyled
        title="Domain"
        gap="8px"
        centerContent={
          <Input
            name="ensName"
            disabled={erc20Select.isLoading}
            placeholder="Input ENS"
            wrapperProps={{ className: s.input }}
            value={ensName}
            rules={[isRequired]}
            // @ts-ignore
            onChange={setEnsName}
          />
        }
        bottomContent={
          <Box justify="center" align="center" gap="8px">
            {erc20Select.error ? (
              <Text align="center" color="red">
                {erc20Select.error}
              </Text>
            ) : null}
            {erc20Select.isOk ? (
              <Text align="center" color="green">
                Token selected successfully
              </Text>
            ) : null}
            <Button
              disabled={erc20Select.isLoading}
              onClick={handleClickContinue}
            >
              Continue
            </Button>
          </Box>
        }
      />
    </Form>
  );
});

ENSInput.displayName = 'ENSInput';
