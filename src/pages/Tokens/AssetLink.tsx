import { ITokenInfo, TOKEN } from '../../stores/interfaces';
import { EthereumLink } from './EthereumLink';
import { getChecksumAddress } from '../../blockchain-bridge';
import { HarmonyLink } from './HarmonyLink';
import * as React from 'react';

interface Props {
  data: ITokenInfo;
  type: 'origin' | 'mapping';
}

export const AssetLink: React.FC<Props> = ({ data, type }) => {
  /*
  token type        | type    | address       | component
  ---               | ---     | ---           |
  token.erc         | origin  | erc20Address  | EthAddress
  token.hrc         | origin  | hrc20Address  | HrcAddress
  token.erc         | mapping | hrc20Address  | HrcAddress
  token.hrc         | mapping | erc20Address  | EthAddress
   */
  let assetPrefix;
  switch (type) {
    case 'origin':
      assetPrefix = 'erc';
      break;
    case 'mapping':
      assetPrefix = 'hrc';
      break;
  }

  const isMappingForOne = data.type === TOKEN.ONE && type === 'mapping';

  const isErcOrHrcToken = data.type.indexOf(assetPrefix) !== -1;

  if (isErcOrHrcToken || isMappingForOne) {
    return <EthereumLink value={data.erc20Address} network={data.network} />;
  } else {
    const address =
      String(data.hrc20Address).toLowerCase() ===
      String(process.env.ONE_HRC20).toLowerCase()
        ? String(data.hrc20Address).toLowerCase()
        : getChecksumAddress(data.hrc20Address);

    return <HarmonyLink address={address} />;
  }
};
