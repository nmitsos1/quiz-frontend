import React from "react";
import { Col, Row } from "reactstrap";
import Announcements from "./announcements/Announcements";

function Home() {


    return (
        <div className="home-page">
            <Row>
                <Col>
                    <Announcements />
                </Col>
                <Col></Col>
            </Row>
        </div>
    )
}

export default Home