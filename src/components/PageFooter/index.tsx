import * as React from 'react';
import { Box } from 'grommet';
import cn from 'classnames';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTwitter,
  faTelegram,
  faDiscord,
  faMedium,
} from '@fortawesome/free-brands-svg-icons';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';

import * as styles from './styles.styl';

interface Props {}

const SocialNetworksData = [
  {
    key: 'people_group',
    icon: <FontAwesomeIcon icon={faPeopleGroup} />,
    url: 'https://discord.com/invite/rdCmBpe',
  },
  {
    key: 'discord',
    icon: <FontAwesomeIcon icon={faDiscord} />,
    url: 'https://discord.com/invite/rdCmBpe',
  },
  {
    key: 'medium',
    icon: <FontAwesomeIcon icon={faMedium} />,
    url: 'https://medium.com/harmony-one',
  },
  {
    key: 'telegram',
    icon: <FontAwesomeIcon icon={faTelegram} />,
    url: 'https://t.me/harmony_one',
  },
  {
    key: 'twitter',
    icon: <FontAwesomeIcon icon={faTwitter} />,
    url: 'https://twitter.com/harmonyprotocol',
  },
];

const Divider = styled.div`
  border-bottom: 1px solid #313131;
  height: 1px;
  opacity: ${props => props.theme.headerDivider.opacity};
  box-sizing: border-box;
`;

const SocialNetworks = props => {
  return (
    <Box direction="row" gap="small">
      {SocialNetworksData.map(social => {
        return (
          <div
            key={social.key}
            style={{
              cursor: 'pointer',
              fontSize: '1.2rem',
              paddingTop: '1em',
            }}
            onClick={() => window.open(social.url, '_blank')}
          >
            {social.icon}
          </div>
        );
      })}
    </Box>
  );
};

const StyledDiv = styled.div`
  color: ${props => props.theme.headerTab.color};
  right: 0;
  bottom: 0;
  left: 0;
  height: 4em;
  //position: sticky !important;
`;

const PageFooter: React.FC<Props> = () => {
  return (
    <StyledDiv>
      <Divider />
      <Box direction="column" align="center" fill="vertical">
        <SocialNetworks />
        <Box
          direction="row"
          align="center"
          justify="center"
          className={cn(styles.footerText)}
        >
          <p>
            © Harmony 2024&nbsp;<span className={cn(styles.footerDot)}>.</span>
            &nbsp;hello@harmony.one
          </p>
        </Box>
      </Box>
    </StyledDiv>
  );
};

export default PageFooter;
