import React, { Component } from 'react'
import Ace from 'react-ace'
import 'brace'
import 'brace/mode/ruby'
import 'brace/theme/monokai'
import PropTypes from 'prop-types'

export default class Editor extends Component {
  static get propTypes() {
    return {
      value: PropTypes.string,
      onChange: PropTypes.func.isRequired
    }
  }

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Ace
        mode="ruby"
        theme="monokai"
        onChange={newValue => this.props.onChange(newValue)}
        editorProps={{ $blockScrolling: true }}
        value={this.props.value}
        style={{ width: '800px' }}
      />
    )
  }
}
