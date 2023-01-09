import React from "react";
import ComboBox from "../../common/FormElement/ComboBox";
import Textbox from "../../common/FormElement/Textbox";

const RestaurantSignUp = () => {
  return (
    <div className="p-12">
      <div className="flex">
        <h2 className="text-2xl font-bold">Get Started</h2>
      </div>
      <div className="mb-2">
        <Textbox placeholder="Store name" />
      </div>
      <div className="mb-2">
        <ComboBox placeholder="Store address" />
      </div>
      <div className="mb-2">
        <Textbox placeholder="Floor / Suite (Optional)" />
      </div>
      <div className="mt-6 flex">
        <div className="mr-2 w-1/2">
          <div className="mb-2">
            <Textbox placeholder="First name" />
          </div>
        </div>
        <div className="w-1/2">
          <div className="mb-2">
            <Textbox placeholder="Last name" />
          </div>
        </div>
      </div>
      <div className="mb-2">
        <Textbox placeholder="Email" />
      </div>
    </div>
  );
};

export default RestaurantSignUp;
