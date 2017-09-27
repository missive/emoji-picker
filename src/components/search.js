import React from 'react'
import PropTypes from 'prop-types'
import emojiIndex from '../utils/emoji-index'

export default class Search extends React.Component {
  handleChange() {
    var { input } = this.refs,
        value = input.value

    this.props.onSearch(emojiIndex.search(value, {
      emojisToShowFilter: this.props.emojisToShowFilter,
      maxResults: this.props.maxResults,
      include: this.props.include,
      exclude: this.props.exclude,
      custom: this.props.custom,
    }))
  }

  clear() {
    this.refs.input.value = ''
  }

  componentDidMount() {
    // setTimeout queues task to happen after React finishes whatever render loop it's in
    // this prevents Search Results AND regular categories from coinciding
    // more info on this trick:
    //   * http://stackoverflow.com/q/2723610/249801
    //   * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Late_timeouts
    //   * https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
    if (this.props.defaultValue) setTimeout(this.handleChange.bind(this))
  }

  render() {
    var { i18n, autoFocus, defaultValue } = this.props

    return <div className='emoji-mart-search'>
      <input
        ref='input'
        type='text'
        onChange={this.handleChange.bind(this)}
        placeholder={i18n.search}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
      />
    </div>
  }
}

Search.propTypes = {
  onSearch: PropTypes.func,
  maxResults: PropTypes.number,
  emojisToShowFilter: PropTypes.func,
  autoFocus: PropTypes.bool,
  defaultValue: PropTypes.string,
}

Search.defaultProps = {
  onSearch: (() => {}),
  maxResults: 75,
  emojisToShowFilter: null,
  autoFocus: false,
}
