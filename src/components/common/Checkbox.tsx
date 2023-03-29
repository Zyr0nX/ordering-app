import CheckmarkIcon from "../icons/CheckmarkIcon";
import { Switch } from "@headlessui/react";
import React, { useState } from "react";

interface CheckboxProps {
  handleChange: () => void;
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ handleChange, label }) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch.Group as="div" className="flex items-center gap-2">
      <Switch
        onClick={handleChange}
        checked={enabled}
        onChange={setEnabled}
        className={`${
          enabled
            ? "bg-viparyasDarkBlue"
            : "border-virparyasMainBlue border-2 bg-transparent"
        } flex h-5 w-5 items-center justify-center focus-within:outline-none`}
      >
        {enabled && <CheckmarkIcon />}
      </Switch>
      {label && (
        <Switch.Label className={`font-roboto ${enabled ? "font-bold" : ""}`}>
          {label}
        </Switch.Label>
      )}
    </Switch.Group>
  );
};

export default Checkbox;
