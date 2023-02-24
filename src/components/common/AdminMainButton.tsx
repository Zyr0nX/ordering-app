import React from "react";

interface AdminMainButtonProps {
  text: string;
  icon: React.ReactNode;
}

const AdminMainButton: React.FC<AdminMainButtonProps> = ({ text, icon }) => {
  return (
    <div className="bg-white h-40 flex justify-center items-center flex-col rounded-2xl shadow-[0_4px_5px_0_rgba(0,0,0,0.1)] gap-2 md:flex-row md:gap-8">
      <div>{icon}</div>

      <p className="text-virparyasMainBlue font-medium text-xl md:text-4xl">
        {text}
      </p>
    </div>
  );
};

export default AdminMainButton;
