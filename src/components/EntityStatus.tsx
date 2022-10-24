import React from 'react';
import {
  Clock,
  StatusCritical,
  StatusGood,
  StatusWarning,
} from 'grommet-icons';
import { Box } from 'grommet';
import { Text } from 'components/Base';
import { STATUS } from '../stores/interfaces';

const boxProps = {
  direction: 'row',
  align: 'center',
  gap: 'xxsmall',
} as const;

export const StatusError: React.FC<{ label?: string }> = ({ label }) => {
  const text = label || 'Error';
  return (
    <Box {...boxProps}>
      <StatusWarning size="16px" color="Red" />
      <Text size="small" margin={{ top: '2px' }} color="Red">
        {text}
      </Text>
    </Box>
  );
};

StatusError.displayName = 'StatusError';

export const StatusPending: React.FC<{ label?: string }> = ({ label }) => {
  const text = label || 'Pending';
  return (
    <Box {...boxProps}>
      <Clock size="16px" color="Orange" />
      <Text size="small" margin={{ top: '2px' }} color="Orange500">
        {text}
      </Text>
    </Box>
  );
};

StatusPending.displayName = 'StatusPending';

export const StatusCanceled: React.FC<{ label?: string }> = ({ label }) => {
  const text = label || 'Canceled';
  return (
    <Box {...boxProps}>
      <StatusCritical size="16px" color="Gray" />
      <Text size="small" margin={{ top: '2px' }} color="Gray">
        {text}
      </Text>
    </Box>
  );
};

StatusCanceled.displayName = 'StatusCanceled';

export const StatusCompleted: React.FC<{ label?: string }> = ({ label }) => {
  const text = label || 'Completed';
  return (
    <Box {...boxProps}>
      <StatusGood size="16px" color="Green" />
      <Text size="small" margin={{ top: '2px' }} color="Green">
        {text}
      </Text>
    </Box>
  );
};

StatusCompleted.displayName = 'StatusCompleted';

interface EntityStatusProps {
  status: STATUS;
  label?: string;
}

export const EntityStatus: React.FC<EntityStatusProps> = ({
  status,
  label = '',
}) => {
  if (status === STATUS.SUCCESS) {
    return <StatusCompleted label={label} />;
  }

  if (status === STATUS.WAITING) {
    return <StatusPending label={label || 'Waiting'} />;
  }

  if (status === STATUS.IN_PROGRESS) {
    return <StatusPending label={label || 'In progress'} />;
  }

  if (status === STATUS.CANCELED) {
    return <StatusCanceled label={label} />;
  }

  return <StatusError label={label} />;
};

EntityStatus.displayName = 'EntityStatus';
