import React from 'react';
import { Details } from '../../../Exchange/Details';
import { Box } from 'grommet/components/Box';
import { Status } from '../Status/Status';
import { Networks } from '../Networks/Networks';
import { Divider } from '../../../../components/Divider/Divider';
import { StepContainer } from '../StepContainer';

interface Props {}

export const StepSENDING: React.FC<Props> = () => {
  return (
    <StepContainer>
      <Networks />
      <Divider />
      <Box pad="60px">
        <Details>
          <Status />
        </Details>
      </Box>
    </StepContainer>
  );
};

StepSENDING.displayName = 'StepSENDING';
