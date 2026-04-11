import {
  type DropdownOption,
  type MRT_FilterOperatorEditComponentProps,
  type MRT_RowData,
} from '../../types';
import { MRT_RangeDateValueEditor } from './MRT_RangeDateValueEditor';
import { MRT_RangeValueEditor } from './MRT_RangeValueEditor';
import { MRT_SingleDateValueEditor } from './MRT_SingleDateValueEditor';
import { MRT_SingleValueEditor } from './MRT_SingleValueEditor';

export const MRT_FilterRuleTextEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleValueEditor {...props} inputType="text" />;

export const MRT_FilterRuleNumberEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_SingleValueEditor
    {...props}
    inputType="number"
    transformValue={(value) => (value === '' ? '' : Number(value))}
    valueFormatter={(value) =>
      value === undefined || value === null || value === ''
        ? ''
        : String(value)
    }
  />
);

export const MRT_FilterRuleBooleanEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_SingleValueEditor
    {...props}
    options={[
      { label: props.table.options.localization.booleanTrue, value: 'true' },
      { label: props.table.options.localization.booleanFalse, value: 'false' },
    ]}
    transformValue={(value) =>
      value === 'true' ? true : value === 'false' ? false : ''
    }
    valueFormatter={(value) =>
      value === true ? 'true' : value === false ? 'false' : ''
    }
  />
);

export const MRT_FilterRuleDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleDateValueEditor {...props} pickerType="date" />;

export const MRT_FilterRuleDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_SingleDateValueEditor {...props} pickerType="datetime" />;

export const MRT_FilterRuleRangeTextEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeValueEditor {...props} inputType="text" />;

export const MRT_FilterRuleRangeNumberEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => (
  <MRT_RangeValueEditor
    {...props}
    inputType="number"
    transformValue={(value) => (value === '' ? '' : Number(value))}
    valueFormatter={(value) =>
      value === undefined || value === null || value === ''
        ? ''
        : String(value)
    }
  />
);

export const MRT_FilterRuleRangeDateEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeDateValueEditor {...props} pickerType="date" />;

export const MRT_FilterRuleRangeDateTimeEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData>,
) => <MRT_RangeDateValueEditor {...props} pickerType="datetime" />;

export const MRT_FilterRuleSelectEditor = <TData extends MRT_RowData>(
  props: MRT_FilterOperatorEditComponentProps<TData> & {
    options: DropdownOption[];
  },
) => <MRT_SingleValueEditor {...props} options={props.options} />;
