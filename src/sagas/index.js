import { takeEvery, eventChannel } from 'redux-saga'
import { take, fork, select, call, put, all } from 'redux-saga/effects'
import actions from 'actions'
import firebase from 'firebase'
import config from 'config'

const app = firebase.initializeApp(config)
const db = app.database()

const dataChannelOption = {
  order: true,
  maxPacketLifeTime: 1000,
  maxRetransmits: 3
}

function subscribeSignaling({ clientId, hostId }) {
  const ref = db.ref(`sessions/${hostId}`)

  return eventChannel(emit => {
    ref.on('child_added', data => {
      const { from, type } = data.val()
      if (from === clientId || !type) {
        emit({ type: 'NOTHING' })
      } else {
        emit(actions[type]({ ...data.val() }))
      }
    })
    return () => {}
  })
}

function subscribeCandidate(peer) {
  return eventChannel(emit => {
    peer.onicecandidate = e => {
      if (e.candidate) {
        emit(actions.setHostCandidate({ candidate: e.candidate }))
      }
    }
    return () => {}
  })
}

function subscribeDataChannel(peer) {
  return eventChannel(emit => {
    peer.ondatachannel = e => {
      emit(actions.setDataChannel({ dataChannel: e.channel }))
    }
    return () => {}
  })
}

function subscribeMessage(dataChannel) {
  return eventChannel(emit => {
    dataChannel.onmessage = e => {
      const data = JSON.parse(e.data)
      emit(actions[data.type](data))
    }
    return () => {}
  })
}

function* handleSendOffer(action) {
  const { to } = action.payload
  yield put(actions.setHostId({ to, host: false }))
  const { peer, clientId } = yield select()
  try {
    const dataChannel = yield call(() =>
      peer.createDataChannel('label', dataChannelOption)
    )
    yield put(actions.setDataChannel({ dataChannel }))
    const sdp = yield call(() => peer.createOffer())
    yield call(() => peer.setLocalDescription(sdp))
    yield call(() =>
      db.ref(`sessions/${to}`).push({
        from: clientId,
        ...sdp.toJSON()
      })
    )
  } catch (e) {
    console.error(e)
  }
}

function* handleOffer(action) {
  const { peer, clientId } = yield select()
  const { sdp, type } = action.payload
  try {
    yield call(() =>
      peer.setRemoteDescription(new RTCSessionDescription({ sdp, type }))
    )
    const answerSdp = yield call(() => peer.createAnswer())
    yield call(() => peer.setLocalDescription(answerSdp))
    yield call(() =>
      db
        .ref(`sessions/${clientId}`)
        .push({ from: clientId, ...answerSdp.toJSON() })
    )
  } catch (e) {
    console.error(e)
  }
}

function* handleAnswer(action) {
  const { peer } = yield select()
  const { sdp, type } = action.payload
  yield call(() =>
    peer.setRemoteDescription(new RTCSessionDescription({ sdp, type }))
  )
}

function* watchMessage() {
  yield take(actions.setDataChannel)
  const { dataChannel } = yield select()
  yield fork(commonWatcher, subscribeMessage, dataChannel)
}

function* watchEvents() {
  yield take(actions.setHostId)
  const { clientId, hostId, peer } = yield select()
  yield all([
    yield fork(commonWatcher, subscribeSignaling, { clientId, hostId }),
    yield fork(commonWatcher, subscribeCandidate, peer),
    yield fork(commonWatcher, subscribeDataChannel, peer)
  ])
}

function* commonWatcher(subscribe, ...args) {
  const channel = yield call(subscribe, ...args)
  yield takeEvery(channel, function*(action) {
    yield put(action)
  })
}

function* setHostCandidate(action) {
  const { peer, clientId } = yield select()
  const { candidate } = action.payload
  const ref = db.ref(`sessions/${clientId}`)
  const candidateObj = new RTCIceCandidate(candidate)
  if (peer.remoteDescription.type) {
    try {
      yield call(() => peer.addIceCandidate(candidateObj))
      yield call(() =>
        ref.push({
          type: 'setGuestCandidate',
          from: clientId,
          candidate: JSON.stringify(candidate)
        })
      )
    } catch (e) {
      console.error(e)
    }
  }
}

function* setGuestCandidate(action) {
  const { peer } = yield select()
  const { candidate } = action.payload
  yield call(() =>
    peer.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)))
  )
}

function* initHost() {
  const { clientId } = yield select()
  yield put(actions.setHostId({ to: clientId, host: true }))
  const ref = db.ref(`sessions/${clientId}`)
  yield call(() => ref.push({ from: clientId, type: 'nothing' }))
}

export default function* rootSaga() {
  yield fork(watchEvents)
  yield fork(watchMessage)
  yield takeEvery(actions.initHost, initHost)
  yield takeEvery(actions.offer, handleOffer)
  yield takeEvery(actions.sendOffer, handleSendOffer)
  yield takeEvery(actions.answer, handleAnswer)
  yield takeEvery(actions.setHostCandidate, setHostCandidate)
  yield takeEvery(actions.setGuestCandidate, setGuestCandidate)
}
