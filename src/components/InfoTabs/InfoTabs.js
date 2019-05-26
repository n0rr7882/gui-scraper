/*global chrome*/
import React from 'react'
import PropTypes from 'prop-types'
import {
    Tab,
    Tabs
} from 'react-bootstrap'

import ControlPanel from '../ControlPanel'
import { EventStorage } from "../../classes/EventStorage";

const InfoTabs = props => {
    return (
        <Tabs>
            {props.storages.map(storage => (
                <Tab eventKey={storage.tabId} title={storage.tabId}>
                    <ControlPanel storage={storage} />
                </Tab>
            ))}
        </Tabs>
    )
}

InfoTabs.propTypes = {
    storages: PropTypes.arrayOf(EventStorage)
}

InfoTabs.defaultProps = {
    storages: []
}

export default InfoTabs
