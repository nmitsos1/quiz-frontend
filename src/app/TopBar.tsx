import React, { useState } from 'react';
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem } from 'reactstrap';


function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color='dark' dark expand="md">
      <NavbarBrand>
        Quiz App
      </NavbarBrand>
      <NavbarToggler onClick={toggle}/>
      <Collapse isOpen={isOpen} navbar>
        <Nav navbar>
          <NavItem>
            Practice
          </NavItem>
          <NavItem>
            Settings
          </NavItem>
          <NavItem>
            Events
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
}

export default TopBar;
