import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { DataTablePageEvent } from "primereact/datatable";
import { useEffect, useState } from "react";

import { fetchArtworks } from "../api/artworks";
import type { Artwork } from "../types/artwork";
import { BulkSelectOverlay } from "./BulkSelectOverlay";

export function ArtTable() {
  const [rows, setRows] = useState<Artwork[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const rowsPerPage = 12;

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());
  const [bulkAppliedCount, setBulkAppliedCount] = useState(0);
  const [bulkCount, setBulkCount] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);

    fetchArtworks(page, rowsPerPage).then((res) => {
      setRows(res.rows);
      setTotal(res.total);

      if (bulkCount !== null && bulkAppliedCount < bulkCount) {
        const remaining = bulkCount - bulkAppliedCount;

        const selectable = res.rows
          .filter((r) => !deselectedIds.has(r.id))
          .slice(0, remaining);

        setSelectedIds((prev) => {
          const copy = new Set(prev);
          selectable.forEach((r) => copy.add(r.id));
          return copy;
        });

        setBulkAppliedCount((prev) => prev + selectable.length);
      }

      setLoading(false);
    });
  }, [page]);


  const resolvedSelection = rows.filter((row) => {
    if (bulkCount === null) {
      return selectedIds.has(row.id);
    }

    if (deselectedIds.has(row.id)) {
      return false;
    }

    if (selectedIds.has(row.id)) {
      return true;
    }

    return false;
  });

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const pageIds = new Set(rows.map((r) => r.id));
    const newSelected = new Set(selectedIds);

    pageIds.forEach((id) => {
      const isChecked = e.value.some((r) => r.id === id);
      if (isChecked) {
        newSelected.add(id);
        deselectedIds.delete(id);
      } else {
        newSelected.delete(id);
        deselectedIds.add(id);
      }
    });

    setSelectedIds(newSelected);
    setDeselectedIds(new Set(deselectedIds));
  };

  const onPageChange = (e: DataTablePageEvent) => {
    setPage(e.page! + 1);
  };

  return (
    <>
      <BulkSelectOverlay
        onApply={(n) => {
          console.log("ArtTable received bulk count:", n);
          setBulkCount(n);
          setSelectedIds(new Set());
          setDeselectedIds(new Set());
          setBulkAppliedCount(0);

          setSelectedIds((prev) => {
            const copy = new Set(prev);
            rows.slice(0, n).forEach((r) => copy.add(r.id));
            return copy;
          });
          setBulkAppliedCount(Math.min(n, rows.length))
        }}
      />

      <DataTable
        value={rows}
        paginator
        lazy
        rows={rowsPerPage}
        totalRecords={total}
        first={(page - 1) * rowsPerPage}
        onPage={onPageChange}
        loading={loading}
        dataKey="id"
        selection={resolvedSelection}
        onSelectionChange={onSelectionChange}
        selectionMode="checkbox"
      >
        <Column selectionMode="multiple" />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column
          header="Inscriptions"
          body={(row) =>
            row.inscriptions && row.inscriptions.trim() ? row.inscriptions : "—"
          }
        />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </>
  );
}
