import React, { Component } from 'react'
import Ace from 'react-ace'
import 'brace'
import 'brace/mode/ruby'
import 'brace/mode/javascript'
import 'brace/mode/jsx'
import 'brace/mode/php'
import 'brace/mode/java'
import 'brace/mode/sql'
import 'brace/mode/python'
import 'brace/mode/css'
import 'brace/mode/markdown'
import 'brace/mode/typescript'
import 'brace/mode/tsx'
import 'brace/mode/html'
import 'brace/mode/sh'
import 'brace/theme/monokai'
import 'brace/keybinding/emacs'
import 'brace/keybinding/vim'
import 'brace/ext/language_tools'
import PropTypes from 'prop-types'

const modes = [
  'ruby',
  'javascript',
  'jsx',
  'php',
  'java',
  'sql',
  'python',
  'css',
  'markdown',
  'typescript',
  'tsx',
  'html',
  'sh'
]

const keybinds = [null, 'vim', 'emacs']

export default class Editor extends Component {
  static get propTypes() {
    return {
      value: PropTypes.string,
      onChange: PropTypes.func.isRequired,
      onChangeMode: PropTypes.func.isRequired,
      mode: PropTypes.string.isRequired,
      keybind: PropTypes.string,
      onChangeKeybind: PropTypes.func.isRequired
    }
  }

  render() {
    return (
      <div>
        <span>syntax </span>
        <select onChange={this.props.onChangeMode}>
          {modes.map((mode, i) => (
            <option key={i} value={mode}>
              {mode}
            </option>
          ))}
        </select>
        <span>keybind </span>
        <select onChange={this.props.onChangeKeybind}>
          {keybinds.map((kb, i) => (
            <option key={i} value={kb}>
              {kb}
            </option>
          ))}
        </select>
        <Ace
          mode={this.props.mode}
          theme="monokai"
          onChange={newValue => this.props.onChange(newValue)}
          editorProps={{ $blockScrolling: true }}
          value={this.props.value}
          style={{ width: '800px' }}
          keyboardHandler={this.props.keybind}
          enableLiveAutocompletion={true}
        />
      </div>
    )
  }
}
