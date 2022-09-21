import React from "react";
import { useRoutes } from 'react-router-dom';
import Quiz from "./attempt/Quiz";
import Home from "./home/Home";
import Practice from "./practice/Practice";
import TopBar from "./TopBar";

function Main() {

    const routes = useRoutes([
        { path: "/", element: <Home /> },
        { path: "/practice", element: <Practice /> },
        { path: "/quiz", element: <Quiz /> }
    ])

    return (
        <div className="main-view">
            <TopBar />
            {routes}
        </div>
    )
}

export default Main