import React, { Component } from 'react'
import { render } from 'react-dom'

class App extends Component {
  constructor(props) {
    super(props)
    const ws = new WebSocket('ws://localhost:3000')
    ws.onmessage = async e => {
      const data = JSON.parse(e.data)
      if (data.event === 'offer') {
        await this.handleOffer(data)
      }

      this.setState({
        messages: this.state.messages.concat(e.data),
        message: ''
      })
    }

    this.state = {
      ws,
      message: '',
      messages: []
    }

    this.sendMessage = this.sendMessage.bind(this)
    this.handleMsgChange = this.handleMsgChange.bind(this)
  }

  createPeerConnection() {
    return new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      iceTransportPorlicy: 'all'
    })
  }

  async handleOffer({ sdp }) {
    const pc = this.createPeerConnection()
    pc.ondatachannel = event => {
      const dc = event.channel
      dc.onopen = () => {
        window.console.log('open')
        dc.send('hello')
      }
      dc.onmessage = e => {
        window.console.log(e.data)
      }

      dc.onerror = e => {
        window.console.log(e)
      }
      dc.onclose = () => {
        window.console.log('closed')
      }
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    const answerSdp = await pc.createAnswer()
    await pc.setLocalDescription(answerSdp)
    const ws = new WebSocket('ws://localhost:3000')
    ws.onopen = () => {
      ws.onmessage = async e => {
        const data = JSON.parse(e.data)
        if (data.event === 'icecandidate' && data.to === 'id2') {
          window.console.log('icecandidate 2')
          await pc.addIceCandidate(new RTCIceCandidate(data.data))
        }
      }
      ws.send(
        JSON.stringify({
          to: 'id',
          event: 'answer',
          sdp: answerSdp
        })
      )
      pc.onicecandidate = e => {
        if (e.candidate) {
          ws.send(
            JSON.stringify({
              to: 'id1',
              event: 'icecandidate',
              data: e.candidate
            })
          )
        }
      }
    }
  }

  async sendOffer() {
    const pc = this.createPeerConnection()
    const dc = pc.createDataChannel('label', {
      orderd: true,
      maxPacketLifeTime: 1000,
      maxRetransmits: 3
    })
    const offerSdp = await pc.createOffer()
    await pc.setLocalDescription(offerSdp)
    const ws = new WebSocket('ws://localhost:3000')
    ws.onopen = () => {
      ws.send(JSON.stringify({ to: 'id', event: 'offer', sdp: offerSdp }))
      pc.onicecandidate = e => {
        if (e.candidate) {
          ws.send(
            JSON.stringify({
              to: 'id2',
              event: 'icecandidate',
              data: e.candidate
            })
          )
        }
      }
    }
    ws.onmessage = async e => {
      const data = JSON.parse(e.data)
      if (data.event === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      }
      if (data.event === 'icecandidate' && data.to === 'id1') {
        window.console.log('icecandidate')
        await pc.addIceCandidate(new RTCIceCandidate(data.data))
      }
    }
    dc.onopen = () => {
      window.console.log('open')
      dc.send('hello')
    }
    dc.onmessage = e => {
      window.console.log(e.data)
    }

    dc.onerror = e => {
      window.console.log(e)
    }
    dc.onclose = () => {
      window.console.log('closed')
    }
  }

  handleMsgChange(e) {
    this.setState({
      message: e.target.value
    })
  }

  sendMessage(e) {
    e.preventDefault()
    this.sendOffer()
    //this.state.ws.send(this.state.message)
    e.target.reset()
  }

  render() {
    return (
      <div>
        {this.state.messages.map((message, i) => <p key={i}>{message}</p>)}
        <form onSubmit={this.sendMessage}>
          <input type="text" id="msg" onChange={this.handleMsgChange} />
          <input type="submit" value="送信" />
        </form>
      </div>
    )
  }
}

render(<App />, document.getElementById('app'))
