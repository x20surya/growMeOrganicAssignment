import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { DataTableValueArray } from "primereact/datatable";
import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";

interface Product {
  id?: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

function Table() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [selectedProducts, setSelectedProducts] = useState<DataTableValueArray>(
    []
  );
  const [rows, setRows] = useState<string>("");
  const op = useRef<any>(null);

  const selectRows = (count: number, items: Product[]) => {
    const toSelect = Math.min(count, items.length);
    const newSelection = items.slice(0, toSelect);

    const merged = [...selectedProducts, ...newSelection].reduce(
      (acc: Product[], item: any) => {
        if (!acc.find((p) => p.id === item.id)) {
          acc.push(item);
        }
        return acc;
      },
      []
    );

    setSelectedProducts(merged);

    const remaining = count - toSelect;
    setRows(remaining > 0 ? String(remaining) : "");
  };

  const fetchPageData = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      const filteredData: Product[] = data.data.map((item: any) => ({
        id: item.id,
        title: item.title ?? "",
        place_of_origin: item.place_of_origin ?? "",
        artist_display: item.artist_display ?? "",
        inscriptions: item.inscriptions ?? "",
        date_start: Number(item.date_start) || 0,
        date_end: Number(item.date_end) || 0,
      }));
      setProducts(filteredData);

      if (rows && parseInt(rows, 10) > 0) {
        selectRows(parseInt(rows, 10), filteredData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(page);
  }, [page]);

  function onPage(event: any) {
    setPage(event.page + 1);
  }

  function applyRows() {
    const numRows = parseInt(rows, 10);
    if (isNaN(numRows) || numRows <= 0) return;
    selectRows(numRows, products);
  }

  const header = (
    <div>
      <Button onClick={(e) => op.current.toggle(e)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-chevron-down"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
          />
        </svg>
      </Button>

      <OverlayPanel ref={op}>
        <div
          style={{
            padding: "1rem",
            backgroundColor: "lightgrey",
            flexDirection: "column",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <InputText
            type="number"
            placeholder="Select no. of rows"
            value={rows}
            onChange={(e) => setRows(e.target.value)}
          />
          <Button onClick={applyRows}>Apply</Button>
        </div>
      </OverlayPanel>
    </div>
  );

  return (
    <div>
      <DataTable
        value={products}
        lazy
        selectionMode={"checkbox"}
        paginator
        onPage={onPage}
        rows={12}
        totalRecords={200}
        loading={loading}
        tableStyle={{ minWidth: "50rem" }}
        selection={selectedProducts}
        onSelectionChange={(e: any) => setSelectedProducts(e.value)}
        dataKey={"id"}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column header={header} body={() => null} />
        <Column field="id" header="ID" hidden />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start" />
        <Column field="date_end" header="End" />
      </DataTable>
    </div>
  );
}

export default Table;
