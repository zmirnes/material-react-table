import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import {
  groupFieldsBySection,
  resolveFormFields,
  toAdditionalRenderEntries,
  toColumnRenderEntries,
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
  // Merge column fields and additional fields — additionalFields are placed into
  // sections/unsectioned alongside column fields in the real form (MRT_NewEntryForm),
  // so the skeleton must count them the same way to avoid a cell-count mismatch
  // once loading finishes.
  const allEntries = [
    ...toColumnRenderEntries(resolveFormFields(table)),
    ...toAdditionalRenderEntries(formConfig?.additionalFields ?? []),
  ];
  // Group entries by section for accurate per-section skeleton cell counts.
  const entriesBySectionId = groupFieldsBySection(allEntries);

  // Entries with no section assignment — rendered after all sections, same as the real form.
  const unsectionedEntries = allEntries.filter(
    ({ sectionId }) => sectionId === undefined,
  );
  const unsectionedCells = Array.from({ length: unsectionedEntries.length });

  return (
    <Stack gap={2}>
      {/* Sections — each mirrors the real MRT_NewEntryFormSectionBlock */}
      {sections.map((section) => {
        const fieldCells = Array.from({
          length: entriesBySectionId[section.id]?.length ?? 0,
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
