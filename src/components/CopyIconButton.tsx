import * as React from 'react';
import { useCallback } from 'react';
import { Button } from 'grommet';
import { Icon } from './Base';

interface Props {
  value: string | number;
}

export const CopyButton: React.FC<Props> = ({ value }) => {
  const handleClickCopy = useCallback(() => {
    navigator.clipboard.writeText(String(value));
  }, [value]);

  return (
    <Button onClick={handleClickCopy}>
      <Icon
        glyph="PrintFormCopy"
        size="20px"
        color="NBlue"
        style={{ marginLeft: 10, width: 20 }}
      />
    </Button>
  );
};

CopyButton.displayName = 'CopyButton';
