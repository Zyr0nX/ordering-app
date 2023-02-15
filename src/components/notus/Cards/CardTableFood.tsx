import { Prisma } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useRef, useState } from "react";

import { trpc } from "../../../utils/trpc";
import useInput from "../../../utils/useInput";
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

  const [showModal, setShowModal] = React.useState(false);
  const [uploaded, setUploaded] = React.useState(false);

  const name = useInput<string>("");
  const description = useInput<string>("");
  const price = useInput<number>(0);
  const calories = useInput<number>(0);
  const imageRef = useRef<HTMLInputElement>(null);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  console.log(imageRef.current?.files?.[0]);

  const uploadFileMutation = trpc.file.upload.useMutation();

  const onFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileMutation.mutateAsync(file);
    }
    setUploaded(true);
  };

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
          <button
            className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={() => setShowModal(true)}
          >
            Create
          </button>
          {showModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative my-6 mx-auto w-[48rem]">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">Create</h3>
                      <button
                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                        onClick={() => setShowModal(false)}
                      >
                        <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                          ×
                        </span>
                      </button>
                    </div>
                    {/*body*/}
                    <div className="relative p-6 flex-auto">
                      <div className="mb-3 pt-0">
                        <label htmlFor="name" className="py-3 text-sm">
                          Name:
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Name"
                          className="px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm border border-slate-300 outline-none focus:outline-none focus:shadow-outline w-full"
                          value={name.value}
                          onChange={name.onChange}
                        />
                      </div>
                      <div className="mb-3 pt-0">
                        <label htmlFor="description" className="py-3 text-sm">
                          Description:
                        </label>
                        <input
                          id="description"
                          name="description"
                          type="text"
                          placeholder="Description"
                          className="px-3 py-3 placeholder-slate-300 text-slate-600 relative bg-white rounded text-sm border border-slate-300 outline-none focus:outline-none focus:shadow-outline w-full"
                          value={description.value}
                          onChange={description.onChange}
                        />
                      </div>
                      <div className="mb-3 pt-0">
                        <label htmlFor="price" className="py-3 text-sm">
                          Price:
                        </label>
                        <input
                          id="price"
                          name="price"
                          type="number"
                          min={0}
                          placeholder="Price"
                          className="px-3 py-3 placeholder-slate-300 text-slate-600 relative bg-white rounded text-sm border border-slate-300 outline-none focus:outline-none focus:shadow-outline w-full"
                          value={price.value}
                          onChange={price.onChange}
                        />
                      </div>
                      <div className="mb-3 pt-0">
                        <label htmlFor="calories" className="py-3 text-sm">
                          Calories:
                        </label>
                        <input
                          id="calories"
                          name="calories"
                          type="number"
                          min={0}
                          placeholder="Calories"
                          className="px-3 py-3 placeholder-slate-300 text-slate-600 relative bg-white rounded text-sm border border-slate-300 outline-none focus:outline-none focus:shadow-outline w-full"
                          value={calories.value}
                          onChange={calories.onChange}
                        />
                      </div>
                      <div className="mb-3 pt-0">
                        <label htmlFor="image" className="py-3 text-sm">
                          Image:
                        </label>
                        <div className="flex flex-col items-center px-3 py-3 text-slate-600 relative bg-white rounded text-sm border border-slate-300 w-full">
                          {!uploaded ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                />
                              </svg>
                              <div className="">Click here to upload file</div>
                              <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className="w-full h-full opacity-0 absolute top-0"
                                ref={imageRef}
                                onChange={onFileUploadChange}
                              />
                            </>
                          ) : (
                            <div className="flex flex-col items-center"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/*footer*/}
                    <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                      <button
                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>
                      <button
                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="submit"
                        onClick={() => setShowModal(false)}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
            </>
          ) : null}
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
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
                    className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CardTableFood;
