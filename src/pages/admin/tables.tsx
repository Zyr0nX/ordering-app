// layout for page
import React from "react";

import Admin from "../../components/layouts/Admin";
// components
import CardTable from "../../components/notus/Cards/CardTable";

export default function Tables() {
  const [data, setData] = React.useState([]);
  return (
    <Admin>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <CardTable />
        </div>
        <div className="w-full mb-12 px-4">
          <CardTable color="dark" />
        </div>
      </div>
    </Admin>
  );
}
