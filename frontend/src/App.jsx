import React, { useEffect, useState } from "react";
import Landing from "./pages/Landing.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import ChatWindow from "./components/ChatWindow.jsx";  
import './App.css'

function useMiniRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, "", to);
      setPath(to);
    }
  };

  return { path, navigate };
}

export default function App() {
  const { path, navigate } = useMiniRouter();

  if (path === "/upload") return <UploadPage navigate={navigate} />;
  if (path === "/chat") return <ChatWindow navigate={navigate} />;  // Your existing chat
  return <Landing navigate={navigate} />;  // New professional landing
}