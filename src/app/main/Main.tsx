import React from "react";
import Announcements from "./announcements/Announcements";
import TopBar from "./TopBar";

function Main() {
    return (
        <div className="main-page">
            <TopBar />
            <Announcements />
        </div>
    )
}

export default Main