import React from "react";
import { BrowserRouter as Router, Route, Routes, useRoutes } from 'react-router-dom';
import Announcements from "./home/announcements/Announcements";
import Home from "./home/Home";
import TopBar from "./TopBar";

function Main() {

    const routes = useRoutes([
        { path: "/", element: <Home /> }
    ])

    return (
        <div className="main-view">
            <TopBar />
            {routes}
        </div>
    )
}

export default Main