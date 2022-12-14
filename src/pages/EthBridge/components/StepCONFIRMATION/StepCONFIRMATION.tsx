import React, { useCallback } from 'react';
import { Details } from '../../../Exchange/Details';
import { Box } from 'grommet/components/Box';
import { EXCHANGE_MODE } from '../../../../stores/interfaces';
import { Button, Text } from '../../../../components/Base';
import { observer } from 'mobx-react';
import { useStores } from '../../../../stores';
import * as s from '../StepBASE/StepBASE.styl';
import cn from 'classnames';
import { ethBridgeStore } from '../../EthBridgeStore';
import { Networks } from '../Networks/Networks';
import { Divider } from '../../../../components/Divider/Divider';
import { StepContainer } from '../StepContainer';
import { StatusWarning } from 'grommet-icons';

interface Props {}

export const StepCONFIRMATION: React.FC<Props> = observer(() => {
  const { exchange, userMetamask } = useStores();

  const handleClickBack = useCallback(() => {
    const conf = exchange.step.buttons[0];
    exchange.onClickHandler(conf.validate, conf.onClick, ethBridgeStore);
  }, [exchange]);

  const handleClickContinue = useCallback(() => {
    const conf = exchange.step.buttons[1];
    exchange.onClickHandler(conf.validate, conf.onClick, ethBridgeStore);
  }, [exchange]);

  const isBalanceEnough =
    exchange.networkFee <= Number(userMetamask.balance) / 1e18;

  return (
    <StepContainer>
      <Networks />

      <Divider />

      {!isBalanceEnough && (
        <Box
          direction="row"
          gap="xsmall"
          align="center"
          justify="center"
          margin={{ top: 'medium' }}
        >
          <StatusWarning color="#FF0000" />

          <Text color="Red500" style={{ textAlign: 'right' }}>
            You don't have enough balance
          </Text>
        </Box>
      )}

      <Box pad="60px">
        <Details showTotal={true} />
        <>
          {exchange.mode === EXCHANGE_MODE.ETH_TO_ONE ? (
            <Box
              direction="row"
              justify="end"
              fill={true}
              margin={{ top: 'small' }}
            >
              <Text color="Red500" style={{ textAlign: 'right' }}>
                The metamask may ask you to sign with slightly higher fee due to
                500000 gas limit estimate, however you will be charged similar
                to the above estimate based on the actual gas used.
              </Text>
            </Box>
          ) : null}
          <Box
            direction="row"
            justify="end"
            margin={{
              top: 'medium',
            }}
            fill={true}
          >
            <Text color="Red500" style={{ textAlign: 'right' }}>
              You will be prompted to sign several transactions
            </Text>
          </Box>
        </>
      </Box>
      <Box direction="row" height="66px">
        <Button
          fontSize="14px"
          className={s.buttonContainer}
          buttonClassName={cn(s.bridgeButton, s.reset)}
          onClick={handleClickBack}
        >
          Back
        </Button>
        <Button
          fontSize="14px"
          disabled={!isBalanceEnough}
          className={s.buttonContainer}
          buttonClassName={s.bridgeButton}
          onClick={handleClickContinue}
        >
          Confirm
        </Button>
      </Box>
    </StepContainer>
  );
});

StepCONFIRMATION.displayName = 'StepCONFIRMATION';
