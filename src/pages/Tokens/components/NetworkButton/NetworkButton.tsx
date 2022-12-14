import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import * as s from './NetworkButton.styl';
import { NETWORK_TYPE } from '../../../../stores/interfaces';
import { Button } from '../../../../components/Base';
import cn from 'classnames';
import { NETWORK_ICON, NETWORK_NAME } from '../../../../stores/names';
import { ThemeContext } from '../../../../themes/ThemeContext';

interface Props {
  type: NETWORK_TYPE | 'ALL';
  selectedType: NETWORK_TYPE | 'ALL';
  onClick: () => void;
}

export const NetworkButton: React.FC<Props> = observer(
  ({ type, selectedType, onClick }: Props) => {
    const themeContext = useContext(ThemeContext);
    const isActiveButton = selectedType === type;

    const buttonClassName = cn({
      [s.buttonDark]: themeContext.isDark(),
      [s.buttonLight]: !themeContext.isDark(),

      [s.buttonDarkActive]: themeContext.isDark() && isActiveButton,
      [s.buttonLightActive]: !themeContext.isDark() && isActiveButton,
    });

    return (
      <Button
        className={s.root}
        buttonClassName={buttonClassName}
        onClick={onClick}
      >
        {NETWORK_ICON[type] ? (
          <img
            style={{ marginRight: 10, height: 14 }}
            src={NETWORK_ICON[type]}
          />
        ) : null}
        {NETWORK_NAME[type] || 'All'}
      </Button>
    );
  },
);

NetworkButton.displayName = 'NetworkButton';
