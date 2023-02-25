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
    <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-[0_4px_4px_0_rgba(0,0,0,0.1)]">
      <div className="flex w-full items-center justify-between">
        <div className="text-virparyasMainBlue">
          <p className="text-xl font-medium md:mt-2 md:text-3xl">{text}</p>
          <p className="text-xs font-light md:mb-2 md:text-base">{subtext}</p>
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
