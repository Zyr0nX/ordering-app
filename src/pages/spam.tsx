import React from "react";
import { api } from "~/utils/api";

const spam = () => {
  const a = api.spam.test.useQuery();
  const spam = () => {
    void a.refetch();
  };
  return <button onClick={spam}>spam</button>;
};

export default spam;
