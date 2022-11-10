export const getAssetBalance = (data, type: 'origin' | 'mapping') => {
  let assetPrefix;
  switch (type) {
    case 'origin':
      assetPrefix = 'erc';
      break;
    case 'mapping':
      assetPrefix = 'hrc';
      break;
  }

  if (data.type.indexOf(assetPrefix) !== -1) {
    return data.erc20Balance;
  } else {
    return data.hrc20Balance;
  }
};
