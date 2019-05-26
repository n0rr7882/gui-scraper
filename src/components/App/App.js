import React, { Component } from 'react'
import { Container } from 'react-bootstrap'

import InfoTabs from '../InfoTabs'
import {
    MessageContext
} from "../../classes";
import sendToBackground from '../../utils/send-to-background'

export class App extends Component {

    state = {
        storages: []
    }

    render() {
        return (
            <div className='a-app'>
                <div className='a-app-container'>
                    <Container fluid={true}>
                        <InfoTabs storages={this.state.storages} />
                    </Container>
                </div>
            </div>
        )
    }

    componentDidMount() {
        setInterval(() => {
            const allStorageMsgCtx = new MessageContext('storage', { action: 'all' })
            sendToBackground(allStorageMsgCtx).then(resMsgCtx => {
                this.setState({
                    ...this.state,
                    storages: resMsgCtx.context.storages
                })
            }).catch(errMsgCtx => {
                console.error('Error received from background.js:', errMsgCtx)
            })
        }, 250)
    }
}

export default App
