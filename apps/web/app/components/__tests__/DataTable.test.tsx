import { describe, it, expect, vi } from "vitest";
import { DataTable } from "../DataTable";
import { renderWithRouter, screen, fireEvent } from "../../utils/test-utils";
import type { ColumnDef } from "@tanstack/react-table";

// Przykładowy typ danych do testów
interface TestData {
  id: string;
  name: string;
  age: number;
}

describe("DataTable", () => {
  // Sample test data
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

  // Test column definitions
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
    // Render the component with our renderWithRouter helper function
    renderWithRouter(<DataTable columns={columns} data={testData} />);

    // Check if table headers are displayed correctly
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Full name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();

    // Check if data is displayed correctly
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("displays loading state when isLoading is true", () => {
    // Render component in loading state
    renderWithRouter(<DataTable columns={columns} data={testData} isLoading={true} />);

    // Check if loading information is displayed
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Make sure the table is not rendered during loading
    expect(screen.queryByText("ID")).not.toBeInTheDocument();
  });

  it("displays 'No results' when data array is empty", () => {
    // Render component with empty data array
    renderWithRouter(<DataTable columns={columns} data={[]} />);

    // Check if 'No results' information is displayed
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("handles pagination correctly", () => {
    renderWithRouter(<DataTable columns={columns} data={testData} />);

    // By default we should see the first 10 items
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Maggie Cooper")).toBeInTheDocument();
    expect(screen.queryByText("Chris Johnson")).not.toBeInTheDocument();

    // Clicking the "Next" button should go to the next page
    fireEvent.click(screen.getByText("Next"));

    // Now we should see items from the second page
    expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Chris Johnson")).toBeInTheDocument();
    expect(screen.getByText("Agatha Miller")).toBeInTheDocument();

    // Clicking the "Previous" button should return to the first page
    fireEvent.click(screen.getByText("Previous"));

    // We should see items from the first page again
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.queryByText("Chris Johnson")).not.toBeInTheDocument();
  });
});
