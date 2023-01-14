import React, { useState } from "react";

// import "styles/tailwind.css";
// components

import AdminNavbar from "components/Navbars/AdminNavbar";
import Sidebar from "components/Sidebar/Sidebar";
import HeaderStats from "components/Headers/HeaderStats";
import FooterAdmin from "components/Footers/FooterAdmin";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import LogoutAdmin from "components/Headers/LogoutAdmin";


export async function getServerSideProps(session) {
  // const session = await getSession(ctx)
  const router = useRouter()
  // 

  return { redirect: { destination: '/' } }

}
async function checkRole(session): Promise<any> {
  return session
}
export default function Admin({ children }) {
  const [role, setRole] = useState()
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
        {/* <AdminNavbar /> */}
        <LogoutAdmin />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full min-h-screen -m-24">
          {children}
          <FooterAdmin />
        </div>
      </div>
    </>
  );



  // return (
  //   <>
  //     <Sidebar />
  //     <div className="relative md:ml-64 bg-blueGray-100">
  //       <AdminNavbar />
  //       {/* Header */}
  //       <HeaderStats />
  //       <div className="px-4 md:px-10 mx-auto w-full min-h-screen -m-24">
  //         {children}
  //         <FooterAdmin />
  //       </div>
  //     </div>
  //   </>
  // );
}
