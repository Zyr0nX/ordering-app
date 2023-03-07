import React, { type HtmlHTMLAttributes } from "react";

const CategoryIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg
      width="65"
      height="64"
      viewBox="0 0 65 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.61112 64C5.65556 64 3.98089 63.3031 2.58712 61.9093C1.19334 60.5156 0.497636 58.8421 0.500006 56.8889V7.11112C0.500006 5.15556 1.19689 3.48089 2.59067 2.08712C3.98445 0.693339 5.65793 -0.00236433 7.61112 6.0366e-06H57.3889C59.3444 6.0366e-06 61.0191 0.696895 62.4129 2.09067C63.8067 3.48445 64.5024 5.15793 64.5 7.11112V56.8889C64.5 58.8444 63.8031 60.5191 62.4093 61.9129C61.0156 63.3067 59.3421 64.0024 57.3889 64H7.61112ZM18.2778 49.7778C19.2852 49.7778 20.1302 49.4364 20.8129 48.7538C21.4956 48.0711 21.8357 47.2273 21.8333 46.2222C21.8333 45.2148 21.492 44.3698 20.8093 43.6871C20.1267 43.0044 19.2828 42.6643 18.2778 42.6667C17.2704 42.6667 16.4253 43.008 15.7427 43.6907C15.06 44.3733 14.7199 45.2172 14.7222 46.2222C14.7222 47.2296 15.0636 48.0747 15.7462 48.7573C16.4289 49.44 17.2727 49.7801 18.2778 49.7778ZM18.2778 35.5556C19.2852 35.5556 20.1302 35.2142 20.8129 34.5316C21.4956 33.8489 21.8357 33.005 21.8333 32C21.8333 30.9926 21.492 30.1476 20.8093 29.4649C20.1267 28.7822 19.2828 28.4421 18.2778 28.4444C17.2704 28.4444 16.4253 28.7858 15.7427 29.4684C15.06 30.1511 14.7199 30.995 14.7222 32C14.7222 33.0074 15.0636 33.8524 15.7462 34.5351C16.4289 35.2178 17.2727 35.5579 18.2778 35.5556ZM18.2778 21.3333C19.2852 21.3333 20.1302 20.992 20.8129 20.3093C21.4956 19.6267 21.8357 18.7828 21.8333 17.7778C21.8333 16.7704 21.492 15.9253 20.8093 15.2427C20.1267 14.56 19.2828 14.2199 18.2778 14.2222C17.2704 14.2222 16.4253 14.5636 15.7427 15.2462C15.06 15.9289 14.7199 16.7727 14.7222 17.7778C14.7222 18.7852 15.0636 19.6302 15.7462 20.3129C16.4289 20.9956 17.2727 21.3357 18.2778 21.3333ZM32.5 49.7778H46.7222C47.7296 49.7778 48.5747 49.4364 49.2573 48.7538C49.94 48.0711 50.2801 47.2273 50.2778 46.2222C50.2778 45.2148 49.9364 44.3698 49.2538 43.6871C48.5711 43.0044 47.7273 42.6643 46.7222 42.6667H32.5C31.4926 42.6667 30.6476 43.008 29.9649 43.6907C29.2822 44.3733 28.9421 45.2172 28.9444 46.2222C28.9444 47.2296 29.2858 48.0747 29.9684 48.7573C30.6511 49.44 31.495 49.7801 32.5 49.7778ZM32.5 35.5556H46.7222C47.7296 35.5556 48.5747 35.2142 49.2573 34.5316C49.94 33.8489 50.2801 33.005 50.2778 32C50.2778 30.9926 49.9364 30.1476 49.2538 29.4649C48.5711 28.7822 47.7273 28.4421 46.7222 28.4444H32.5C31.4926 28.4444 30.6476 28.7858 29.9649 29.4684C29.2822 30.1511 28.9421 30.995 28.9444 32C28.9444 33.0074 29.2858 33.8524 29.9684 34.5351C30.6511 35.2178 31.495 35.5579 32.5 35.5556ZM32.5 21.3333H46.7222C47.7296 21.3333 48.5747 20.992 49.2573 20.3093C49.94 19.6267 50.2801 18.7828 50.2778 17.7778C50.2778 16.7704 49.9364 15.9253 49.2538 15.2427C48.5711 14.56 47.7273 14.2199 46.7222 14.2222H32.5C31.4926 14.2222 30.6476 14.5636 29.9649 15.2462C29.2822 15.9289 28.9421 16.7727 28.9444 17.7778C28.9444 18.7852 29.2858 19.6302 29.9684 20.3129C30.6511 20.9956 31.495 21.3357 32.5 21.3333Z"
        fill="#2E2C9A"
      />
    </svg>
  );
};

export default CategoryIcon;
