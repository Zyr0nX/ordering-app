import React from "react";

import Backdrop from "../../common/Backdrop";

export interface CartProps {
  cart: boolean;
  toggleCart?: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, toggleCart }) => {
  return (
    <Backdrop visible={cart} onClick={toggleCart}>
      <aside
        className={`relative z-10 box-border w-75 max-w-4/5 overflow-y-auto overflow-x-hidden bg-white p-6 shadow-[0px_0px_25px_rgba(0_0_0_0.1)] transition-all duration-400 ease-in-out ${
          sidebar ? "translate-x-0 opacity-100" : "-translate-x-75 opacity-0"
        }`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {sidebar &&
          (sessionData?.user ? (
            <>
              <div className="flex items-center">
                <Image
                  src={user?.image ?? "/default.jpeg"}
                  width={48}
                  height={48}
                  alt="avatar"
                  className="rounded-full"
                  placeholder="blur"
                  blurDataURL="/default.jpeg"
                />
                <div className="m-0 h-1 w-4 shrink-0 p-0"></div>
                <div>
                  <div className="text-base font-medium leading-6">
                    {user?.name ?? user?.email}
                  </div>
                  <a
                    href="#"
                    className="text-sm font-normal leading-4 text-green-500"
                  >
                    View account
                  </a>
                </div>
              </div>
              <div className="flex flex-row items-start pt-6">
                <button
                  className="py-3 px-0 text-base font-medium leading-5 text-neutral-500"
                  onClick={() => {
                    signOut({ redirect: false });
                  }}
                >
                  Sign out
                </button>
              </div>
              <div className="my-3 -mx-6 h-px bg-neutral-200"></div>
              <div>
                <div className="my-6 flex flex-col">
                  <ul>
                    <li className="mb-4">
                      <Link className="m-3 text-sm" href="/restaurant/signup">
                        Add your restaurant
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between">
              <div>
                <Anchor
                  backgroundColor="black"
                  name="Sign Up"
                  variant="large"
                  href="./signin"
                />
                <div className="h-2"></div>
                <Anchor
                  backgroundColor="gray"
                  name="Log In"
                  variant="large"
                  href="./login"
                />
              </div>
            </div>
          ))}
      </aside>
    </Backdrop>
  );
};

export default Cart;