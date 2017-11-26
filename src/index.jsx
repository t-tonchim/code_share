import React, { Component } from 'react'
import { render } from 'react-dom'
import SignalingManager from './SignalingManager'

class App extends Component {
  constructor(props) {
    super(props)
    this.manager = new SignalingManager()

    this.state = {
      message: '',
      messages: [],
      signaling: false
    }

    this.sendMessage = this.sendMessage.bind(this)
    this.handleMsgChange = this.handleMsgChange.bind(this)
    this.handleOffer = this.handleOffer.bind(this)
    this.sendOffer = this.sendOffer.bind(this)
  }

  handleOffer() {
    this.setState({ signaling: true })
    this.manager.handleOffer({
      onopen: dataChannel => {
        this.channel = dataChannel
      },
      onmessage: e => {
        this.setState({
          messages: this.state.messages.concat(e.data)
        })
      }
    })
  }

  async sendOffer() {
    this.setState({ signaling: true })
    const dataChannel = await this.manager.sendOffer()
    dataChannel.onmessage = e => {
      this.setState({
        messages: this.state.messages.concat(e.data)
      })
    }

    this.channel = dataChannel
  }

  handleMsgChange(e) {
    this.setState({
      message: e.target.value
    })
  }

  sendMessage(e) {
    e.preventDefault()
    this.setState({
      messages: this.state.messages.concat(this.state.message)
    })
    this.channel.send(this.state.message)
    e.target.reset()
  }

  get visible() {
    return !this.state.signaling
  }

  render() {
    return (
      <div>
        {this.state.messages.map((message, i) => <p key={i}>{message}</p>)}
        <form onSubmit={this.sendMessage}>
          <input type="text" id="msg" onChange={this.handleMsgChange} />
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
