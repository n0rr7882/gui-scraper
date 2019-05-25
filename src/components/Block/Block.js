/*global chrome*/
import React from 'react'
import PropTypes from 'prop-types'
import {
  Breadcrumb,
  Card,
} from 'react-bootstrap'

import Action from '../../models/Action'
import {
  actionTypeToTypeSetting,
  selectorToLastElement,
} from '../../utils'

function renderCardText(action, setting) {
  const { context } = action
  const { primaryCtx } = setting
  switch (primaryCtx) {
    
    case 'selector': return `> ${selectorToLastElement(context[primaryCtx])}`
    case 'seconds': return `Wait for ${context[primaryCtx]} seconds`
    default: return 'action'
  }
}

function Block({ action }) {

  const setting = actionTypeToTypeSetting(action.type)

  return (
    <div className='a-block'>
      <Card body bg={setting.color} text={setting.text} onClick={e => {
        chrome.extension.sendMessage({msgtype:'recctrl', context: false}, response => {
          console.log(response)
        })
      }}>
        <Card.Title>{setting.verboseName}</Card.Title>
        <input className="form-control" value={renderCardText(action, setting)} disabled/>
      </Card>
    </div>
  )
}

Block.propTypes = {
  action: PropTypes.objectOf(Action),
}

Block.defaultProps = {
  action: new Action({}),
}

export default Block
