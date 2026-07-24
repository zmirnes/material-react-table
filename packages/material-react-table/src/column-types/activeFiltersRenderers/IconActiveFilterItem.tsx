import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MRT_ActiveFilterItemContainer from '../../components/toolbar/MRT_ActiveFilterItemContainer';
import { getFilterColumn } from '../../components/advanced-filters/utils';
import Iconify from '../../components/iconify';
import { type MRT_AvailableIconOption } from '../../tanstack-table';
import {
  type MRT_FilterRule,
  type MRT_IconColumnDef,
  type MRT_IconsListEntry,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { MRT_IconStatusDot } from '../iconStatusDisplay';

const getIconOptionByCode = (
  iconCode: string,
  availableIcons: MRT_AvailableIconOption[],
): MRT_AvailableIconOption | undefined =>
  availableIcons.find(
    (availableIcon) =>
      String(availableIcon.iconType.iconCode) === String(iconCode),
  );

const IconActiveFilterItem = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rule: MRT_FilterRule,
) => {
  if (typeof rule.value !== 'string' && !Array.isArray(rule.value)) return null;

  const column = getFilterColumn(table, rule.columnId);
  const iconColumnDef = column?.columnDef as
    | MRT_IconColumnDef<TData>
    | undefined;
  const availableIcons = iconColumnDef?.meta?.availableIcons ?? [];
  // Table-wide iconCode -> Iconify glyph map (table.options.iconsList)
  const iconsList = table.options.iconsList ?? {};

  const renderIconByCode = (iconCode: string, index?: number) => {
    const iconOption = getIconOptionByCode(iconCode, availableIcons);

    if (!iconOption) {
      return (
        <Typography key={index ?? iconCode} variant="body2">
          {String(iconCode)}
        </Typography>
      );
    }

    const iconDef: MRT_IconsListEntry | undefined = iconsList[String(iconCode)];

    return (
      <Tooltip
        key={index ?? iconCode}
        title={iconOption.tooltip || iconOption.iconType.description}
      >
        {iconDef ? (
          <Iconify
            icon={iconDef.component}
            sx={{ color: iconDef.defaultColor ?? iconOption.iconType.color }}
            width={20}
          />
        ) : (
          <MRT_IconStatusDot color={iconOption.iconType.color} />
        )}
      </Tooltip>
    );
  };

  if (rule.operator === 'isAnyOf' && Array.isArray(rule.value)) {
    return (
      <MRT_ActiveFilterItemContainer table={table} rule={rule}>
        <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">
          {rule.value.map((iconCode, index) =>
            renderIconByCode(String(iconCode), index),
          )}
        </Stack>
      </MRT_ActiveFilterItemContainer>
    );
  }

  return (
    <MRT_ActiveFilterItemContainer table={table} rule={rule}>
      {renderIconByCode(String(rule.value))}
    </MRT_ActiveFilterItemContainer>
  );
};

export default IconActiveFilterItem;
