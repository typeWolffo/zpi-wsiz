import { describe, it, expect, vi } from "vitest";
import { DataTable } from "../DataTable";
import { renderWithRouter, screen, fireEvent } from "../../utils/test-utils";
import type { ColumnDef } from "@tanstack/react-table";


interface TestData {
  id: string;
  name: string;
  age: number;
}

describe("DataTable", () => {
  
  const testData: TestData[] = [
    { id: "1", name: "John Smith", age: 30 },
    { id: "2", name: "Anna Brown", age: 25 },
    { id: "3", name: "Peter Wilson", age: 40 },
    { id: "4", name: "Martha Lee", age: 28 },
    { id: "5", name: "Thomas Carter", age: 45 },
    { id: "6", name: "Caroline Woods", age: 32 },
    { id: "7", name: "Adam Green", age: 37 },
    { id: "8", name: "Eva Stone", age: 29 },
    { id: "9", name: "Martin Davis", age: 42 },
    { id: "10", name: "Maggie Cooper", age: 31 },
    { id: "11", name: "Chris Johnson", age: 36 },
    { id: "12", name: "Agatha Miller", age: 27 },
  ];

  
  const columns: ColumnDef<TestData, any>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Full name",
    },
    {
      accessorKey: "age",
      header: "Age",
    },
  ];

  it("renders the table with data correctly", () => {
    
    renderWithRouter(<DataTable columns={columns} data={testData} />);

    
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Full name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();

    
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("displays loading state when isLoading is true", () => {
    
    renderWithRouter(<DataTable columns={columns} data={testData} isLoading={true} />);

    
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    
    expect(screen.queryByText("ID")).not.toBeInTheDocument();
  });

  it("displays 'No results' when data array is empty", () => {
    
    renderWithRouter(<DataTable columns={columns} data={[]} />);

    
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("handles pagination correctly", () => {
    renderWithRouter(<DataTable columns={columns} data={testData} />);

    
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Maggie Cooper")).toBeInTheDocument();
    expect(screen.queryByText("Chris Johnson")).not.toBeInTheDocument();

    
    fireEvent.click(screen.getByText("Next"));

    
    expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Chris Johnson")).toBeInTheDocument();
    expect(screen.getByText("Agatha Miller")).toBeInTheDocument();

    
    fireEvent.click(screen.getByText("Previous"));

    
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.queryByText("Chris Johnson")).not.toBeInTheDocument();
  });
});
