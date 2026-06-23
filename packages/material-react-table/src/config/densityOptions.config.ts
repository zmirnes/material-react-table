import {
  type MRT_DensityState,
  type MRT_Icons,
  type MRT_Localization,
} from '../types';

interface DensityOptionsConfig {
  icons: Pick<
    MRT_Icons,
    'DensityLargeIcon' | 'DensityMediumIcon' | 'DensitySmallIcon'
  >;
  localization: MRT_Localization;
}

type DensityOption = {
  Icon: Pick<
    MRT_Icons,
    'DensityLargeIcon' | 'DensityMediumIcon' | 'DensitySmallIcon'
  >[keyof Pick<
    MRT_Icons,
    'DensityLargeIcon' | 'DensityMediumIcon' | 'DensitySmallIcon'
  >];
  label: string;
  value: MRT_DensityState;
};

export const getDensityOptions = ({
  icons: { DensityLargeIcon, DensityMediumIcon, DensitySmallIcon },
  localization,
}: DensityOptionsConfig): DensityOption[] => [
  {
    Icon: DensitySmallIcon,
    label: localization.densityCompact,
    value: 'compact',
  },
  {
    Icon: DensityMediumIcon,
    label: localization.densityStandard,
    value: 'spacious',
  },
  {
    Icon: DensityLargeIcon,
    label: localization.densityComfortable,
    value: 'comfortable',
  },
];
