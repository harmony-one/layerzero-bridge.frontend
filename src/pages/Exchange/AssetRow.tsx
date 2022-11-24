import * as React from 'react';
import { Box } from 'grommet';
import { useMediaQuery } from 'react-responsive';
import { Text } from '../../components/Base';
import { SliceTooltip } from '../../ui';
import { sliceByLength, truncateAddressString } from '../../utils';
import { CopyButton } from '../../components/CopyIconButton';

const AssetRowContainer: React.FC = ({ children }) => {
  return (
    <Box
      direction="row-responsive"
      justify="between"
      margin={{ bottom: 'medium' }}
      align="start"
    >
      {children}
    </Box>
  );
};
const AssetRowLabel: React.FC<{ label: string }> = ({ label }) => {
  return (
    <Box>
      <Text size="small" bold={true}>
        <SliceTooltip value={label} maxLength={24} />
      </Text>
    </Box>
  );
};
const AssetRowValue: React.FC<{ value: string; copy?: boolean }> = ({
  value,
  copy,
}) => {
  return (
    <Box direction="row" align="center">
      <Text size="small">{sliceByLength(value, 26)}</Text>
      {copy ? <CopyButton value={value} /> : null}
    </Box>
  );
};
export const AssetRowAddressLink: React.FC<{
  link: string;
  address: string;
}> = props => {
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });
  const truncatedAddress = truncateAddressString(
    props.address,
    isMobile ? 7 : 12,
  );

  return (
    <Box direction="row" align="center">
      <a href={props.link} target="_blank" style={{ textDecoration: 'none' }}>
        <Text
          size="small"
          style={{
            fontFamily: 'monospace',
            cursor: 'pointer',
            // textDecoration: 'underline',
          }}
        >
          {truncatedAddress}
        </Text>
      </a>
      <CopyButton value={props.address} />
    </Box>
  );
};
export const AssetRowAddress: React.FC<{
  label: string;
  link: string;
  address;
}> = ({ label, link, address }) => {
  return (
    <AssetRowContainer>
      <AssetRowLabel label={label} />
      <AssetRowAddressLink link={link} address={address} />
    </AssetRowContainer>
  );
};
export const AssetRowSimple: React.FC<{
  label: string;
  value: string;
  copy?: boolean;
}> = ({ label, value, copy = false }) => {
  return (
    <AssetRowContainer>
      <AssetRowLabel label={label} />
      <AssetRowValue value={value} copy={copy} />
    </AssetRowContainer>
  );
};

export const AssetRowCustom: React.FC<{ label: string }> = props => {
  return (
    <AssetRowContainer>
      <AssetRowLabel label={props.label} />
      <Box direction="row" align="center">
        {props.children}
      </Box>
    </AssetRowContainer>
  );
};
