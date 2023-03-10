import Image from "next/image";
import React from "react";

const CartCard = () => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      <div
        className="bg-black/50 p-6 text-white w-full"
        style={{
          background:
            "linear-gradient(#00000080, #00000080), url(https://res.cloudinary.com/dkxjgboi8/image/upload/v1677952239/photo-1504674900247-0877df9cc836_dieukj.jpg) no-repeat center center/cover",
        }}
      >
        <p className="font-bold text-2xl mt-10">Sabrina’s Cafe</p>
        <p className="text-xs mt-1">123 33th Street, Philadelphia, PA 19104</p>
      </div>
      <div>
        <div className="flex flex-col gap-4 m-4 text-virparyasMainBlue">
            <div className="flex justify-between">
                <div>
                    <p>1. Sabrina’s Special Sandwich</p>
                    <p>Steak, sautée spinach, red peppers, provolon</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
