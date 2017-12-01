import { handleActions } from 'redux-actions'
import actions from '../actions'
import SignalingManager from '../SignalingManager'

export const initialState = {
  messages: [],
  signaling: false,
  editorText: '',
  manager: new SignalingManager()
}

export default handleActions(
  {
    [actions.offer]: state => ({
      ...state,
      signaling: true
    }),
    [actions.answer]: state => ({
      ...state,
      signaling: true
    }),
    [actions.edit]: (state, action) => ({
      ...state,
      editorText: action.payload.text
    }),
    [actions.chat]: (state, action) => ({
      ...state,
      messages: state.messages.concat(action.payload.message)
    })
  },
  initialState
)
