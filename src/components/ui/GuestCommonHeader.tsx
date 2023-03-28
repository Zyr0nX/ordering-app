import AccountIcon from "../icons/AccountIcon";
import BackArrowIcon from "../icons/BackArrowIcon";
import Link from "next/link";
import { useRouter } from "next/router";

const GuestCommonHeader = ({ text }: { text: string }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightBrown/80 p-4 text-white md:p-6">
      <button onClick={router.back}>
        <BackArrowIcon className="fill-white md:h-10 md:w-10" />
      </button>
      <div>
        <p className="text-center text-2xl font-bold">{text}</p>
      </div>
      <Link href="/account">
        <AccountIcon className="fill-white md:h-10 md:w-10" />
      </Link>
    </div>
  );
};

export default GuestCommonHeader;
