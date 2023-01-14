import React from "react";

// components

// layout for page

import BackOffice from "layouts/BackOffice";
import CardListMenuCategories from "components/BackOffice/Cards/CardListMenuCategories";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";


export async function getServerSideProps(context) {

  const prisma = new PrismaClient();
  const session = await getSession(context)
  if (!session) {
    return { redirect: { destination: '/auth/backoffice' } }
  }

  const response = await prisma.mENU_CATEGORIES.findMany({
    orderBy: [{ ID: "asc" }],
  });

  await prisma.$disconnect()
  const result = await JSON.parse(JSON.stringify(response));

  return { props: { menuCategories: result } };
}

export function MenuCategories({ menuCategories }) {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full h-screen">
          <CardListMenuCategories list={menuCategories} />
        </div>
      </div>
    </>
  );
}

MenuCategories.layout = BackOffice;

export default MenuCategories;
