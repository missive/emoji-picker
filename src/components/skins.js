import React from 'react'

export default class Skins extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      opened: false,
    }
  }

  handleClick(skin) {
    var { onChange } = this.props

    if (!this.state.opened) {
      this.setState({ opened: true })
    } else {
      onChange(skin)
      this.setState({ opened: false })
    }
  }

  render() {
    var { skin } = this.props,
        { opened } = this.state

    return <div>
      <div className={`emoji-picker-skin-swatches ${opened ? 'emoji-picker-skin-swatches-opened' : ''}`}>
        {Array(6).fill().map((_, i) => {
          var skinTone = i + 1,
              selected = skinTone == skin

          return <span key={`skin-tone-${skinTone}`} className={`emoji-picker-skin-swatch ${selected ? 'emoji-picker-skin-swatch-selected' : ''}`}>
            <span
              onClick={() => this.handleClick(skinTone)}
              className={`emoji-picker-skin emoji-picker-skin-tone-${skinTone}`}>
            </span>
          </span>
        })}
      </div>
    </div>
  }
}

Skins.propTypes = {
  onChange: React.PropTypes.func,
  skin: React.PropTypes.number.isRequired,
}

Skins.defaultProps = {
  onChange: (() => {}),
}
