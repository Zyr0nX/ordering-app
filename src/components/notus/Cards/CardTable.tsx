// components
import { useSession } from "next-auth/react";
import Image from "next/image";
import PropTypes from "prop-types";
import React from "react";
import { create } from "zustand";

import { trpc } from "../../../utils/trpc";
import useInput from "../../../utils/useInput";
import Modal from "../Components/Modal";
import TableDropdown from "../Dropdowns/TableDropdown";
import AddFood from "../Forms/AddFood";

export default function CardTable({ color }: { color: string }) {
  const restaurantId = useSession().data?.user?.restaurantId;

  const [showModal, setShowModal] = React.useState(false);

  const name = useInput<string>("");
  const description = useInput<string>("");
  const price = useInput<number>(0);
  const calories = useInput<number>(0);
  const mutation = trpc.restaurant.createFood.useMutation();

  const onSubmit = () => {
    mutation.mutate({
      name: name.value,
      description: description.value,
      price: Number(price.value),
      calories: Number(calories.value),
      restaurantId: restaurantId ?? "",
    });
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
                  <form
                    method="post"
                    className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none"
                  >
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
                    <AddFood
                      name={name}
                      description={description}
                      price={price}
                      calories={calories}
                    />
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
                        onClick={() => {
                          onSubmit();
                          setShowModal(false);
                        }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
            </>
          ) : null}
        </div>
      </div>
      <div className="block w-full overflow-x-auto overflow-y-">
        {/* Projects table */}
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              <th
                className={
                  "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                  (color === "light"
                    ? "bg-slate-50 text-slate-500 border-slate-100"
                    : "bg-slate-600 text-slate-200 border-slate-500")
                }
              >
                Project
              </th>
              <th
                className={
                  "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                  (color === "light"
                    ? "bg-slate-50 text-slate-500 border-slate-100"
                    : "bg-slate-600 text-slate-200 border-slate-500")
                }
              >
                Budget
              </th>
              <th
                className={
                  "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                  (color === "light"
                    ? "bg-slate-50 text-slate-500 border-slate-100"
                    : "bg-slate-600 text-slate-200 border-slate-500")
                }
              >
                Status
              </th>
              <th
                className={
                  "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                  (color === "light"
                    ? "bg-slate-50 text-slate-500 border-slate-100"
                    : "bg-slate-600 text-slate-200 border-slate-500")
                }
              >
                Users
              </th>
              <th
                className={
                  "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                  (color === "light"
                    ? "bg-slate-50 text-slate-500 border-slate-100"
                    : "bg-slate-600 text-slate-200 border-slate-500")
                }
              >
                Completion
              </th>
              <th
                className={
                  "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                  (color === "light"
                    ? "bg-slate-50 text-slate-500 border-slate-100"
                    : "bg-slate-600 text-slate-200 border-slate-500")
                }
              ></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                {/* <Image
                    src="https://via.placeholder.com/100.png"
                    className="h-12 w-12 bg-white rounded-full border"
                    alt="..."
                    fill
                  ></Image>{" "} */}
                <span
                  className={
                    "ml-3 font-bold " +
                    +(color === "light" ? "text-slate-600" : "text-white")
                  }
                >
                  Argon Design System
                </span>
              </th>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                $2,500 USD
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <i className="fas fa-circle text-orange-500 mr-2"></i> pending
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex">
                  {/* <Image
                      src="https://via.placeholder.com/800"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow"
                      fill
                    ></Image>
                    <Image
                      src="https://via.placeholder.com/800"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                      fill
                    ></Image>
                    <Image
                      src="https://via.placeholder.com/800"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                      fill
                    ></Image>
                    <Image
                      src="https://via.placeholder.com/800"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                      fill
                    ></Image> */}
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex items-center">
                  <span className="mr-2">60%</span>
                  <div className="relative w-full">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
                      <div
                        style={{ width: "60%" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                <TableDropdown />
              </td>
            </tr>
            <tr>
              <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                {/* <Image
                    src="https://via.placeholder.com/24"
                    className="h-12 w-12 bg-white rounded-full border"
                    alt="..."
                    fill
                  ></Image>{" "}
                  <span
                    className={
                      "ml-3 font-bold " +
                      +(color === "light" ? "text-slate-600" : "text-white")
                    }
                  >
                    Angular Now UI Kit PRO
                  </span> */}
              </th>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                $1,800 USD
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <i className="fas fa-circle text-emerald-500 mr-2"></i>{" "}
                completed
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex">
                  {/* <Image
                      src="/img/team-1-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow"
                    ></Image>
                    <Image
                      src="/img/team-2-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image>
                    <Image
                      src="/img/team-3-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image>
                    <Image
                      src="/img/team-4-470x470.png"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image> */}
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex items-center">
                  <span className="mr-2">100%</span>
                  <div className="relative w-full">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-emerald-200">
                      <div
                        style={{ width: "100%" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                <TableDropdown />
              </td>
            </tr>
            <tr>
              <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                {/* <Image
                    src="/img/sketch.jpg"
                    className="h-12 w-12 bg-white rounded-full border"
                    alt="..."
                  ></Image>{" "} */}
                <span
                  className={
                    "ml-3 font-bold " +
                    +(color === "light" ? "text-slate-600" : "text-white")
                  }
                >
                  Black Dashboard Sketch
                </span>
              </th>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                $3,150 USD
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <i className="fas fa-circle text-red-500 mr-2"></i> delayed
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex">
                  {/* <Image
                      src="/img/team-1-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow"
                    ></Image>
                    <Image
                      src="/img/team-2-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image>
                    <Image
                      src="/img/team-3-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image>
                    <Image
                      src="/img/team-4-470x470.png"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image> */}
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex items-center">
                  <span className="mr-2">73%</span>
                  <div className="relative w-full">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
                      <div
                        style={{ width: "73%" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                <TableDropdown />
              </td>
            </tr>
            <tr>
              <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                {/* <Image
                    src="/img/react.jpg"
                    className="h-12 w-12 bg-white rounded-full border"
                    alt="..."
                  ></Image>{" "} */}
                <span
                  className={
                    "ml-3 font-bold " +
                    +(color === "light" ? "text-slate-600" : "text-white")
                  }
                >
                  React Material Dashboard
                </span>
              </th>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                $4,400 USD
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <i className="fas fa-circle text-teal-500 mr-2"></i> on schedule
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex">
                  {/* <Image
                      src="/img/team-1-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow"
                    ></Image>
                    <Image
                      src="/img/team-2-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image>
                    <Image
                      src="/img/team-3-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image>
                    <Image
                      src="/img/team-4-470x470.png"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image> */}
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex items-center">
                  <span className="mr-2">90%</span>
                  <div className="relative w-full">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-teal-200">
                      <div
                        style={{ width: "90%" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                <TableDropdown />
              </td>
            </tr>
            <tr>
              <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                {/* <Image
                    src="/img/vue.jpg"
                    className="h-12 w-12 bg-white rounded-full border"
                    alt="..."
                  ></Image>{" "} */}
                <span
                  className={
                    "ml-3 font-bold " +
                    +(color === "light" ? "text-slate-600" : "text-white")
                  }
                >
                  React Material Dashboard
                </span>
              </th>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                $2,200 USD
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <i className="fas fa-circle text-emerald-500 mr-2"></i>{" "}
                completed
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex">
                  {/* <Image
                      src="/img/team-1-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow"
                    ></Image>
                    <Image
                      src="/img/team-2-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image>
                    <Image
                      src="/img/team-3-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image>
                    <Image
                      src="/img/team-4-470x470.png"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></Image> */}
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                <div className="flex items-center">
                  <span className="mr-2">100%</span>
                  <div className="relative w-full">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-emerald-200">
                      <div
                        style={{ width: "100%" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                <TableDropdown />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

CardTable.defaultProps = {
  color: "light",
};

CardTable.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};
