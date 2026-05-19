import type React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type MRT_FormSectionConfig } from '../../types';

export interface MRT_NewEntryFormSectionBlockProps {
  // The ExpandMore icon component sourced from the table's icon registry.
  expandMoreIcon: React.ElementType;
  sectionConfig: MRT_FormSectionConfig;
  children: React.ReactNode;
}

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
      <Stack gap={2}>{children}</Stack>
    </AccordionDetails>
  </Accordion>
);
