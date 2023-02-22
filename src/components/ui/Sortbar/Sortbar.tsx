import { Disclosure, RadioGroup } from "@headlessui/react";
import React, { useState } from "react";

const Sortbar = () => {
  const [sort, setSort] = useState("startup");
  return (
    <div className="px-3 w-1/4 my-6 max-h-screen sticky">
      <Disclosure>
        <Disclosure.Button className="text-lg font-medium">
          Sort
        </Disclosure.Button>
        <Disclosure.Panel className="py-3">
          <RadioGroup value={sort} onChange={setSort}>
            <RadioGroup.Label>Sort</RadioGroup.Label>
            <RadioGroup.Option value="startup">
              {({ checked }) => (
                <span className={checked ? "bg-blue-200" : ""}>Startup</span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value="business">
              {({ checked }) => (
                <span className={checked ? "bg-blue-200" : ""}>Business</span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value="enterprise">
              {({ checked }) => (
                <span className={checked ? "bg-blue-200" : ""}>Enterprise</span>
              )}
            </RadioGroup.Option>
          </RadioGroup>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
};

export default Sortbar;
