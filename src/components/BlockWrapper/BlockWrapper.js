import React from 'react'
import {
  Card,
} from 'react-bootstrap'

import Block from '../../components/Block'
import Action from '../../models/Action';

function BlockWrapper({ title, bg, text }) {
  return (
    <div className='h-100 a-block-wrapper'>
      <Card className='h-100' bg={bg} text={text}>
        <Card.Header>{title}</Card.Header>
        <Card.Body className='a-card-wrapper'>
          <Block action={new Action({ type: 'left_click', context: { selector: 'body > div.navPusher > div > div.container.mainContainer' } })}/>
          <Block action={new Action({ type: 'double_click', context: { selector: 'body > div.navPusher > div > div.container.mainContainer' } })}/>
          <Block action={new Action({ type: 'sleep', context: { seconds: 5 } })}/>
          <Block action={new Action({ type: 'read', context: { selector: 'body > div.navPusher > div > div.container.mainContainer' } })}/>
          <Block action={new Action({ type: 'left_click', context: { selector: 'body > div.navPusher > div > div.container.mainContainer' } })}/>
        </Card.Body>
      </Card>
    </div>
  )
}

export default BlockWrapper
