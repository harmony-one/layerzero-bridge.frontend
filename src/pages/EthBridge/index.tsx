import * as React from 'react';
import { useEffect } from 'react';
import { Box } from 'grommet';

import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { TOKEN } from 'stores/interfaces';
import { LayoutCommon } from '../../components/Layouts/LayoutCommon/LayoutCommon';
import { ethBridgeStore } from './EthBridgeStore';
import { StepManager } from './components/StepManager/StepManager';
import { Form } from '../../components/Form';

export const EthBridge = observer((props: any) => {
  const {
    user,
    exchange,
    routing,
    userMetamask,
    tokens,
    erc20Select,
  } = useStores();

  useEffect(() => {
    tokens.init();
    tokens.fetch();
  }, []);

  useEffect(() => {
    if (!props.match.params.token) {
      return;
    }

    const tokenTypeFromUrl = props.match.params.token;

    const token = exchange.getDefaultToken();

    if (![TOKEN.ERC20, TOKEN.ETH, TOKEN.ONE].includes(tokenTypeFromUrl)) {
      routing.push(TOKEN.ONE);
      erc20Select.setToken(token.erc20Address);
      return;
    }

    exchange.setToken(tokenTypeFromUrl);
    erc20Select.setToken(token.erc20Address);

    if (TOKEN.ETH === tokenTypeFromUrl) {
      user.setHRC20Token(process.env.ETH_HRC20);
      userMetamask.setTokenDetails({
        name: 'ETH',
        decimals: '18',
        erc20Address: '',
        symbol: 'ETH',
      });
    }

    if (props.match.params.operationId) {
      exchange.setOperationId(props.match.params.operationId);
      exchange.sendOperation(props.match.params.operationId);
    }
  }, []);

  return (
    <LayoutCommon>
      <Box
        direction="column"
        wrap={true}
        fill={true}
        justify="center"
        align="center"
        style={{ maxWidth: '580px' }}
      >
        <Form
          style={{ width: 'inherit' }}
          ref={ref => (ethBridgeStore.formRef = ref)}
          data={exchange.transaction}
        >
          <StepManager />
        </Form>
      </Box>
    </LayoutCommon>
  );
});
