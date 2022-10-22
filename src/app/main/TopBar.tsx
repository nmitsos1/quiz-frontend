import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge, Collapse, Nav, Navbar, NavbarBrand, NavbarText, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { isLastAttemptInProgress } from './quiz/attempt/AttemptModel';
import { getMySchool, ROLE } from './schools/SchoolModel';
import firebase from 'firebase/compat/app';

function TopBar() {

  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const {data: school} = useQuery(['my-school'], getMySchool);
  const {data: isAttemptInProgress} = useQuery(['attempt-in-progress'], isLastAttemptInProgress);

  return (
    <Navbar color='dark' dark expand="md" container="fluid">
      <NavbarBrand tag={Link} to="/">
        Quiz App
      </NavbarBrand>
      <NavbarToggler onClick={toggle}/>
      <Collapse isOpen={isOpen} navbar>
        <Nav className="me-auto" navbar>
          <NavItem>
            <NavLink tag={Link} to="/practice">Practice</NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/events">Events</NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/attempts">History</NavLink>
          </NavItem>
          {school?.role === ROLE.ADMIN ?
          <React.Fragment >
            <NavItem>
              <NavLink tag={Link} to="/schools">Schools</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/questions">Questions</NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/groups">Groups</NavLink>
            </NavItem>
          </React.Fragment>
          : <React.Fragment />
          }
          {(isAttemptInProgress && !location.pathname.includes('quiz')) ?
          <NavItem>
            <NavLink tag={Link} to="/quiz"><Badge color='primary'>Attempt in Progress - Click Here</Badge></NavLink>
          </NavItem>
        : <React.Fragment />}
        </Nav>
        <NavbarText tag={Link} to="/" onClick={() => {firebase.auth().signOut(); window.location.reload(); }}>Sign Out</NavbarText>
      </Collapse>
    </Navbar>
  );
}

export default TopBar;
