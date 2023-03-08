import { type GetServerSidePropsContext, type InferGetServerSidePropsType, type NextPage } from 'next';
import React from 'react';
import Admin from "~/components/layouts/Admin";
import AdminCommonHeader from '~/components/ui/AdminCommonHeader';
import AdminUsersBody from '~/components/ui/AdminUsersBody';
import { getServerAuthSession } from '~/server/auth';
import { prisma } from "~/server/db";


const Users: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ users }) => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Users" />
        <AdminUsersBody users={users} />
      </>
    </Admin>
  )
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || session.user.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const users = await prisma.user.findMany();

  return {
    props: {
      users
    },
  };
};

export default Users;