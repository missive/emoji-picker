import React from 'react'
import PropTypes from 'prop-types'

import { getData } from '../utils'
import NimbleEmoji from './emoji/nimble-emoji'
import SkinsEmoji from './skins-emoji'
import SkinsDot from './skins-dot'

export default class Preview extends React.PureComponent {
  constructor(props) {
    super(props)

    this.data = props.data
  }

  componentDidUpdate(prevProps) {
    if (prevProps.emoji && !this.props.emoji) {
      this.props.onHidePreview()
    }
    if (!prevProps.emoji && this.props.emoji) {
      this.props.onShowPreview()
    }
  }

  render() {
    const {
      emoji,
      emojiProps,
      idleEmoji,
      skinsProps,
      showSkinTones,
      title,
      i18n,
      showPreview,
    } = this.props

    if (emoji && showPreview) {
      var emojiData = getData(emoji, null, null, this.data),
        { emoticons = [] } = emojiData,
        knownEmoticons = [],
        listedEmoticons = []

      emoticons.forEach((emoticon) => {
        if (knownEmoticons.indexOf(emoticon.toLowerCase()) >= 0) {
          return
        }

        knownEmoticons.push(emoticon.toLowerCase())
        listedEmoticons.push(emoticon)
      })

      return (
        <div className="emoji-mart-preview">
          <div className="emoji-mart-preview-emoji" aria-hidden="true">
            {NimbleEmoji({
              key: emoji.id,
              emoji: emoji,
              data: this.data,
              ...emojiProps,
            })}
          </div>

          <div className="emoji-mart-preview-data" aria-hidden="true">
            <div className="emoji-mart-preview-name">{emoji.name}</div>
            <div className="emoji-mart-preview-shortnames">
              {emojiData.short_names.map((short_name) => (
                <span key={short_name} className="emoji-mart-preview-shortname">
                  :{short_name}:
                </span>
              ))}
            </div>
            <div className="emoji-mart-preview-emoticons">
              {listedEmoticons.map((emoticon) => (
                <span key={emoticon} className="emoji-mart-preview-emoticon">
                  {emoticon}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="emoji-mart-preview">
        <div className="emoji-mart-preview-emoji" aria-hidden="true">
          {idleEmoji &&
            idleEmoji.length &&
            NimbleEmoji({
              emoji: idleEmoji,
              data: this.data,
              ...emojiProps,
            })}
        </div>

        <div className="emoji-mart-preview-data" aria-hidden="true">
          <span className="emoji-mart-title-label">{title}</span>
        </div>

        {showSkinTones && (
          <div
            className={`emoji-mart-preview-skins${
              skinsProps.skinEmoji ? ' custom' : ''
            }`}
          >
            {skinsProps.skinEmoji ? (
              <SkinsEmoji
                skin={skinsProps.skin}
                emojiProps={emojiProps}
                data={this.data}
                skinEmoji={skinsProps.skinEmoji}
                i18n={i18n}
                onChange={skinsProps.onChange}
              />
            ) : (
              <SkinsDot
                skin={skinsProps.skin}
                i18n={i18n}
                onChange={skinsProps.onChange}
              />
            )}
          </div>
        )}
      </div>
    )
  }
}

Preview.propTypes = {
  onShowPreview: PropTypes.func.isRequired,
  onHidePreview: PropTypes.func.isRequired,
  showSkinTones: PropTypes.bool,
  title: PropTypes.string.isRequired,
  idleEmoji: PropTypes.string.isRequired,
  emoji: PropTypes.object,
  emojiProps: PropTypes.object.isRequired,
  skinsProps: PropTypes.object.isRequired,
}

Preview.defaultProps = {
  emoji: null,
  showSkinTones: true,
  onChange: () => {},
}
