import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import loadable from "@loadable/component";
import Workspace from "./layouts/Workspace";

const Login = loadable(() => import("./pages/Login"));
const Signup = loadable(() => import("./pages/Signup"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/workspace/:workspace/*" element={<Workspace />} />
    </Routes>
  );
}

export default App;
