import React from "react";

const AddFood = () => {
  return (
    <div className="relative p-6 flex-auto">
      <div className="mb-3 pt-0">
        <input
          type="text"
          placeholder="Name"
          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border border-blueGray-300 outline-none focus:outline-none focus:shadow-outline w-full"
        />
      </div>
      <div className="mb-3 pt-0">
        <input
          type="text"
          placeholder="Description"
          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border border-blueGray-300 outline-none focus:outline-none focus:shadow-outline w-full"
        />
      </div>
      <div className="mb-3 pt-0">
        <input
          type="number"
          min={0}
          placeholder="Price"
          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border border-blueGray-300 outline-none focus:outline-none focus:shadow-outline w-full"
        />
      </div>
      <div className="mb-3 pt-0">
        <input
          type="number"
          min={0}
          placeholder="Calories"
          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border border-blueGray-300 outline-none focus:outline-none focus:shadow-outline w-full"
        />
      </div>
    </div>
  );
};

export default AddFood;
