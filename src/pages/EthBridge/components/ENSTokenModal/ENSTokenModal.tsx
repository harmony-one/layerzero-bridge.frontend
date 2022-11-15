import React, { useCallback, useEffect, useState } from 'react';
import { Box } from 'grommet/components/Box';
import * as s from './ENSTokenModal.styl';
import { Icon, Text } from '../../../../components/Base';
import { Button as GrommetButton } from 'grommet/components/Button';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';
import { Grid } from 'grommet';
import { Button } from 'components/Base';
import { Form, Input, isRequired } from '../../../../components/Form';
import { ModalContent } from '../../../../components/ModalContent';

const OpenSeaBadge: React.FC = () => {
  return (
    <svg width="186.5" height="28" role="img" aria-label="VERIFIED BY: OPENSEA">
      <clipPath id="r">
        <rect width="186.5" height="28" rx="3" fill="#fff" />
      </clipPath>
      <g clip-path="url(#r)" shape-rendering="crispEdges">
        <rect width="101.75" height="28" fill="#555" />
        <rect x="101.75" width="84.75" height="28" fill="#0083e9" />
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
  );
};

interface Props {
  onClose?: () => void;
}

export const ENSTokenModal: React.FC<Props> = observer(({ onClose }) => {
  const { erc20Select, exchange, routing } = useStores();
  const [contractAddress, setContractAddress] = useState('');

  const [ensName, setEnsName] = useState('');

  useEffect(() => setContractAddress(erc20Select.tokenAddress), [
    erc20Select.tokenAddress,
  ]);

  const handleClickContinue = useCallback(async () => {
    await erc20Select.setENSToken(ensName);

    if (!erc20Select.error) {
      routing.closeModal();
    }
  }, [ensName, erc20Select, routing]);

  const showOpenSeaBadge =
    contractAddress !== '' &&
    erc20Select.erc20VerifiedInfo &&
    erc20Select.erc20VerifiedInfo.collection.safelist_request_status ===
      'verified' &&
    erc20Select.erc20VerifiedInfo.address === contractAddress;

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
            <Icon glyph="Close" />
          </GrommetButton>
        </Box>
        <ModalContent direction="column" fill="horizontal" pad="30px">
          <Box margin={{ top: 'xsmall', bottom: 'medium' }}>
            <Text color="NGray4">ENS</Text>
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
          </Box>
          <Box>
            <Button
              disabled={erc20Select.isLoading}
              onClick={handleClickContinue}
            >
              Continue
            </Button>
          </Box>

          {/*<Box margin={{ top: 'xsmall', bottom: 'medium' }}>*/}
          {/*  <Text color="NGray4">Input ENS contract address</Text>*/}
          {/*  <TextInput*/}
          {/*    disabled={erc20Select.isLoading}*/}
          {/*    placeholder="0x..."*/}
          {/*    wrapperProps={{ className: s.input }}*/}
          {/*    value={contractAddress}*/}
          {/*    // @ts-ignore*/}
          {/*    onChange={setContractAddress}*/}
          {/*  />*/}
          {/*</Box>*/}
          <Grid columns={['1/2', '1/2']}>
            <Box direction="column" align="start">
              {showOpenSeaBadge && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://opensea.io/collection/${erc20Select.erc20VerifiedInfo.collection.slug}`}
                >
                  <OpenSeaBadge />
                </a>
              )}
            </Box>
            {/*<Box direction="column" align="end">*/}
            {/*  {erc20Select.isLoading ? (*/}
            {/*    <Spinner color="#fff" boxSize={12} />*/}
            {/*  ) : (*/}
            {/*    <Button*/}
            {/*      disabled={erc20Select.isLoading}*/}
            {/*      onClick={async () => erc20Select.setToken(contractAddress)}*/}
            {/*    >*/}
            {/*      {contractAddress ? 'Change token' : 'Select token'}*/}
            {/*    </Button>*/}
            {/*  )}*/}
            {/*</Box>*/}
          </Grid>

          {erc20Select.error ? (
            <Box margin="xsmall">
              <Text color="red">{erc20Select.error}</Text>
            </Box>
          ) : null}

          {erc20Select.isOk ? (
            <Box margin="10px">
              <Text color="green">Token selected successfully</Text>
            </Box>
          ) : null}
        </ModalContent>

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

ENSTokenModal.displayName = 'CustomTokenModal';
