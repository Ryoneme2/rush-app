import React from "react";

// components

import OfficeNavbar from "components/BackOffice/Navbars/OfficeNavbar";
import Sidebar from "components/BackOffice/Sidebar/Sidebar";
import HeaderStats from "components/Headers/HeaderStats";
import FooterAdmin from "components/Footers/FooterAdmin";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import LogoutAdmin from "components/Headers/LogoutAdmin";

export async function getServerSideProps(session) {

  const router = useRouter()
  return { redirect: { destination: '/' } }
}

export default function BackOffice({ children }) {

  const router = useRouter()

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/')
    },
  });

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        {/* <OfficeNavbar /> */}
        <LogoutAdmin />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          {children}
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
