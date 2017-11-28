import React, { Component } from 'react'
import { render } from 'react-dom'
import SignalingManager from './SignalingManager'
import 'brace'
import Ace from 'react-ace'
import 'brace/mode/ruby'
import 'brace/theme/monokai'

class App extends Component {
  constructor(props) {
    super(props)
    this.manager = new SignalingManager()

    this.state = {
      message: '',
      messages: [],
      signaling: false,
      editorText: ''
    }

    this.sendMessage = this.sendMessage.bind(this)
    this.handleOffer = this.handleOffer.bind(this)
    this.sendOffer = this.sendOffer.bind(this)
  }

  handleEditorOnChange(text) {
    if (this.channel) {
      this.channel.send(JSON.stringify({ type: 'edit', text }))
    }
  }

  handleOffer() {
    this.setState({ signaling: true })
    this.manager.handleOffer({
      onopen: dataChannel => {
        this.channel = dataChannel
      },
      onmessage: e => {
        const data = JSON.parse(e.data)
        if (data.type === 'edit') {
          this.setState({
            editorText: data.text
          })
        }
        if (data.type === 'chat') {
          this.setState({
            messages: this.state.messages.concat(data.message)
          })
        }
      }
    })
  }

  async sendOffer() {
    this.setState({ signaling: true })
    const dataChannel = await this.manager.sendOffer()
    dataChannel.onmessage = e => {
      const data = JSON.parse(e.data)
      if (data.type === 'edit') {
        this.setState({
          editorText: data.text
        })
      }
      if (data.type === 'chat') {
        this.setState({
          messages: this.state.messages.concat(data.message)
        })
      }
    }

    this.channel = dataChannel
  }

  sendMessage(e) {
    e.preventDefault()
    this.setState({
      messages: this.state.messages.concat(e.target.text.value)
    })
    this.channel.send(
      JSON.stringify({ type: 'chat', message: e.target.text.value })
    )
    e.target.reset()
  }

  get visible() {
    return !this.state.signaling
  }

  render() {
    return (
      <div>
        {this.state.messages.map((message, i) => <p key={i}>{message}</p>)}
        <Ace
          mode="ruby"
          theme="monokai"
          onChange={newValue => this.handleEditorOnChange(newValue)}
          editorProps={{ $blockScrolling: true }}
          value={this.state.editorText}
        />
        <form onSubmit={this.sendMessage}>
          <input type="text" name="text" id="msg" />
          <input type="submit" value="送信" />
        </form>
        <input
          type="button"
          value="ホストになる"
          onClick={this.handleOffer}
          style={{ display: this.visible ? '' : 'none' }}
        />
        <input
          type="button"
          value="オファーを送る"
          onClick={this.sendOffer}
          style={{ display: this.visible ? '' : 'none' }}
        />
      </div>
    )
  }
}

render(<App />, document.getElementById('app'))
