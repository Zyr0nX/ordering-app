import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { IncomingMessage, ServerResponse } from "http";
import {
  InferGetServerSidePropsType,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { createContext } from "../../../server/trpc/context";
import { trpc } from "../../../utils/trpc";

interface Food {
  name: string;
  description: string;
  image: string;
  calories: number;
  price: number;
}

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

const CardTableFood = ({
  color,
  session,
}: {
  color: string;
  session: InferGetServerSidePropsType<typeof getServerSideProps>;
}) => {
  const [data, setData] = React.useState<Food[]>();
  console.log(session);
  // const foodQuery = trpc.food.getByRestaurantId.useQuery({
  //   restaurantId: session,
  // });
  // setData(foodQuery.data as Food[]);

  const [showModal, setShowModal] = React.useState(false);
  const [image, setImage] = React.useState<string | null>(null);

  const name = useRef<HTMLInputElement>(null);
  const description = useRef<HTMLInputElement>(null);
  const price = useRef<HTMLInputElement>(null);
  const calories = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const table = useReactTable({
    data: data as Food[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const onFileUploadChange = async () => {
    const files = imageRef.current?.files;

    if (files) {
      const formData = new FormData();
      formData.append("file", files[0] as Blob);
      formData.append("upload_preset", "fn6bsq9s");
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dkxjgboi8/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setImage(data.secure_url);
    }
  };

  const onFileUploadRemove = () => {
    setImage(null);
  };

  const createFoodMutation = trpc.food.create.useMutation();

  const onSubmit = async () => {
    const food = {
      name: name.current?.value || "",
      description: description.current?.value || "",
      price: parseFloat(price.current?.value || "0"),
      calories: parseInt(calories.current?.value || "0"),
      image: image || "",
      restaurantId: session?.user?.restaurantId as string,
    };

    createFoodMutation.mutateAsync(food);
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
                          ref={name}
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
                          ref={description}
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
                          ref={price}
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
                          ref={calories}
                        />
                      </div>
                      <div className="mb-3 pt-0">
                        <label htmlFor="image" className="py-3 text-sm">
                          Image:
                        </label>
                        <div className="flex flex-col items-center px-3 py-3 text-slate-600 relative bg-white rounded text-sm border border-slate-300 w-full">
                          {!image ? (
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
                            <div className="flex flex-col items-center">
                              <Image
                                src={image}
                                alt="image"
                                width={694}
                                height={345.25}
                                className="rounded-lg w-auto h-auto"
                              />
                              <button
                                className="mt-4 bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={onFileUploadRemove}
                              >
                                Remove
                              </button>
                            </div>
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
                        onClick={onSubmit}
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
        {data && (
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CardTableFood;

export const getServerSideProps = async (context: CreateNextContextOptions) => {
  const session = await createContext(context);
  console.log(session);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
