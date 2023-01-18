import React from "react";

import Deals from "../../../../public/deals.png";
import CaregoryTag from "./CaregoryTag";

const CategoryBar = () => {
  return (
    <ul className="flex justify-center">
      <li className="pr-4 last:pr-0">
        <CaregoryTag name="Deals" href="/deals" src={Deals} alt="deal" />
      </li>
      <li className="pr-4 last:pr-0">
        <CaregoryTag name="Deals" href="/deals" src={Deals} alt="deal" />
      </li>
      <li className="pr-4 last:pr-0">
        <CaregoryTag name="Deals" href="/deals" src={Deals} alt="deal" />
      </li>
      <li className="pr-4 last:pr-0">
        <CaregoryTag name="Deals" href="/deals" src={Deals} alt="deal" />
      </li>
      <li className="pr-4 last:pr-0">
        <CaregoryTag name="Deals" href="/deals" src={Deals} alt="deal" />
      </li>
      <li className="pr-4 last:pr-0">
        <CaregoryTag name="Deals" href="/deals" src={Deals} alt="deal" />
      </li>
      <li className="pr-4 last:pr-0">
        <CaregoryTag name="Deals" href="/deals" src={Deals} alt="deal" />
      </li>
    </ul>
  );
};

export default CategoryBar;
