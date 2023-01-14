import "@fortawesome/fontawesome-free/css/all.min.css";
import "styles/tailwind.css";
import "styles/index.css";
import "styles/frontend/card/imageSlider.css";
import "styles/frontend/card/eventCard.css";
import "styles/frontend/card/historyCard.css";
import "styles/frontend/Navbar/navbar.css"
import "styles/frontend/card/bookingCard.css"
import "styles/frontend/card/summary.css"
import "styles/frontend/account/account.css"
import "styles/frontend/restaurant/restaurant.css"
import "styles/frontend/summary/summary.css"

import React from "react";
import ReactDOM from "react-dom";
// import App from "next/app";
// import Head from "next/head";
// import Router from "next/router";
// import App from "node_modules/next/app";
import Head from "node_modules/next/head";
import Router from "node_modules/next/router";
import { SessionProvider } from "next-auth/react"

import PageChange from "components/PageChange/PageChange";

import "@fortawesome/fontawesome-free/css/all.min.css";

Router.events.on("routeChangeStart", (url) => {

  document.body.classList.add("body-page-transition");
  ReactDOM.render(
    <PageChange path={url} />,
    document.getElementById("page-transition")
  );
});
Router.events.on("routeChangeComplete", () => {
  ReactDOM.unmountComponentAtNode(document.getElementById("page-transition"));
  document.body.classList.remove("body-page-transition");
});
Router.events.on("routeChangeError", () => {
  ReactDOM.unmountComponentAtNode(document.getElementById("page-transition"));
  document.body.classList.remove("body-page-transition");
});

export default function App({
  Component, pageProps: { session, ...pageProps }
}) {
  const Layout = Component.layout || (({ children }) => <>{children}</>);

  return (
    <SessionProvider session={session}>
      <React.Fragment>
        <Head>

        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </React.Fragment>

    </SessionProvider>
  )
}