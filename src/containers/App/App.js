import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

import BlockWrapper from '../../components/BlockWrapper'
import Nav from '../../components/Nav'

function App() {
  return (
    <div className='a-app'>
      <Nav/>
      <div className='h-100 a-app-container'>
        <Container className='h-100' fluid={true}>
          <Row className='h-100'>
            <Col className='h-100'>
              <BlockWrapper title='Recorded' bg='light' text='dark'/>
            </Col>
            <Col className='h-100'>
              <BlockWrapper title='Selected' bg='dark' text='white'/>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default App
