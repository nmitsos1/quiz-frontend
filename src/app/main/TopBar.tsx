import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';


function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

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
            <NavLink tag={Link} to="/settings">Settings</NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
}

export default TopBar;
