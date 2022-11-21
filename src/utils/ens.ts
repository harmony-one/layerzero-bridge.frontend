import { keccak256, stringToHex, toUtf8 } from 'web3-utils';
import { BigNumber } from 'bignumber.js';

export const ensToTokenId = (name: string) => {
  const nameHex = stringToHex(name);
  const labelHash = keccak256(toUtf8(nameHex));

  return new BigNumber(labelHash).toString(10);
};
