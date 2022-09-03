import React from "react";
import { BrowserRouter as Router, Route, Routes, useRoutes } from 'react-router-dom';
import Announcements from "./announcements/Announcements";

function Home() {


    return (
        <div className="home-page">
            <Announcements />
        </div>
    )
}

export default Home