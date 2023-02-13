// layout for page
import React from "react";

import Admin from "../../components/layouts/Admin";
// components
import CardTable from "../../components/notus/Cards/CardTable";
import CardTableFood from "../../components/notus/Cards/CardTableFood";
import CardTableTest from "../../components/notus/Cards/CartTableTest";

export default function Tables() {
  const [data, setData] = React.useState([]);
  return (
    <Admin>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <CardTable />
        </div>
        <div className="w-full mb-12 px-4">
          <CardTableFood color="light" />
        </div>
        {/* <div className="w-full mb-12 px-4">
          <CardTableTest color="dark" />
        </div> */}
      </div>
    </Admin>
  );
}
