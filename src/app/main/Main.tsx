import React from "react";
import { useRoutes } from 'react-router-dom';
import Quiz from "./quiz/Quiz";
import Home from "./home/Home";
import Practice from "./practice/Practice";
import TopBar from "./TopBar";
import Attempt from "./quiz/attempt/Attempt";
import SchoolPage from "./schools/SchoolPage";
import { useQuery } from "@tanstack/react-query";
import { getMySchool, ROLE } from "./schools/SchoolModel";

function Main() {

    const {data: school} = useQuery(['my-school'], getMySchool)

    const routeArray = school?.role === ROLE.ADMIN ? [
        { path: "/", element: <Home /> },
        { path: "/practice", element: <Practice /> },
        { path: "/quiz", element: <Quiz /> },
        { path: "/attempt/:attemptId", element: <Attempt /> },
        { path: "/schools", element: <SchoolPage /> }
    ]
    : [
        { path: "/", element: <Home /> },
        { path: "/practice", element: <Practice /> },
        { path: "/quiz", element: <Quiz /> },
        { path: "/attempt/:attemptId", element: <Attempt /> },
    ];

    const routes = useRoutes(routeArray);

    return (
        <div className="main-view">
            <TopBar />
            {routes}
        </div>
    )
}

export default Main