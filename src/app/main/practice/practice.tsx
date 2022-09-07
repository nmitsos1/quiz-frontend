import React from "react";
import { Col, Row } from "reactstrap";
import Groups from "./questionGroups/Groups";

function Practice() {


  return (
    <div className="practice-page">
      <h3>Practice</h3>
      <Row>
        <Col>
        </Col>
        <Col>
          <Groups />
        </Col>
      </Row>
    </div>
  )
}

export default Practice