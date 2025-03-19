import { sliceByLength } from 'utils';
import RCTooltip from 'rc-tooltip';
import * as React from 'react';

export const SliceTooltip = (props: { value: any; maxLength: number }) => {
  if (typeof props.value !== 'string') {
    return props.value;
  }

  if (props.value.length > props.maxLength) {
    return (
      <RCTooltip overlay={<span>{props.value}</span>} placement="top">
        <>{sliceByLength(props.value, props.maxLength)}</>
      </RCTooltip>
    )
  }

  return props.value
};
