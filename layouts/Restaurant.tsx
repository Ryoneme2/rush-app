import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar";
import MobileNavbar from "components/Navbars/IndexMobileNavbar";
import { useRouter } from "next/router";

export default function Restaurant({ children }) {
  const router = useRouter()
  return (
    <>
      {/* <Sidebar /> */}
      {/* <AdminNavbar /> */}
      {/* Header */}
      <div className="hidden lg:block">
        <IndexNavbar />
      </div>

      <div className="block lg:hidden">
        <div className="font-bold flex flex-row justify-left pt-8 px-6 lg:px-0  cursor-pointer" onClick={() => { router.push("/") }}>
          <div className="mr-4 text-base">
            <i className="fas fa-chevron-left"></i>
          </div>
          <h2 className="text-base">Back to homepage</h2>
        </div>
      </div>

      {/* body container */}
      <div className="">
        {children}
        {/* <FooterAdmin /> */}
      </div>
    </>
  );
}