import React, { useContext } from 'react';
import { Box, Menu } from 'grommet';
import { ThemeContext } from '../../../themes/ThemeContext';
import { MoreVertical } from 'grommet-icons';

const MenuLabel: React.FC = ({ children }) => {
  return <Box pad={{ horizontal: '16px' }}>{children}</Box>;
};

export const MoreMenu: React.FC = React.memo(() => {
  const makeNavigateCb = (url: string) => () => {
    window.open(url, '_blank');
  };

  const menuItems = [
    {
      label: <MenuLabel>Tutorial</MenuLabel>,
      onClick: makeNavigateCb(
        'https://docs.harmony.one/home/general/layerzero-bridge/bridging-tutorial',
      ),
      justify: 'center',
    },
    {
      label: <MenuLabel>FAQ</MenuLabel>,
      onClick: makeNavigateCb(
        'https://docs.harmony.one/home/general/layerzero-bridge/faq',
      ),
      justify: 'center',
    },
    {
      label: <MenuLabel>Help</MenuLabel>,
      onClick: makeNavigateCb(
        'https://docs.harmony.one/home/general/layerzero-bridge/bridging-tutorial',
      ),
      justify: 'center',
    },
  ];

  const themeContext = useContext(ThemeContext);

  return (
    <Menu
      plain
      items={menuItems}
      icon={
        <MoreVertical
          color={themeContext.themeType === 'dark' ? 'white' : 'black'}
        />
      }
      dropProps={{
        align: { top: 'bottom', right: 'right' },
        round: 'small',
        margin: { right: '20px' },
      }}
    />
  );
});
