import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
  type NextPage,
} from "next";
import { useRouter } from "next/router";
import React from "react";
import Guest from "~/components/layouts/Guest";
import CheckoutBody from "~/components/ui/CheckoutBody";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Checkout: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, country }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Checkout" />
        <CheckoutBody user={user} country={country} />
      </>
    </Guest>
  );
};

export default Checkout;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id, country } = context.query;

  if (!id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      cartItem: {
        include: {
          food: {
            include: {
              restaurant: true,
            },
          },
          foodOption: true,
        },
      },
    },
  });

  if (!user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user,
      country: country as string,
    },
  };
};

// export const getServerSideProps = async (
//   context: GetServerSidePropsContext
// ) => {
//   const { orderId } = context.query;

//   const order = await prisma.order.findUnique({
//     where: {
//       id: orderId as string,
//     },
//     include: {
//       cartItem: {
//         include: {
//           food: {
//             include: {
//               restaurant: true,
//             },
//           },
//           foodOption: true,
//         },
//       },
//     },
//   });

//   const session = await getServerAuthSession(context);

//   if (!order || order.userId !== session?.user.id) {
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {
//       order,
//     },
//   };
// };
