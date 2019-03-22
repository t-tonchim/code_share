import React, { Component } from 'react'
import Editor from '../components/Editor'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../actions'
import PropTypes from 'prop-types'

class App extends Component {
  static get propTypes() {
    return {
      host: PropTypes.bool.isRequired,
      initHost: PropTypes.func.isRequired,
      edit: PropTypes.func.isRequired,
      editorText: PropTypes.string,
      clientId: PropTypes.string,
      dataChannel: PropTypes.shape({
        send: PropTypes.func
      }),
      sendOffer: PropTypes.func,
      changeMode: PropTypes.func.isRequired,
      mode: PropTypes.string.isRequired
    }
  }

  componentDidMount() {
    const params = new URLSearchParams(location.search)
    const uuid = params.get('uuid')
    if (uuid) {
      this.props.sendOffer({ to: uuid })
    } else {
      this.props.initHost()
      history.replaceState('', '', `?uuid=${this.props.clientId}`)
    }
  }

  handleEditorOnChange(text) {
    this.props.edit({ text })
    this.sendData({ type: 'edit', text })
  }

  sendData(value) {
    if (this.props.dataChannel) {
      this.props.dataChannel.send(JSON.stringify(value))
    }
  }

  onChangeMode(e) {
    const mode = e.target.value
    this.props.changeMode({ mode })
    this.sendData({ type: 'changeMode', mode })
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
      </div>
    )
  }
}

export default connect(
  state => ({ ...state }),
  dispatch => bindActionCreators(actions, dispatch)
)(App)
