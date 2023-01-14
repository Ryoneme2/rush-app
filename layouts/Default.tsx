import React from "react";

import IndexNavbar from "components/Navbars/IndexNavbar";
import MobileNavbar from "components/Navbars/IndexMobileNavbar";

export default function Default({ children }) {
  return (
    <>
      {/* <Sidebar /> */}
      {/* <AdminNavbar /> */}
      <IndexNavbar />
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