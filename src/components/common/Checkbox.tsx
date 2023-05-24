import CheckmarkIcon from "../icons/CheckmarkIcon";
import { Switch } from "@headlessui/react";
import React, { useState } from "react";

interface CheckboxProps {
  handleChange: () => void;
  label?: string;
  disable?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  handleChange,
  label,
  disable,
}) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch.Group as="div" className="flex items-center gap-2">
      <Switch
        onClick={() => {
          if (disable && !enabled) return;
          handleChange();
        }}
        checked={enabled}
        onChange={() => {
          if (disable && !enabled) return;
          setEnabled(!enabled);
        }}
        disabled={!enabled && disable}
        className={`${
          enabled
            ? "bg-viparyasDarkBlue"
            : disable
            ? "bg-gray-500"
            : "border-2 border-virparyasMainBlue bg-transparent"
        } flex h-5 w-5 items-center justify-center focus-within:outline-none`}
      >
        {enabled && <CheckmarkIcon />}
      </Switch>
      {label && (
        <Switch.Label
          className={`font-roboto ${
            enabled ? "font-bold" : disable ? "text-gray-500" : ""
          }`}
        >
          {label}
        </Switch.Label>
      )}
    </Switch.Group>
  );
};

export default Checkbox;
