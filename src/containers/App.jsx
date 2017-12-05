import React, { Component } from 'react'
import Editor from '../components/Editor'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../actions'
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
      sendOffer: PropTypes.func
    }
  }

  handleEditorOnChange(text) {
    this.props.edit({ text })
    if (this.props.dataChannel) {
      this.props.dataChannel.send(JSON.stringify({ type: 'edit', text }))
    }
  }

  get clientID() {
    if (!this.props.host) return
    return <p>あなたのIDは {this.props.clientId} です</p>
  }

  get buttonDisplay() {
    return {
      display: this.props.signaling ? 'none' : ''
    }
  }

  sendOffer(e) {
    e.preventDefault()
    this.props.sendOffer({ to: e.target.to.value })
  }

  render() {
    return (
      <div>
        <Editor
          onChange={::this.handleEditorOnChange}
          value={this.props.editorText}
        />
        <form onSubmit={::this.sendOffer} style={this.buttonDisplay}>
          <input type="text" name="to" id="msg" />
          <input type="submit" value="オファーを送る" />
        </form>
        {this.clientID}
        <input
          type="button"
          value="ホストになる"
          onClick={this.props.initHost}
          style={this.buttonDisplay}
        />
      </div>
    )
  }
}

export default connect(
  state => ({ ...state }),
  dispatch => bindActionCreators(actions, dispatch)
)(App)
