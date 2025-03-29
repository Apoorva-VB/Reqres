import { useState } from "react";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";

import Login from "./Components/Login";
import User from "./Components/User";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />{" "}
          <Route path="/user" element={<User />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
