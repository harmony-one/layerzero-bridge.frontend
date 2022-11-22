import React, { useState } from 'react';
import { useStores } from '../../../../../stores';
import { Input, isRequired } from '../../../../../components/Form';
import * as s from '../../ENSTokenModal/ENSTokenModal.styl';
import styled from 'styled-components';
import { BridgeControl } from '../../BridgeControl/BridgeControl';
import { observer } from 'mobx-react';
import { isENSOwner, isENSRecordExist } from '../../../../../utils';

const BridgeControlStyled = styled(BridgeControl)`
  max-width: 180px;
`;

interface Props {}

export const ENSInput: React.FC<Props> = observer(() => {
  const { erc20Select, userMetamask } = useStores();

  const [ensName, setEnsName] = useState('');

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
          rules={[
            isRequired,
            isENSRecordExist(),
            isENSOwner(userMetamask.ethAddress),
          ]}
          // @ts-ignore
          onChange={setEnsName}
        />
      }
      bottomContent={null}
    />
  );
});

ENSInput.displayName = 'ENSInput';
