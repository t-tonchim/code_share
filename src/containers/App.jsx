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
      answer: PropTypes.func.isRequired,
      offer: PropTypes.func.isRequired,
      chat: PropTypes.func.isRequired,
      edit: PropTypes.func.isRequired,
      editorText: PropTypes.string,
      messages: PropTypes.arrayOf(PropTypes.string),
      manager: PropTypes.shape({
        handleOffer: PropTypes.func.isRequired,
        sendOffer: PropTypes.func.isRequired
      })
    }
  }

  constructor(props) {
    super(props)

    this.sendMessage = this.sendMessage.bind(this)
    this.handleOffer = this.handleOffer.bind(this)
    this.sendOffer = this.sendOffer.bind(this)
    this.handleEditorOnChange = this.handleEditorOnChange.bind(this)
  }

  handleEditorOnChange(text) {
    this.props.edit({ text })
    if (this.channel) {
      this.channel.send(JSON.stringify({ type: 'edit', text }))
    }
  }

  handleOffer() {
    this.props.answer({ signaling: true })
    this.props.manager.handleOffer({
      onopen: dataChannel => {
        this.channel = dataChannel
      },
      onmessage: e => {
        const data = JSON.parse(e.data)
        this.props[data.type](data)
      }
    })
  }

  async sendOffer() {
    this.props.offer({ signaling: true })
    const dataChannel = await this.props.manager.sendOffer()
    dataChannel.onmessage = e => {
      const data = JSON.parse(e.data)
      this.props[data.type](data)
    }

    this.channel = dataChannel
  }

  sendMessage(e) {
    e.preventDefault()
    this.props.chat({ message: e.target.text.value })
    this.channel.send(
      JSON.stringify({ type: 'chat', message: e.target.text.value })
    )
    e.target.reset()
  }

  render() {
    return (
      <div>
        {this.props.messages.map((message, i) => <p key={i}>{message}</p>)}
        <Editor
          onChange={this.handleEditorOnChange}
          value={this.props.editorText}
        />
        <form
          onSubmit={this.sendMessage}
          style={{ display: this.props.signaling ? '' : 'none' }}
        >
          <input type="text" name="text" id="msg" />
          <input type="submit" value="送信" />
        </form>
        <input
          type="button"
          value="ホストになる"
          onClick={this.handleOffer}
          style={{ display: this.props.signaling ? 'none' : '' }}
        />
        <input
          type="button"
          value="オファーを送る"
          onClick={this.sendOffer}
          style={{ display: this.props.signaling ? 'none' : '' }}
        />
      </div>
    )
  }
}

export default connect(
  state => ({ ...state }),
  dispatch => bindActionCreators(actions, dispatch)
)(App)
