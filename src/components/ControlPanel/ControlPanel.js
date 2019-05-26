import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
    Card,
    Button,
    ButtonGroup,
    ButtonToolbar,
    ListGroup,
    ToggleButton,
    ToggleButtonGroup,
    Modal,
} from 'react-bootstrap'

import {
    selectorToLastElement,
} from '../../utils'
import {
    EventInfo,
    EventStorage,
    MessageContext,
} from '../../utils/classes'
import {
    convertStorage
} from '../../utils/event-formatter'
import {
    sendToBackground,
    errorLogger,
} from '../../utils/send-to-background'

export class ControlPanel extends Component {

    static propTypes = {
        storage: PropTypes.objectOf(EventStorage)
    }

    state = {
        JSONResult: null
    }

    componentDidMount() {
        this.handleRecording = this.handleRecording.bind(this)
        this.handleRmStorage = this.handleRmStorage.bind(this)
        this.handleRun = this.handleRun.bind(this)
        this.handleExport = this.handleExport.bind(this)

        this.renderRecSwitch = this.renderRecSwitch.bind(this)
        this.renderCtrlButton = this.renderCtrlButton.bind(this)
        this.renderEventList = this.renderEventList.bind(this)
        this.renderEventImte = this.renderEventItem.bind(this)
        this.renderResultModal = this.renderResultModal.bind(this)

        this.setJSONResult = this.setJSONResult.bind(this)
    }

    handleRecording(value, _) {
        const tabId = this.props.storage.tabId
        const msgCtx = new MessageContext('recctrl', {
            tabId,
            recording: value
        })
        sendToBackground(msgCtx).catch(errorLogger)
    }

    handleRmStorage(_) {
        const tabId = this.props.storage.tabId
        const msgCtx = new MessageContext('storage', {
            action: 'remove',
            tabId
        })
        sendToBackground(msgCtx).catch(errorLogger)
    }

    setJSONResult(result=null) {
        if (result) {
            this.setState({
                ...this.state,
                JSONResult: JSON.stringify(result, null, 4)
            })
        } else {
            this.setState({
                ...this.state,
                JSONResult: null
            })
        }
    }

    handleRun(_) {
        // TODO
    }

    handleExport(_) {
        const converted = convertStorage(this.props.storage)
        this.setJSONResult(converted)
    }

    renderResultModal() {
        return (
            <Modal show={this.state.JSONResult} onHide={this.setJSONResult}>
                <Modal.Header closeButton>
                    <Modal.Title>Results</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <pre>
                        <code>{this.state.JSONResult}</code>
                    </pre>
                </Modal.Body>
            </Modal>
        )
    }

    renderRecSwitch() {
        const recording = this.props.storage.recording
        return (
            <ButtonToolbar className='d-flex flex-column'>
                <ToggleButtonGroup
                    type="radio"
                    name="options"
                    defaultValue={recording}
                    onChange={this.handleRecording}>
                    <ToggleButton
                        variant={recording ? 'primary' : 'outline-primary'}
                        value={true}
                    >REC</ToggleButton>
                    <ToggleButton
                        variant={recording ? 'outline-secondary' : 'secondary'}
                        value={false}
                    >OFF</ToggleButton>
                </ToggleButtonGroup>
            </ButtonToolbar>
        )
    }

    renderCtrlButton() {
        const recording = this.props.storage.recording
        return (
            <ButtonToolbar className='d-flex flex-column'>
                <ButtonGroup>
                    <Button
                        variant='success'
                        onClick={this.handleRun}
                    >RUN</Button>
                    <Button
                        variant='outline-success'
                        onClick={this.handleExport}
                    >Export JSON</Button>
                    <Button
                        variant='danger'
                        disabled={recording}
                        onClick={this.handleRmStorage}
                    >Remove records</Button>
                </ButtonGroup>
            </ButtonToolbar>
        )
    }

    renderEventList() {
        const events = this.props.storage.events
        return (
            <ListGroup>
                <ListGroup.Item variant='primary'>
                    <b>Entry: </b>
                    <code>{this.props.storage.entryURL || 'No records'}</code>
                </ListGroup.Item>
                {events.map(this.renderEventItem)}
            </ListGroup>
        )
    }

    /**
     * 
     * @param {EventInfo} event 
     */
    renderEventItem(event) {
        let variant = null
        let type = null
        switch (event.type) {
            case 'click':
                variant = null
                type = 'Click'
                break
            case 'contextmenu':
                variant = 'success'
                type = 'Read'
                break
            default:
                variant = 'light'
                type = 'Undefined'
        }
        return (
            <ListGroup.Item variant={variant}>
                <b>{type}: </b>
                <code>{selectorToLastElement(event.target.selector)}</code>
            </ListGroup.Item>
        )
    }

    render() {
        const tabId = this.props.storage.tabId
        return (
            <>
                <Card style={{ width: '100%' }}>
                    <Card.Header as="h5">Tab No.{tabId}</Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item>{this.renderRecSwitch()}</ListGroup.Item>
                        <ListGroup.Item>{this.renderCtrlButton()}</ListGroup.Item>
                        <ListGroup.Item>
                            {this.renderEventList()}
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
                {this.renderResultModal()}
            </>
        )
    }

}

export default ControlPanel
