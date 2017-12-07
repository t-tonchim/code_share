import React, { Component } from 'react'
import Editor from 'components/Editor'
import Hostid from 'components/Hostid'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import PropTypes from 'prop-types'

class App extends Component {
  static get propTypes() {
    return {
      signaling: PropTypes.bool.isRequired,
      host: PropTypes.bool.isRequired,
      initHost: PropTypes.func.isRequired,
      edit: PropTypes.func.isRequired,
      editorText: PropTypes.string,
      clientId: PropTypes.string,
      dataChannel: PropTypes.shape({
        send: PropTypes.func
      }),
      sendOffer: PropTypes.func,
      channelOpen: PropTypes.bool.isRequired,
      changeMode: PropTypes.func.isRequired,
      mode: PropTypes.string.isRequired
    }
  }

  handleEditorOnChange(text) {
    this.props.edit({ text })
    if (this.props.dataChannel) {
      this.props.dataChannel.send(JSON.stringify({ type: 'edit', text }))
    }
  }

  get hostID() {
    if (!this.props.host) return
    return <Hostid uuid={this.props.clientId} />
  }

  get buttonDisplay() {
    return {
      display: this.props.signaling ? 'none' : ''
    }
  }

  get channelOpened() {
    return this.props.channelOpen ? <p>connection established👍</p> : ''
  }

  sendOffer(e) {
    e.preventDefault()
    this.props.sendOffer({ to: e.target.to.value })
  }

  onChangeMode(e) {
    this.props.changeMode({ mode: e.target.value })
  }

  render() {
    return (
      <div>
        <Editor
          onChange={::this.handleEditorOnChange}
          onChangeMode={::this.onChangeMode}
          value={this.props.editorText}
          mode={this.props.mode}
        />
        <form onSubmit={::this.sendOffer} style={this.buttonDisplay}>
          <input type="text" name="to" id="msg" />
          <input type="submit" value="send offer to host" />
        </form>
        {this.hostID}
        <input
          type="button"
          value="to be host"
          onClick={this.props.initHost}
          style={this.buttonDisplay}
        />
        {this.channelOpened}
      </div>
    )
  }
}

export default connect(
  state => ({ ...state }),
  dispatch => bindActionCreators(actions, dispatch)
)(App)
