import React from 'react';
import { dateTimeAgoFormat } from '../../utils';
import { Text } from '../../components/Base';

interface Props {
  date: number;
}

export const OperationAge: React.FC<Props> = ({ date }) => {
  return (
    <Text color="NGray">{date ? dateTimeAgoFormat(date * 1000) : '--'}</Text>
  );
};

OperationAge.displayName = 'OperationAge';
