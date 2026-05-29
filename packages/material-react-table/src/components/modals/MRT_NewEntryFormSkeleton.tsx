import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import {
  groupFieldsBySection,
  resolveFormFields,
} from './MRT_NewEntryFormBuilder';
import { MRT_NewEntryFormSectionBlock } from './MRT_NewEntryFormSectionBlock';
import { type MRT_RowData, type MRT_TableInstance } from '../../types';

export interface MRT_NewEntryFormSkeletonProps<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

// Renders skeleton placeholders that mirror the real form layout exactly.
// Uses the same MRT_NewEntryFormSectionBlock and Stack/grid containers as MRT_NewEntryForm
// so the skeleton is pixel-identical to the real form — only the inputs are replaced by Skeletons.
export const MRT_NewEntryFormSkeleton = <TData extends MRT_RowData>({
  table,
}: MRT_NewEntryFormSkeletonProps<TData>) => {
  const { formConfig, icons } = table.options;

  const sections = formConfig?.sections ?? [];
  const allFields = resolveFormFields(table);
  // Group field entries by section for accurate per-section skeleton cell counts.
  const fieldsBySectionId = groupFieldsBySection(allFields);

  // Fields with no section assignment — rendered after all sections, same as the real form.
  const unsectionedFields = allFields.filter(
    ({ sectionId }) => sectionId === undefined,
  );
  const unsectionedCells = Array.from({ length: unsectionedFields.length });

  return (
    <Stack gap={2}>
      {/* Sections — each mirrors the real MRT_NewEntryFormSectionBlock */}
      {sections.map((section) => {
        const fieldCells = Array.from({
          length: fieldsBySectionId[section.id]?.length ?? 0,
        });

        return (
          <MRT_NewEntryFormSectionBlock
            expandMoreIcon={icons.ExpandMoreIcon}
            key={section.id}
            sectionConfig={section}
          >
            {fieldCells.map((_, index) => (
              <Skeleton key={index} height={'40px'} variant="rounded" />
            ))}
          </MRT_NewEntryFormSectionBlock>
        );
      })}

      {/* Unsectioned fields — same Stack/grid as the real form's unsectioned block */}
      {unsectionedCells.length > 0 && (
        <Stack
          gap={2}
          sx={
            formConfig?.columns
              ? {
                  display: 'grid',
                  gridTemplateColumns: `repeat(${formConfig.columns}, 1fr)`,
                }
              : undefined
          }
        >
          {unsectionedCells.map((_, index) => (
            <Skeleton key={index} height={'40px'} variant="rounded" />
          ))}
        </Stack>
      )}
    </Stack>
  );
};
