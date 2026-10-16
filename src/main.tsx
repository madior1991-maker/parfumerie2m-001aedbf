import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { router } from "./router";
import "./styles.css";

// Les données structurées écrites au build servent aux robots sans JavaScript ;
// une fois le site chargé, chaque page fournit les siennes.
document.querySelectorAll("script[data-seo-static]").forEach((node) => node.remove());

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);