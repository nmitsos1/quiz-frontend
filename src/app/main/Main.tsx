import React from "react";
import { useRoutes } from 'react-router-dom';
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