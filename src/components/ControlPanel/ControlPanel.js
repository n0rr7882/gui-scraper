import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
    EventStorage
} from '../../utils/classes'

export class ControlPanel extends Component {
    static propTypes = {
        storage: PropTypes.objectOf(EventStorage)
    }

    render() {
        return (
            <div>
                {JSON.stringify(this.props.storage)}
            </div>
        )
    }
}

export default ControlPanel
