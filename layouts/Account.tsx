import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar";
import MobileNavbar from "components/Navbars/IndexMobileNavbar";

export default function AccountLayout({ children }) {
  return (
    <>
      {/* <Sidebar /> */}
      {/* <AdminNavbar /> */}
      {/* Header */}
      <div className="hidden lg:block">
        <IndexNavbar />
      </div>
      {/* body container */}
      <div className="">
        {children}
        {/* <FooterAdmin /> */}
      </div>

      <MobileNavbar />
    </>
  );
}