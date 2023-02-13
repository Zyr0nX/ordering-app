import { Prisma } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

import Modal from "../Components/Modal";

interface Food {
  name: string;
  description: string;
  calories: number;
  price: number;
}

const foodData: Food[] = [
  {
    name: "Frozen yoghurt",
    description: "a",
    calories: 159,
    price: 6.0,
  },
  {
    name: "Ice cream sandwich",
    description: "a",
    calories: 237,
    price: 9.0,
  },
  {
    name: "Eclair",
    description: "a",
    calories: 262,
    price: 16.0,
  },
  {
    name: "Cupcake",
    description: "a",
    calories: 305,
    price: 3.7,
  },
  {
    name: "Gingerbread",
    description: "a",
    calories: 356,
    price: 16.0,
  },
  {
    name: "Jelly bean",
    description: "a",
    calories: 375,
    price: 0.0,
  },
];

const columnHelper = createColumnHelper<Food>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("description", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("calories", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("price", {
    cell: (info) => info.getValue(),
  }),
];

const CardTableFood = ({ color }: { color: string }) => {
  const [data, setData] = React.useState(() => [...foodData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={
        "relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " +
        (color === "light" ? "bg-white" : "bg-slate-700 text-white")
      }
    >
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3
              className={
                "font-semibold text-lg " +
                (color === "light" ? "text-slate-700" : "text-white")
              }
            >
              Card Tables
            </h3>
          </div>
          <Modal />
        </div>
      </div>
      <div className="block w-full overflow-x-auto overflow-y-">
        {/* Projects table */}
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={
                      "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                      (color === "light"
                        ? "bg-slate-50 text-slate-500 border-slate-100"
                        : "bg-slate-600 text-slate-200 border-slate-500")
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    </div>
  );
};

export default CardTableFood;
