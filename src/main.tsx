import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/**
 * Application entry point.
 *
 * Performance note: StrictMode is enabled for development to catch
 * issues early. It causes double-renders in dev but has zero
 * production overhead.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

