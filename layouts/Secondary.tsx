import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar";
import MobileNavbar from "components/Navbars/IndexMobileNavbar";

export default function Secondary({ children }) {
  return (
    <>
      {/* <Sidebar /> */}
      {/* <AdminNavbar /> */}
      {/* Header */}

      {/* body container */}
      <div className="">
        {children}
        {/* <FooterAdmin /> */}
      </div>

      <MobileNavbar />
    </>
  );
}