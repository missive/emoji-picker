import React from 'react'
import PropTypes from 'prop-types'

import Skins from './skins'

const focusOnElementBySkin = (el, skin) => {
  const currentSkinEl = el.querySelector(`[data-skin="${skin}"]`)
  currentSkinEl.focus()
}

export default class SkinsDot extends Skins {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleSkinKeyDown = this.handleSkinKeyDown.bind(this)
    this.setSkinTonesRef = this.setSkinTonesRef.bind(this)
    this.onClose = this.onClose.bind(this)
    this.skinTones = null
  }

  handleMenuClick() {
    const { skin } = this.props
    focusOnElementBySkin(this.skinTones, skin)
    this.setState({ opened: true })
  }

  handleKeyDown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      this.handleMenuClick(event)
    }
    event.stopPropagation()
  }

  handleSkinKeyDown(e, skin) {
    const selectLeft = () =>
      focusOnElementBySkin(this.skinTones, skin - 1 < 1 ? 6 : skin - 1)

    const selectRight = () =>
      focusOnElementBySkin(this.skinTones, skin + 1 > 6 ? 1 : skin + 1)

    switch (e.key) {
      case 'ArrowLeft':
        selectLeft()
        break

      case 'ArrowRight':
        selectRight()
        break

      case 'Tab':
        e.preventDefault()
        if (e.shiftKey) {
          selectLeft()
        } else {
          selectRight()
        }

        break

      case 'Enter':
      case 'Space':
        this.handleClick(e)
        this.onClose(e)
        break

      case 'Escape':
        this.onClose(e)
        break

      default:
        break
    }
    e.stopPropagation()
  }

  setSkinTonesRef(c) {
    this.skinTones = c
  }

  onClose(e) {
    this.setState({ opened: false }, () => {
      this.skinTones.focus()
    })
    e.stopPropagation()
  }

  render() {
    const { skin, i18n } = this.props
    const { opened } = this.state
    const skinToneNodes = []

    for (let skinTone = 1; skinTone <= 6; skinTone++) {
      const selected = skinTone === skin
      const visible = opened || selected
      skinToneNodes.push(
        <span
          key={`skin-tone-${skinTone}`}
          className={`emoji-mart-skin-swatch${selected ? ' selected' : ''}`}
          aria-label={i18n.skintones[skinTone]}
          aria-hidden={!visible}
          {...(opened ? { role: 'menuitem' } : {})}
        >
          <span
            onClick={(e) => {
              if (opened) {
                this.handleClick(e)
                this.onClose(e)
              }
            }}
            onKeyDown={(e) => this.handleSkinKeyDown(e, skinTone)}
            tabIndex={opened ? '0' : '-1'}
            role="button"
            {...(selected
              ? {
                  'aria-haspopup': true,
                  'aria-expanded': !!opened,
                }
              : {})}
            {...(opened ? { 'aria-pressed': !!selected } : {})}
            aria-label={i18n.skintones[skinTone]}
            title={i18n.skintones[skinTone]}
            data-skin={skinTone}
            className={`emoji-mart-skin emoji-mart-skin-tone-${skinTone}`}
          />
        </span>,
      )
    }

    return (
      <section
        className={`emoji-mart-skin-swatches${opened ? ' opened' : ''}`}
        aria-label={i18n.skintext}
      >
        <div
          {...(opened ? { role: 'menubar' } : {})}
          tabIndex={'0'}
          onClick={this.handleMenuClick}
          onKeyDown={this.handleKeyDown}
          ref={this.setSkinTonesRef}
        >
          {skinToneNodes}
        </div>
      </section>
    )
  }
}

SkinsDot.propTypes /* remove-proptypes */ = {
  onChange: PropTypes.func,
  skin: PropTypes.number.isRequired,
  i18n: PropTypes.object,
}

SkinsDot.defaultProps = {
  onChange: () => {},
}
