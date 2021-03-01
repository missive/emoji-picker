import React from 'react'
import PropTypes from 'prop-types'

import { search as icons } from '../svgs'
import NimbleEmojiIndex from '../utils/emoji-index/nimble-emoji-index'
import { throttleIdleTask } from '../utils/index'

let id = 0

export default class Search extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      icon: icons.search,
      isSearching: false,
      id: ++id,
    }

    this.data = props.data
    this.emojiIndex = new NimbleEmojiIndex(this.data)
    this.setRef = this.setRef.bind(this)
    this.clear = this.clear.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.focus = this.focus.bind(this)

    // throttle keyboard input so that typing isn't delayed
    this.handleChange = throttleIdleTask(this.handleChange.bind(this))
  }

  componentDidMount() {
    // in some cases (e.g. preact) the input may already be pre-populated
    // this.input is undefined in Jest tests
    if (this.input && this.input.value) {
      this.search(this.input.value)
    }
  }

  search(value) {
    if (value == '')
      this.setState({
        icon: icons.search,
        isSearching: false,
      })
    else
      this.setState({
        icon: icons.delete,
        isSearching: true,
      })

    this.props.onSearch(
      this.emojiIndex.search(value, {
        emojisToShowFilter: this.props.emojisToShowFilter,
        maxResults: this.props.maxResults,
        include: this.props.include,
        exclude: this.props.exclude,
        custom: this.props.custom,
      }),
    )
  }

  clear() {
    if (this.input.value == '') return
    this.input.value = ''
    this.input.focus()
    this.search('')
  }

  focus() {
    const { autoFocus } = this.props
    if (autoFocus) this.input.focus()
  }

  handleChange() {
    if (this.input) {
      this.search(this.input.value)
    }
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      this.clear()
    }
  }

  setRef(c) {
    this.input = c
  }

  render() {
    const { i18n, autoFocus } = this.props
    const { icon, isSearching, id } = this.state
    const inputId = `emoji-mart-search-${id}`

    return (
      <section className="emoji-mart-search" aria-label={i18n.search}>
        <input
          id={inputId}
          ref={this.setRef}
          type="search"
          onChange={this.handleChange}
          placeholder={i18n.search}
          autoFocus={autoFocus}
        />
        {/*
         * Use a <label> in addition to the placeholder for accessibility, but place it off-screen
         * http://www.maxability.co.in/2016/01/placeholder-attribute-and-why-it-is-not-accessible/
         */}
        <label className="emoji-mart-sr-only" htmlFor={inputId}>
          {i18n.search}
        </label>
        <button
          className="emoji-mart-search-icon"
          onClick={this.clear}
          onKeyUp={this.handleKeyUp}
          aria-label={i18n.clear}
          disabled={!isSearching}
        >
          {icon()}
        </button>
      </section>
    )
  }
}

Search.propTypes /* remove-proptypes */ = {
  onSearch: PropTypes.func,
  maxResults: PropTypes.number,
  emojisToShowFilter: PropTypes.func,
  autoFocus: PropTypes.bool,
}

Search.defaultProps = {
  onSearch: () => {},
  maxResults: 75,
  emojisToShowFilter: null,
  autoFocus: false,
}
