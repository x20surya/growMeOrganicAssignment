import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";

interface Product {
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
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPageData = async () => {
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
          title: item.title ?? "",
          place_of_origin: item.place_of_origin ?? "",
          artist_display: item.artist_display ?? "",
          inscriptions: item.inscriptions ?? "",
          date_start: Number(item.date_start) || 0,
          date_end: Number(item.date_end) || 0,
        }));
        setProducts(filteredData);
        console.log(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [page]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div>
        <DataTable value={products} tableStyle={{ minWidth: "50rem" }}>
          <Column field="title" header="Title"></Column>
          <Column field="place_of_origin" header="Origin"></Column>
          <Column field="artist_display" header="Artist"></Column>
          <Column field="inscriptions" header="Inscriptions"></Column>
          <Column field="date_start" header="Start"></Column>
          <Column field="date_end" header="End"></Column>
        </DataTable>
      </div>
    </>
  );
}

export default Table;
