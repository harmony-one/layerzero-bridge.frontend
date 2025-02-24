import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { Box, Grid } from 'grommet';
import { HeaderTab } from './components/HeaderTab/HeaderTab';
import { useStores } from '../../stores';
import { ThemeButton } from '../ThemeButton';
import { ThemeContext } from '../../themes/ThemeContext';
import { InfoNew2 } from '../InfoNew';
import { MoreMenu } from './components/MoreMenu';

const HarmonyLogo = () => {
  const themeContext = useContext(ThemeContext);

  const src =
    themeContext.themeType === 'dark'
      ? 'harmony-logo-white.svg'
      : 'harmony-logo-blue.svg';

  return (
    <Box direction='row' align="center" gap="20px">
      <img height="30px" width="200px" alt="harmony logo" src={src} />
      |
      <Box direction='row' align="center">
        <p
          style={{
            whiteSpace: 'nowrap',
            margin: "1px 9px 0 0"
          }}
        >
          {/* [ */}
          {/* <img height="50px" alt="lz logo" src="https://img.cryptorank.io/coins/layer_zero1668092808242.png" /> */}
          powered by
          {/* ] */}
        </p>
        <img height="30px" width="200px" alt="lz logo" src={
          themeContext.themeType === 'dark'
            ? "https://layerzero.network/static/logo.svg"
            : "https://docs.layerzero.network/img/LayerZero_Logo_Black.svg"
        }
        />
      </Box>
    </Box>
  );
};

const StyledGrid = styled(Grid)`
  grid-template-columns: 50% 50%;
  grid-template-areas: 'logo account' 'menu menu';
  row-gap: 12px;

  @media (min-width: 1024px) {
    height: 74px;
    grid-template-columns: 210px auto 210px;
    grid-template-areas: 'logo menu account';
  }
`;

interface Props { }

export const Header: React.FC<Props> = React.memo(() => {
  const { actionModals } = useStores();

  const openTerms = useCallback(() => {
    actionModals.open(() => <InfoNew2 title="Important Notice" />, {
      title: 'Important Notice',
      applyText: 'Agreed',
      closeText: '',
      noValidation: true,
      width: '800px',
      showOther: true,
      applyButtonProps: {
        style: { padding: '12px 40px' },
      },
      onApply: () => {
        return Promise.resolve();
      },
    });
  }, []);

  return (
    <StyledGrid align="center">
      <Box flex={{ grow: 0, shrink: 0 }} gridArea="logo" basis="150px">
        <HarmonyLogo />
      </Box>
      <Box
        gridArea="menu"
        justify="center"
        direction="row"
        alignSelf="end"
        gap="12px"
        wrap
      >
        <HeaderTab title="Bridge" to="/erc20" />
        <HeaderTab title="Assets" to="/tokens" />
        {/*<HeaderTab title="iToken" to="/itokens" />*/}
        <HeaderTab title="All Transactions" to="/explorer" />
        <HeaderTab
          title="Help"
          to="https://docs.harmony.one/home/general/bridges/layerzero-bridge"
          external
        />
        <HeaderTab title="Support" to="/support" />
        <HeaderTab title="Terms of Services" onClick={openTerms} />
      </Box>
      <Box
        gridArea="account"
        flex={{ grow: 0, shrink: 0 }}
        align="center"
        basis="150px"
        justify="end"
        direction="row"
      >
        <ThemeButton />
        <MoreMenu />
      </Box>
    </StyledGrid>
  );
});

Header.displayName = 'Header';
