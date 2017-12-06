import React, { Component } from 'react'
import Clipboard from 'clipboard'
import PropTypes from 'prop-types'
new Clipboard('.clip')

export default class Hostid extends Component {
  static get propTypes() {
    return {
      uuid: PropTypes.string
    }
  }

  render() {
    return (
      <div>
        <input id="uuid" type="text" defaultValue={this.props.uuid} />
        <button
          className="clip"
          type="button"
          data-clipboard-text={this.props.uuid}
        >
          copy
        </button>
      </div>
    )
  }
}
