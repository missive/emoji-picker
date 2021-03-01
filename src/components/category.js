import React from 'react'
import PropTypes from 'prop-types'

import frequently from '../utils/frequently'
import { getData } from '../utils'
import NimbleEmoji from './emoji/nimble-emoji'
import NotFound from './not-found'

export default class Category extends React.Component {
  constructor(props) {
    super(props)

    this.sizeMemorizePending = false
    this.data = props.data
    this.setContainerRef = this.setContainerRef.bind(this)
    this.setLabelRef = this.setLabelRef.bind(this)
  }

  componentDidMount() {
    this.margin = 0
    this.minMargin = 0

    this.memoizeSize(false)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var {
        name,
        perLine,
        native,
        hasStickyPosition,
        emojis,
        emojiProps,
      } = this.props,
      { skin, size, set } = emojiProps,
      {
        perLine: nextPerLine,
        native: nextNative,
        hasStickyPosition: nextHasStickyPosition,
        emojis: nextEmojis,
        emojiProps: nextEmojiProps,
      } = nextProps,
      { skin: nextSkin, size: nextSize, set: nextSet } = nextEmojiProps,
      shouldUpdate = false

    if (name == 'Recent' && perLine != nextPerLine) {
      shouldUpdate = true
    }

    if (name == 'Search') {
      shouldUpdate = !(emojis == nextEmojis)
    }

    if (
      skin != nextSkin ||
      size != nextSize ||
      native != nextNative ||
      set != nextSet ||
      hasStickyPosition != nextHasStickyPosition
    ) {
      shouldUpdate = true
    }

    return shouldUpdate
  }

  memoizeSize(inAnimationFrame) {
    if (!inAnimationFrame) {
      if (this.sizeMemorizePending) {
        return
      }

      this.sizeMemorizePending = true
      requestAnimationFrame(() => this.memoizeSize(true))
      return
    }
    this.sizeMemorizePending = false

    this.sizeMemorizePending = true
    if (!this.container) {
      // probably this is a test environment, e.g. jest
      this.top = 0
      this.maxMargin = 0
      return
    }
    var parent = this.container.parentElement
    var { top, height } = this.container.getBoundingClientRect()
    var { top: parentTop } = parent.getBoundingClientRect()
    var { height: labelHeight } = this.label.getBoundingClientRect()

    this.top = top - parentTop + parent.scrollTop

    if (height == 0) {
      this.maxMargin = 0
    } else {
      this.maxMargin = height - labelHeight
    }
  }

  handleScroll(scrollTop) {
    var margin = scrollTop - this.top
    margin = margin < this.minMargin ? this.minMargin : margin
    margin = margin > this.maxMargin ? this.maxMargin : margin

    if (margin == this.margin) return

    if (!this.props.hasStickyPosition) {
      this.label.style.top = `${margin}px`
    }

    this.margin = margin
    return true
  }

  getEmojis() {
    var { name, emojis, recent, perLine } = this.props

    if (name == 'Recent') {
      let { custom } = this.props
      let frequentlyUsed = recent || frequently.get(perLine)

      if (frequentlyUsed.length) {
        emojis = frequentlyUsed
          .map((id) => {
            const emoji = custom.filter((e) => e.id === id)[0]
            if (emoji) {
              return emoji
            }

            return id
          })
          .filter((id) => !!getData(id, null, null, this.data))
      }

      if (emojis.length === 0 && frequentlyUsed.length > 0) {
        return null
      }
    }

    if (emojis) {
      emojis = emojis.slice(0)
    }

    return emojis
  }

  updateDisplay(display) {
    var emojis = this.getEmojis()

    if (!emojis || !this.container) {
      return
    }

    this.container.style.display = display
  }

  setContainerRef(c) {
    this.container = c
  }

  setLabelRef(c) {
    this.label = c
  }

  render() {
    var {
        id,
        name,
        hasStickyPosition,
        emojiProps,
        i18n,
        notFound,
        notFoundEmoji,
      } = this.props,
      emojis = this.getEmojis(),
      labelStyles = {},
      labelSpanStyles = {},
      containerStyles = {}

    if (!emojis) {
      containerStyles = {
        display: 'none',
      }
    }

    if (!hasStickyPosition) {
      labelStyles = {
        height: 28,
      }

      labelSpanStyles = {
        position: 'absolute',
      }
    }

    const label = i18n.categories[id] || name

    return (
      <section
        ref={this.setContainerRef}
        className="emoji-mart-category"
        aria-label={label}
        style={containerStyles}
      >
        <div
          style={labelStyles}
          data-name={name}
          className="emoji-mart-category-label"
        >
          <span
            style={labelSpanStyles}
            ref={this.setLabelRef}
            aria-hidden={true /* already labeled by the section aria-label */}
          >
            {label}
          </span>
        </div>

        <ul className="emoji-mart-category-list">
          {emojis &&
            emojis.map((emoji) => (
              <li
                key={
                  (emoji.short_names && emoji.short_names.join('_')) || emoji
                }
              >
                {NimbleEmoji({ emoji: emoji, data: this.data, ...emojiProps })}
              </li>
            ))}
        </ul>

        {emojis && !emojis.length && (
          <NotFound
            i18n={i18n}
            notFound={notFound}
            notFoundEmoji={notFoundEmoji}
            data={this.data}
            emojiProps={emojiProps}
          />
        )}
      </section>
    )
  }
}

Category.propTypes /* remove-proptypes */ = {
  emojis: PropTypes.array,
  hasStickyPosition: PropTypes.bool,
  name: PropTypes.string.isRequired,
  native: PropTypes.bool.isRequired,
  perLine: PropTypes.number.isRequired,
  emojiProps: PropTypes.object.isRequired,
  recent: PropTypes.arrayOf(PropTypes.string),
  notFound: PropTypes.func,
  notFoundEmoji: PropTypes.string.isRequired,
}

Category.defaultProps = {
  emojis: [],
  hasStickyPosition: true,
}
