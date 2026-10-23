"use client";

import {
  useRef,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import styles from "./index.module.scss";
import classNames from "classnames";

type VirtualTableRowProps = ComponentPropsWithRef<"tr"> & {
  key: string | number | bigint;
  "data-index": number;
};

type VirtualTableProps<TItem> = {
  items: readonly TItem[];
  columnCount: number;
  getItemKey: (item: TItem) => string | number;
  renderHeader: (
    rowProps: ComponentPropsWithRef<"tr">,
  ) => ReactElement<ComponentPropsWithRef<"tr">, "tr">;
  renderRow: (
    rowProps: VirtualTableRowProps,
    item: TItem,
  ) => ReactElement<ComponentPropsWithRef<"tr">, "tr">;
  className?: string;
};

export default function VirtualTable<TItem>({
  items,
  columnCount,
  getItemKey,
  renderHeader,
  renderRow,
  className,
}: VirtualTableProps<TItem>) {

  const scrollRef = useRef<HTMLTableSectionElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library -- This component explicitly opts out of compiler memoization.
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    getItemKey: (index) => getItemKey(items[index]),
    estimateSize: () => 53,
    overscan: 5,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const firstRow = virtualRows[0];
  const lastRow = virtualRows[virtualRows.length - 1];
  const paddingTop = firstRow?.start ?? 0;
  const paddingBottom = lastRow
    ? Math.max(0, rowVirtualizer.getTotalSize() - lastRow.end)
    : 0;

  return (
    <table className={classNames(styles.table, className)} aria-rowcount={items.length + 1}>
      <thead>
        {renderHeader({ "aria-rowindex": 1 })}
      </thead>
      <tbody ref={scrollRef} tabIndex={0} aria-label="Scrollable table rows">
        {paddingTop > 0 && (
          <tr aria-hidden="true" className={styles.spacer}>
            <td colSpan={columnCount} style={{ height: paddingTop }} />
          </tr>
        )}
        {virtualRows.map((virtualRow) =>
          renderRow(
            {
              key: virtualRow.key,
              "data-index": virtualRow.index,
              ref: rowVirtualizer.measureElement,
              "aria-rowindex": virtualRow.index + 2,
            },
            items[virtualRow.index],
          ),
        )}
        {paddingBottom > 0 && (
          <tr aria-hidden="true" className={styles.spacer}>
            <td colSpan={columnCount} style={{ height: paddingBottom }} />
          </tr>
        )}
      </tbody>
    </table>
  );
}
