import 'webrtc-adapter'

export default class SignalingManager {
  constructor(
    wsUrl = 'ws://localhost:3000',
    iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]
  ) {
    this.wsUrl = wsUrl
    this.iceServers = iceServers
  }

  handleOffer(cb) {
    const pc = this.createPeerConnection()
    const ws = new WebSocket(this.wsUrl)
    ws.onmessage = async e => {
      const data = JSON.parse(e.data)
      if (data.event === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answerSdp = await pc.createAnswer()
        await pc.setLocalDescription(answerSdp)
        ws.send(
          JSON.stringify({
            event: 'answer',
            sdp: answerSdp
          })
        )
      }
    }

    pc.onicecandidate = async e => {
      if (e.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(e.candidate))
        ws.send(
          JSON.stringify({
            event: 'icecandidate',
            candidate: e.candidate
          })
        )
      }
    }

    pc.ondatachannel = event => {
      const dc = event.channel
      dc.onopen = () => cb.onopen(dc)
      dc.onmessage = cb.onmessage
    }
  }

  async sendOffer() {
    const pc = this.createPeerConnection()
    const dc = await pc.createDataChannel('label', {
      orderd: true,
      maxPacketLifeTime: 1000,
      maxRetransmits: 3
    })

    const offerSdp = await pc.createOffer()
    await pc.setLocalDescription(offerSdp)
    const ws = new WebSocket(this.wsUrl)
    ws.onopen = () => {
      ws.send(JSON.stringify({ event: 'offer', sdp: offerSdp }))
    }
    ws.onmessage = async e => {
      const data = JSON.parse(e.data)
      if (data.event === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      }
      if (data.event === 'icecandidate') {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
    }

    return dc
  }

  createPeerConnection() {
    return new RTCPeerConnection({
      iceServers: this.iceServers,
      iceTransportPorlicy: 'all'
    })
  }
}
