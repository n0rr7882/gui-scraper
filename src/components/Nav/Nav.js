import React from 'react'
import {
  Navbar
} from 'react-bootstrap';

function Nav() {
  return (
    <div>
      <Navbar bg='dark' variant='dark' fixed='top'>
        <Navbar.Brand>GUI Scraper</Navbar.Brand>
      </Navbar>
    </div>
  )
}

export default Nav
