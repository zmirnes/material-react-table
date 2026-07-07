import {
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import Box from '@mui/material/Box';
import Divider, { type DividerProps } from '@mui/material/Divider';
import {
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { parseCSSVarId } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

export interface MRT_TableHeadCellResizeHandleProps<TData extends MRT_RowData>
  extends DividerProps {
  header: MRT_Header<TData>;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableHeadCellResizeHandle = <TData extends MRT_RowData>({
  header,
  table,
  ...rest
}: MRT_TableHeadCellResizeHandleProps<TData>) => {
  const {
    getState,
    options: { columnResizeDirection },
    refs: { isResizingRef, resizeIndicatorRef, tableContainerRef, tableRef },
    setColumnSizing,
    setColumnSizingInfo,
  } = table;
  const { density } = getState();
  const { column } = header;

  const mx =
    density === 'compact'
      ? '-8px'
      : density === 'comfortable'
        ? '-16px'
        : '-24px';

  const lr = column.columnDef.columnDefType === 'display' ? '4px' : '0';

  // Drives the resize purely through refs/DOM writes (CSS vars + the indicator line) so
  // dragging causes zero React renders; the only state write is the commit on release.
  const startResize = useCallback(
    (startX: number) => {
      const tableEl = tableRef.current;
      const containerEl = tableContainerRef.current;
      const indicatorEl = resizeIndicatorRef.current;
      const startSize = column.getSize();
      const dir = columnResizeDirection === 'rtl' ? -1 : 1;
      const minSize = column.columnDef.minSize ?? 40;
      const maxSize = column.columnDef.maxSize ?? 1000;
      let size = startSize;

      const updateIndicator = (clientX: number) => {
        if (!indicatorEl || !containerEl) return;
        const containerRect = containerEl.getBoundingClientRect();
        const x = clientX - containerRect.left + containerEl.scrollLeft;
        indicatorEl.style.display = 'block';
        indicatorEl.style.transform = `translateX(${x}px)`;
      };

      isResizingRef.current = column.id;
      containerEl?.setAttribute('data-mrt-resizing', 'true');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      updateIndicator(startX);

      const handleMove = (clientX: number) => {
        size = Math.min(
          Math.max(startSize + dir * (clientX - startX), minSize),
          maxSize,
        );
        if (tableEl) {
          tableEl.style.setProperty(
            `--header-${parseCSSVarId(header.id)}-size`,
            `${size}`,
          );
          tableEl.style.setProperty(
            `--col-${parseCSSVarId(column.id)}-size`,
            `${size}`,
          );
        }
        updateIndicator(clientX);
      };

      const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
      const handleTouchMove = (e: TouchEvent) => {
        const touchX = e.touches[0]?.clientX;
        if (touchX == null) return;
        e.preventDefault();
        handleMove(touchX);
      };

      const handleEnd = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
        isResizingRef.current = false;
        containerEl?.removeAttribute('data-mrt-resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        if (indicatorEl) indicatorEl.style.display = 'none';
        setColumnSizing((old) => ({ ...old, [column.id]: size }));
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      document.addEventListener('touchend', handleEnd);
    },
    [
      column,
      columnResizeDirection,
      header.id,
      isResizingRef,
      resizeIndicatorRef,
      setColumnSizing,
      tableContainerRef,
      tableRef,
    ],
  );

  return (
    <Box
      className="Mui-TableHeadCell-ResizeHandle-Wrapper"
      onDoubleClick={() => {
        setColumnSizingInfo((old) => ({
          ...old,
          isResizingColumn: false,
        }));
        column.resetSize();
      }}
      onMouseDown={(e: ReactMouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        startResize(e.clientX);
      }}
      onTouchStart={(e: ReactTouchEvent<HTMLDivElement>) => {
        const touchX = e.touches[0]?.clientX;
        if (touchX != null) startResize(touchX);
      }}
      sx={(theme) => ({
        '&:active > hr': {
          backgroundColor: theme.palette.info.main,
          opacity: 1,
        },
        cursor: 'col-resize',
        left: columnResizeDirection === 'rtl' ? lr : undefined,
        ml: columnResizeDirection === 'rtl' ? mx : undefined,
        mr: columnResizeDirection === 'ltr' ? mx : undefined,
        position: 'absolute',
        px: '4px',
        right: columnResizeDirection === 'ltr' ? lr : undefined,
      })}
    >
      <Divider
        className="Mui-TableHeadCell-ResizeHandle-Divider"
        flexItem
        orientation="vertical"
        sx={(theme) => ({
          borderRadius: '2px',
          borderWidth: '1px',
          height: '24px',
          touchAction: 'none',
          transform: 'translateX(4px)',
          transition: column.getIsResizing()
            ? undefined
            : 'all 150ms ease-in-out',
          userSelect: 'none',
          zIndex: 4,
          ...(parseFromValuesOrFunc(rest?.sx, theme) as Record<
            string,
            unknown
          >),
        })}
      />
    </Box>
  );
};
