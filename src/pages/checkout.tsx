import { type InferGetServerSidePropsType, type GetServerSidePropsContext, type NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import Guest from "~/components/layouts/Guest";
import CheckoutBody from "~/components/ui/CheckoutBody";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Checkout: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ cart }) => {
  console.log(cart);
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Checkout" />
        <CheckoutBody cart={cart} />
      </>
    </Guest>
  );
};

export default Checkout;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id } = context.query;

  if (!id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const session = await getServerAuthSession(context);

  const cart = await prisma.cartItem.findMany({
    where: {
      userId: session?.user.id,
      food: {
        restaurant: {
          id: id as string,
        },
      }
    },
    include: {
      food: {
        include: {
          restaurant: true,
        },
      },
      foodOption: true,
    },
  })

  if (!cart) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      cart,
    },
  }
}

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
