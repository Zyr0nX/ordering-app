import React from "react";

import type { useInputType } from "../../../utils/useInput";

interface AddFoodProps {
  name: useInputType<string>;
  description: useInputType<string>;
  calories: useInputType<number>;
  price: useInputType<number>;
}

const AddFood: React.FC<AddFoodProps> = ({
  name,
  description,
  calories,
  price,
}) => {
  return (
    <div className="relative p-6 flex-auto">
      <div className="mb-3 pt-0">
        <input
          name="name"
          type="text"
          placeholder="Name"
          className="px-3 py-3 placeholder-slate-300 text-slate-600 relative bg-white rounded text-sm border border-slate-300 outline-none focus:outline-none focus:shadow-outline w-full"
          value={name.value}
          onChange={name.onChange}
        />
      </div>
      <div className="mb-3 pt-0">
        <input
          name="description"
          type="text"
          placeholder="Description"
          className="px-3 py-3 placeholder-slate-300 text-slate-600 relative bg-white rounded text-sm border border-slate-300 outline-none focus:outline-none focus:shadow-outline w-full"
          value={description.value}
          onChange={description.onChange}
        />
      </div>
      <div className="mb-3 pt-0">
        <input
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
        <input
          name="calories"
          type="number"
          min={0}
          placeholder="Calories"
          className="px-3 py-3 placeholder-slate-300 text-slate-600 relative bg-white rounded text-sm border border-slate-300 outline-none focus:outline-none focus:shadow-outline w-full"
          value={calories.value}
          onChange={calories.onChange}
        />
      </div>
    </div>
  );
};

export default AddFood;
