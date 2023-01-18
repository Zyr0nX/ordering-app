import type { ImageProps } from "next/image";
import Image from "next/image";
import React from "react";

export interface CaregoryTagProps extends ImageProps {
  name: string;
  href: string;
}

const CaregoryTag: React.FC<CaregoryTagProps> = ({ ...props }) => {
  return (
    <a className="flex flex-col items-center" href={props.href}>
      <Image
        width={60}
        height={60}
        alt={props.alt}
        src={props.src}
        className="hover:bg-neutral-200 rounded-full"
      />
      <div className="text-center text-sm font-medium pt-2">{props.name}</div>
    </a>
  );
};

export default CaregoryTag;
