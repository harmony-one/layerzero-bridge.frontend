import React, { useCallback, useEffect } from 'react';
import * as s from './StepBASE.styl';
import { NetworkRow } from './components/NetworkRow/NetworkRow';
import { TokenRow } from './components/TokenRow/TokenRow';
import { Box } from 'grommet';
import { Destination } from './components/Destination/Destination';
import { Button } from '../../../../components/Base';
import { ethBridgeStore } from '../../EthBridgeStore';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';
import { Divider } from '../../../../components/Divider/Divider';
import { ModalIds, ModalRegister } from '../../../../modals';
import { autorun } from 'mobx';
import { EXCHANGE_MODE, TOKEN } from '../../../../stores/interfaces';
import { StepContainer } from '../StepContainer';
import { WalletNetworkWarn } from './components/WalletNetworkWarn';
import { SwitchNetworkButton } from '../SwitchNetworkButton';
import { MetamaskButton } from '../../../../components/MetamaskButton';
import { ENSTokenModal } from '../ENSTokenModal/ENSTokenModal';
import { TokenChooseModal } from '../TokenChooseModal/TokenChooseModal';
import { getTokenConfig } from '../../../../configs';

interface Props { }

export const StepBASE: React.FC<Props> = observer(() => {
  const { exchange, userMetamask } = useStores();

  const token = exchange.tokenInfo.address ? getTokenConfig(exchange.tokenInfo.address): null;

  const handleClickContinue = useCallback(() => {
    const conf = exchange.step.buttons[0];
    exchange
      .onClickHandler(conf.validate, conf.onClick, ethBridgeStore)
      .catch(err => {
        console.log('### BaseStep Error', err);
      });
  }, [exchange]);

  useEffect(() => {
    autorun(() => {
      if (exchange.token && exchange.mode && exchange.network) {
        if (ethBridgeStore.formRef) {
          ethBridgeStore.formRef.resetTouched();
          ethBridgeStore.formRef.resetErrors();
          ethBridgeStore.addressValidationError = '';
        }

        if (
          exchange.token === TOKEN.ERC721 ||
          exchange.token === TOKEN.HRC721
        ) {
          exchange.transaction.amount = ['0'];
        } else {
          // debugger;
          // exchange.transaction.amount = '';
        }

        if (
          exchange.token === TOKEN.ERC1155 ||
          exchange.token === TOKEN.HRC1155
        ) {
          exchange.transaction.hrc1155TokenId = '0';
        }
      }
    });
  }, []);

  const handleClickMetamask = useCallback(() => {
    if (userMetamask.isAuthorized) {
      // return userMetamask.signOut();
    }

    return userMetamask.signIn();
  }, [userMetamask]);

  return (
    <StepContainer>
      <Box pad={{ vertical: '24px' }}>
        <NetworkRow />
      </Box>
      {!userMetamask.isAuthorized && (
        <Box
          direction="column"
          justify="center"
          pad={{ horizontal: '80px', vertical: '20px' }}
        >
          <MetamaskButton active={true} onClick={handleClickMetamask} />
        </Box>
      )}

      {userMetamask.isAuthorized && !userMetamask.isNetworkActual && (
        <Box
          direction="column"
          justify="center"
          align="center"
          gap="16px"
          pad={{ horizontal: '30px', vertical: '20px' }}
        >
          <WalletNetworkWarn />
          {!userMetamask.isNetworkActual && userMetamask.isAuthorized && (
            <Box>
              <SwitchNetworkButton />
            </Box>
          )}
        </Box>
      )}

      <Divider />
      <Box pad={{ vertical: '30px' }}>
        <TokenRow />
      </Box>
      <Divider />
      <Box align="center" pad={{ vertical: '30px', horizontal: '20px' }}>
        <Destination />
      </Box>

      {!!token?.legacy &&
        (exchange.mode === EXCHANGE_MODE.ONE_TO_ETH ?
          <Box align='center' justify='center' margin={{ bottom: "large"}} >
            This token is depegged. Please convert it to USDC.e via
            <a href={`https://usdc-converter.web.app/?token=${token.hrc20Address}`} target='_blank'>
              converter app
            </a>
          </Box> :
          <Box align='center' justify='center' margin={{ bottom: "large"}}>
            This token is depegged. Please use USDC.e instead
          </Box>
        )
      }

      {token?.legacy ?
        null :
        <Box direction="row" height="66px">
          <Button
            fontSize="14px"
            className={s.buttonContainer}
            buttonClassName={s.bridgeButton}
            onClick={handleClickContinue}
          >
            Continue
          </Button>
        </Box>}
      <ModalRegister
        modalId={ModalIds.BRIDGE_ENS_TOKEN}
        layerProps={{ full: 'vertical' }}
      >
        <ENSTokenModal />
      </ModalRegister>
      <ModalRegister
        modalId={ModalIds.BRIDGE_TOKEN_CHOOSE}
        layerProps={{ full: 'vertical' }}
      >
        <TokenChooseModal />
      </ModalRegister>
    </StepContainer>
  );
});

StepBASE.displayName = 'StepBASE';
