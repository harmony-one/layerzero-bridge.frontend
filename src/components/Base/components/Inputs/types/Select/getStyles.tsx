import { CSSProperties } from 'react';
import { StylesConfig } from 'react-select';
import { getSize } from '../../common';
import { getInputBorder } from '../TextInput';

type GetStyles = (
  type?: SelectType,
  customStyles?: SelectCustomStyles,
) => StylesConfig;

export const getStyles: GetStyles = (type, customStyles) => {
  let result: StylesConfig = {};

  if (type && presets[type]) {
    result = { ...result, ...presets[type] };
  }

  if (customStyles) {
    result = injectCustomStyles(result, customStyles);
  }

  return result;
};

const injectCustomStyles = (
  source: StylesConfig,
  customStyles: SelectCustomStyles,
): StylesConfig => {
  const result = { ...source };
  const customizedParts = Object.keys(customStyles) as [keyof StylesConfig];

  for (const part of customizedParts) {
    result[part] = (baseStyles, selectState) => {
      const providedStyleFn = source[part];
      const providedStyles =
        (providedStyleFn && providedStyleFn(baseStyles, selectState)) || {};

      const injectedCustomStyles =
        typeof customStyles[part] === 'function'
          ? (customStyles[part])(baseStyles, selectState)
          : (customStyles[part] as CSSProperties);

      return {
        ...providedStyles,
        ...injectedCustomStyles,
      };
    };
  }

  return result;
};

const defaultPreset: StylesConfig = {
  option: (provided, state) => {
    const theme = state.theme as any
    return {
      ...provided,
      backgroundColor: state.isFocused
        ? theme.selectPresetDefault.option.backgroundColorFocused
        : state.isSelected
        ? theme.selectPresetDefault.option.backgroundColorSelected
        : 'transparent',
      color: theme.textColor,
      padding: '16px',
      fontSize: '14px',
      fontFamily: theme.fontBase,
    }
  },
  control: (provided, props) => {
    const theme = props.theme as any
    return {
      ...provided,
      width: getSize(props.selectProps.size, props.theme),
      fontFamily: theme.fontBase,
      border: 'none',
      borderTop: getInputBorder(props as any, 'Top'),
      borderRight: getInputBorder(props as any, 'Right'),
      borderBottom: getInputBorder(props as any, 'Bottom'),
      borderLeft: getInputBorder(props as any, 'Left'),
      // padding: '3px',
      minHeight: theme.styled.input.minLength || 38,
      boxShadow: 'none',
      fontSize: '12px',
      backgroundColor: theme.selectPresetDefault.control.backgroundColor,
      color: theme.selectPresetDefault.control.color,
      paddingLeft: '14px',
      borderRadius: '15px',
      borderColor: `${theme.selectPresetDefault.control.borderColor} !important`,
    }
  },
  menu: (provided, props) => {
    const theme = props.theme as any
    return {
      ...provided,
      borderRadius: '15px',
      border: theme.styled.input.border,
      overflow: 'hidden',
      padding: 0,
      borderColor: `${theme.selectPresetDefault.menu.borderColor} !important`,
      backgroundColor: theme.selectPresetDefault.menu.backgroundColor,
    }
  },
  indicatorSeparator: () => ({
    display: 'none',
  }),
};

const filterPreset: StylesConfig = {
  option: (provided, state) => {
    const theme = state.theme as any
    return {
      ...provided,
      backgroundColor: state.isFocused
        ? theme.selectPresetFilter.option.backgroundColorFocused
        : state.isSelected
        ? theme.selectPresetFilter.option.backgroundColorSelected
        : 'transparent',
      color: theme.textColor,
      padding: '8px',
      fontSize: '13px',
      fontFamily: theme.fontBase,
    }
  },
  control: (provided, props) => {
    const theme = props.theme as any
    return {
      ...provided,
      width: getSize(props.selectProps.size, theme),
      fontFamily: theme.fontBase,
      fontSize: '12px',
      border: `1px solid ${theme.selectPresetFilter.control.borderColor}`,
      backgroundColor: theme.selectPresetFilter.control.backgroundColor,
      color: theme.palette.NWhite,
      padding: '0',
      paddingLeft: '14px',
      borderRadius: '15px',
      borderColor: `${theme.selectPresetFilter.control.borderColor} !important`,
      boxShadow: 'none',
      minHeight: '44px',
    }
  },
  menu: (provided, props) => {
    const theme = props.theme as any
    return {
      ...provided,
      borderRadius: '15px',
      border: `1px solid ${theme.selectPresetFilter.menu.borderColor}`,
      overflow: 'hidden',
      padding: 0,
      borderColor: `${theme.selectPresetFilter.menu.borderColor} !important`,
      backgroundColor: theme.selectPresetFilter.menu.backgroundColor,
    }
  },
  indicatorSeparator: () => ({
    display: 'none',
  }),
  indicatorsContainer: () => ({
    padding: '0 12px',
  }),
};

const presets: Record<SelectType, StylesConfig> = {
  default: defaultPreset,
  filter: filterPreset,
};

export type SelectType = 'default' | 'filter';
export type SelectCustomStyles =
  | StylesConfig
  | Partial<Record<keyof StylesConfig, CSSProperties>>;
