import React from 'react'
import PropTypes from 'prop-types'

import GenderEmoji from './gender-emoji'
import SkinsDot from './skins-dot'

let id = 0

export default class Filter extends React.PureComponent {
  render() {
    const { i18n, onGenderChange, skinsProps, emojiProps, data } = this.props

    return (
      <section className="emoji-mart-filter" aria-label={i18n.filter}>
        <GenderEmoji
          gender={0}
          emojis={['man', 'woman']}
          emojiProps={emojiProps}
          data={data}
          onChange={onGenderChange}
        />
        <SkinsDot
          skin={skinsProps.skin}
          i18n={i18n}
          onChange={skinsProps.onChange}
        />
        {/* <SkinsEmoji
          skin={skinsProps.skin}
          emojiProps={emojiProps}
          data={this.data}
          skinEmoji={skinsProps.skinEmoji}
          i18n={i18n}
          onChange={skinsProps.onChange}
        /> */}
      </section>
    )
  }
}

Filter.propTypes /* remove-proptypes */ = {
  onGenderChange: PropTypes.func,
  emojiProps: PropTypes.object.isRequired,
  skinsProps: PropTypes.object.isRequired,
}

Filter.defaultProps = {
  onGenderChange: () => {},
}
