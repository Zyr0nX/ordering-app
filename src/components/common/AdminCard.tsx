import React from "react";

interface AdminCardProps {
  text: string;
  subtext: string;
  icon1: React.ReactNode;
  icon2: React.ReactNode;
}

const AdminCard: React.FC<AdminCardProps> = ({
  text,
  subtext,
  icon1,
  icon2,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_4px_0_rgba(0,0,0,0.1)] p-4 pt-3 flex-auto flex">
      <div className="flex justify-between items-center w-full">
        <div className="text-virparyasMainBlue">
          <p className="font-medium text-xl md:text-3xl md:mt-2">{text}</p>
          <p className="font-light text-xs md:text-base md:mb-2">{subtext}</p>
        </div>
        <div className="flex">
          <div className="mr-2">{icon1}</div>
          <div>{icon2}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminCard;
