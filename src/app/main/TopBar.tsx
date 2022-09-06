import React, { useState } from 'react';
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';


function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color='dark' dark expand="md" container="fluid">
      <NavbarBrand>
        Quiz App
      </NavbarBrand>
      <NavbarToggler onClick={toggle}/>
      <Collapse isOpen={isOpen} navbar>
        <Nav className="me-auto" navbar>
          <NavItem>
            <NavLink>Practice</NavLink>
          </NavItem>
          <NavItem>
            <NavLink>Settings</NavLink>
          </NavItem>
          <NavItem>
            <NavLink>Events</NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
}

export default TopBar;
