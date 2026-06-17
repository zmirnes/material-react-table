import {
  createContext,
  type RefObject,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

interface MRT_AdvancedFiltersContextValue {
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: Dispatch<SetStateAction<boolean>>;
}

const MRT_AdvancedFiltersContext =
  createContext<MRT_AdvancedFiltersContextValue | null>(null);

export const useMRT_AdvancedFiltersContext =
  (): MRT_AdvancedFiltersContextValue => {
    const ctx = useContext(MRT_AdvancedFiltersContext);
    if (!ctx)
      throw new Error(
        'useMRT_AdvancedFiltersContext must be used within MRT_AdvancedFiltersProvider',
      );
    return ctx;
  };

interface MRT_AdvancedFiltersProviderProps {
  children: ReactNode;
  initialOpen?: boolean;
  setterRef: RefObject<Dispatch<SetStateAction<boolean>> | null>;
}

export const MRT_AdvancedFiltersProvider = ({
  children,
  initialOpen = false,
  setterRef,
}: MRT_AdvancedFiltersProviderProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(initialOpen);

  // Always keep ref in sync so table.setShowAdvancedFilters works externally
  setterRef.current = setShowAdvancedFilters;

  return (
    <MRT_AdvancedFiltersContext.Provider
      value={{ showAdvancedFilters, setShowAdvancedFilters }}
    >
      {children}
    </MRT_AdvancedFiltersContext.Provider>
  );
};
