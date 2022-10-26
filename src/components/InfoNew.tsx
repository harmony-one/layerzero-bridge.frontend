import React from 'react';
import { Box } from 'grommet';
import { Text, Title } from './Base';
import * as styles from './info-styles.styl';

export const InfoNew = ({ title }: { title: string }) => (
  <Box className={styles.infoContainer} pad="large">
    {title ? (
      <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
        <Title>{title}</Title>
      </Box>
    ) : null}
    <div>
      <Text color="NWhite">
        <p>Hi Horizon Bridge users,</p>
        <p>
          Due to the high Ethereum gas price, we had to update the bridge that
          will now require users to pay for the Ethereum network fee. Details
          are in the FAQ section. Please use the bridge cautiously, especially
          the Harmony to Ethereum transfers.
        </p>
        <p>
          The Horizon bridge has still the lowest cost for Ethereum to Harmony
          transfers, however Harmony to Ethereum transfers will be expensive (at
          high Ethereum gas price). The Ethereum gas cost for our bridge is
          comparable to every other bridge that is currently on Ethereum
          mainnet. For example, SecretNetwork bridge, IoTex bridge, etc.
        </p>
        <p>
          We have been working tirelessly on the trustless and gas-efficient
          version of the bridge to Ethereum, which will be rolled out sometime
          later this month. The cost of transferring assets from Harmony to
          Ethereum is expected to drastically improve. We will keep the
          community up to date on this release.
        </p>
        Thanks
        <br />
        Horizon bridge team
      </Text>
    </div>
  </Box>
);

export const InfoNew2 = ({ title }: { title: string }) => (
  <Box className={styles.infoContainer} pad="large">
    {title ? (
      <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
        <Title>{title}</Title>
      </Box>
    ) : null}
    <div>
      <Text color="NWhite" style={{ lineHeight: '22px' }}>
        <p>
          The LayerZero-Harmony Bridge Interface (“Interface”) is an interface that facilitates use of a third-party cross-chain communication system (“Bridge”) that is designed to enable users to send messages between certain blockchains to enable the exchange of crypto assets between such blockchains. Your use of the Interface and the Bridge is entirely at your own risk.
        </p>
        <p>The Interface and the Bridge are available on an “as is” basis without warranties of any kind, either express or implied, including, but not limited to, warranties of merchantability, title, fitness for a particular purpose and non-infringement.</p>
        <p>You assume all risks associated with using the Interface and the Bridge, and digital assets and decentralized systems generally, including but not limited to, that: (a) digital assets are highly volatile; (b) using digital assets is inherently risky due to both features of such assets and the potential unauthorized acts of third parties; (c) you may not have ready access to assets; and (d) you may lose some or all of your tokens or other assets. You agree that you will have no recourse against anyone else for any losses due to the use of the Interface or the Bridge. For example, these losses may arise from or relate to: (i) incorrect information; (ii) software or network failures; (iii) corrupted cryptocurrency wallet files; (iv) unauthorized access; (v) errors, mistakes, or inaccuracies; or (vi) third-party activities.</p>
        <p>
          The Interface and the Bridge do not collect any personal data, and your interaction with the Interface and the Bridge will solely be through your public digital wallet address. Any personal or other data that you may make available in connection with the Bridge may not be private or secure.
        </p>
      </Text>
    </div>
  </Box>
);
