import type React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type MRT_FormSectionConfig } from '../../types';

export interface MRT_NewEntryFormSectionBlockProps {
  // The ExpandMore icon component sourced from the table's icon registry.
  expandMoreIcon: React.ElementType;
  sectionConfig: MRT_FormSectionConfig;
  children: React.ReactNode;
}

// Switches between a CSS Grid container (when columns is set) and a vertical Stack (default).
const SectionFieldContainer = ({
  columns,
  children,
}: {
  columns: number | undefined;
  children: React.ReactNode;
}) => {
  if (columns !== undefined) {
    return (
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {children}
      </Box>
    );
  }

  return <Stack gap={2}>{children}</Stack>;
};

// Renders a collapsible or static section using MUI Accordion.
// When collapsible is false the Accordion is permanently expanded and the expand icon is hidden.
export const MRT_NewEntryFormSectionBlock = ({
  expandMoreIcon: ExpandIcon,
  sectionConfig,
  children,
}: MRT_NewEntryFormSectionBlockProps) => (
  <Accordion
    defaultExpanded={!sectionConfig.defaultCollapsed}
    disableGutters
    disabled={false}
    // Remove the MUI Accordion elevation so it blends into the modal body.
    elevation={0}
    // Disable the expand/collapse interaction entirely for non-collapsible sections.
    expanded={sectionConfig.collapsible ? undefined : true}
    square
    sx={{ '&:before': { display: 'none' }, border: 'none' }}
    // Unmount collapsed children to reduce DOM size when section is closed.
    slotProps={{ transition: { unmountOnExit: true } }}
  >
    <AccordionSummary
      // Hide the expand icon when the section cannot be collapsed.
      expandIcon={sectionConfig.collapsible ? <ExpandIcon /> : null}
      sx={{ px: 0 }}
    >
      <Typography fontWeight={600} variant="subtitle2">
        {sectionConfig.title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 0 }}>
      <SectionFieldContainer columns={sectionConfig.columns}>
        {children}
      </SectionFieldContainer>
    </AccordionDetails>
  </Accordion>
);
