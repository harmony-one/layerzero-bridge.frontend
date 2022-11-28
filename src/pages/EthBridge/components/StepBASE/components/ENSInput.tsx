import React, { useMemo, useState } from 'react';
import { useStores } from '../../../../../stores';
import { Input, isRequired } from '../../../../../components/Form';
import * as s from '../../ENSTokenModal/ENSTokenModal.styl';
import styled from 'styled-components';
import { BridgeControl } from '../../BridgeControl/BridgeControl';
import { observer } from 'mobx-react';
import { isENSOwner } from '../../../../../utils';
import { getTokenConfig } from '../../../../../config';
import { EXCHANGE_MODE } from '../../../../../stores/interfaces';

const BridgeControlStyled = styled(BridgeControl)`
  max-width: 180px;
`;

interface Props {}

export const ENSInput: React.FC<Props> = observer(() => {
  const { erc20Select, exchange, userMetamask } = useStores();

  const [ensName, setEnsName] = useState('');

  const tokenConfig = getTokenConfig(userMetamask.erc20Address);

  const ensValidator = useMemo(() => {
    if (!tokenConfig) {
      return undefined;
    }

    const contractAddress =
      exchange.mode === EXCHANGE_MODE.ETH_TO_ONE
        ? tokenConfig.erc20Address
        : tokenConfig.hrc20Address;

    return isENSOwner(userMetamask.ethAddress, contractAddress);
  }, [exchange.mode, tokenConfig, userMetamask.ethAddress]);

  return (
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
          rules={[isRequired, ensValidator]}
          // @ts-ignore
          onChange={setEnsName}
        />
      }
      bottomContent={null}
    />
  );
});

ENSInput.displayName = 'ENSInput';
