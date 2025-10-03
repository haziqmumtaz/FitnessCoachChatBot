import { useState } from "react";
import { ChatInterface } from "./components/ChatInterface";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <ChatInterface />
    </div>
  );
}

export default App;
