import React from "react";

interface AdminMainButtonProps {
  text: string;
  icon: React.ReactNode;
}

const AdminMainButton: React.FC<AdminMainButtonProps> = ({ text, icon }) => {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-white shadow-[0_4px_5px_0_rgba(0,0,0,0.1)] md:flex-row md:gap-8">
      <div>{icon}</div>

      <p className="text-xl font-medium text-virparyasMainBlue md:text-4xl">
        {text}
      </p>
    </div>
  );
};

export default AdminMainButton;
