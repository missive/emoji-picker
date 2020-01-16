import React from 'react'
import PropTypes from 'prop-types'

import NimbleEmoji from './emoji/nimble-emoji'
import Skins from './skins'

export default class GenderEmoji extends React.PureComponent {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(index) {
    const { emojiProps, onChange } = this.props
    if (index !== emojiProps.gender) onChange(index)
  }

  render() {
    const { emojiProps, data, emojis } = this.props

    return (
      <div
        className={`emoji-mart-skin-swatches emoji-mart-gender custom opened`}
      >
        {emojis.map((emoji, index) => (
          <span
            key={`gender-${index}`}
            className={`emoji-mart-skin-swatch custom${
              index === emojiProps.gender ? ' selected' : ''
            }`}
          >
            <span onClick={() => this.handleClick(index)}>
              {NimbleEmoji({
                emoji: emoji,
                data: data,
                // skin: emojiProps.skin,
                // backgroundImageFn: emojiProps.backgroundImageFn,
                // native: emojiProps.native,
                // set: emojiProps.set,
                // sheetSize: emojiProps.sheetSize,
                // size: emojiProps.size,
                ...emojiProps,
              })}
            </span>
          </span>
        ))}
      </div>
    )
  }
}

GenderEmoji.propTypes /* remove-proptypes */ = {
  onChange: PropTypes.func,
  emojiProps: PropTypes.object.isRequired,
  skinTone: PropTypes.number,
}

GenderEmoji.defaultProps = {
  onChange: () => {},
}
