import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setDefaultHeaders } from "@workspace/api-client-react";
import { sessionHeaders } from "@/lib/session";

setDefaultHeaders(() => sessionHeaders());

createRoot(document.getElementById("root")!).render(<App />);
