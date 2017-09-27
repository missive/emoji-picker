import React from 'react'
import ReactDOM from 'react-dom'

import { Picker, Emoji } from '../src'

const CUSTOM_EMOJIS = [
  {
    name: 'Octocat',
    short_names: ['octocat'],
    keywords: ['github'],
    imageUrl: 'https://assets-cdn.github.com/images/icons/emoji/octocat.png?v7'
  },
  {
    name: 'Squirrel',
    short_names: ['shipit', 'squirrel'],
    keywords: ['github'],
    imageUrl: 'https://assets-cdn.github.com/images/icons/emoji/shipit.png?v7'
  }
]

const CATEGORIES = [
  'recent',
  'people',
  'nature',
  'foods',
  'activity',
  'places',
  'objects',
  'symbols',
  'flags',
  'custom',
]

class Example extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      emojiSize: 24,
      perLine: 9,
      skin: 1,
      native: true,
      set: 'apple',
      hidden: false,
      currentEmoji: { id: '+1' },
      autoFocus: false,
      defaultValue: '',
      include: [],
      exclude: [],
    }
  }

  handleInput(e) {
    var { currentTarget } = e,
        { type } = currentTarget,
        key = currentTarget.getAttribute('data-key'),
        mount = currentTarget.getAttribute('data-mount'),
        state = {}

    if (type == 'checkbox') {
      var { checked } = currentTarget,
          value = currentTarget.getAttribute('data-value')

      if (value) {
        if (checked) {
          state[key] = this.state[key].concat(value)
        } else {
          state[key] = this.state[key].filter((item) => { return item != value })
        }
      } else {
        state[key] = checked
      }
    } else if (type === 'text') {
      var { value } = currentTarget
      state[key] = value
    } else {
      var { value } = currentTarget
      state[key] = parseInt(value)
    }

    if (mount) {
      this.setState({ hidden: true }, () => {
        state.hidden = false
        this.setState(state)
      })
    } else {
      this.setState(state)
    }
  }

  render() {
    return <div>
      <div>
        <h1 className='demo-title'>Emoji Mart</h1>

        <iframe
          src='https://ghbtns.com/github-btn.html?user=missive&repo=emoji-mart&type=star&count=true'
          frameBorder='0'
          scrolling='0'
          width='170px'
          height='20px'
        ></iframe>
      </div>

      <div className="row">
        {['native', 'apple', 'google', 'twitter', 'emojione', 'messenger', 'facebook'].map((set) => {
          var props = { disabled: !this.state.native && set == this.state.set }

          if (set == 'native' && this.state.native) {
            props.disabled = true
          }

          return <button
            key={set}
            value={set}
            onClick={() => {
              if (set == 'native') {
                this.setState({ native: true })
              } else {
                this.setState({ set: set, native: false })
              }
            }}
            {...props}>
            {set}
          </button>
        })}
      </div>

      <div className="row">
        <button
          onClick={() => this.setState({ hidden: !this.state.hidden })}
        >{this.state.hidden ? 'Mount' : 'Unmount'}</button>
      </div>

      <pre style={{
        fontSize: 18,
        display: 'inline-block',
        verticalAlign: 'top',
        margin: '1em',
        width: '460px',
      }}>
<Operator>import</Operator> &#123;Picker&#125; <Operator>from</Operator> <String>'emoji-mart'</String>
<br />
<br /><Operator>&lt;</Operator><Variable>Picker</Variable>
<br />  emojiSize<Operator>=</Operator>&#123;<Variable>{this.state.emojiSize}</Variable>&#125; <input type='range' data-key='emojiSize' data-mount={true} onChange={this.handleInput.bind(this)} min='16' max='64' value={this.state.emojiSize} />
<br />  perLine<Operator>=</Operator>&#123;<Variable>{this.state.perLine}</Variable>&#125; {this.state.perLine < 10 ? '  ' : ' '} <input type='range' data-key='perLine' onChange={this.handleInput.bind(this)} min='7' max='16' value={this.state.perLine} />
<br />  skin<Operator>=</Operator>&#123;<Variable>{this.state.skin}</Variable>&#125;       <input type='range' data-key='skin' onChange={this.handleInput.bind(this)} min='1' max='6' value={this.state.skin} />
<br />  set<Operator>=</Operator><String>'{this.state.set}'</String>
<br />  custom<Operator>=</Operator>&#123;<Variable>{'[…]'}</Variable>&#125;
<br />  autoFocus<Operator>=</Operator>&#123;<Variable>{this.state.autoFocus ? 'true' : 'false'}</Variable>&#125;{this.state.autoFocus ? ' ' : ''} <input type='checkbox' data-key='autoFocus' data-mount={true} onChange={this.handleInput.bind(this)} checked={this.state.autoFocus} />
<br />  defaultValue<Operator>=</Operator>&#123;<input data-key='defaultValue' data-mount={true} size={this.state.defaultValue.length + 1} value={this.state.defaultValue} onChange={this.handleInput.bind(this)} />&#125;
<div style={{ opacity: this.state.exclude.length ? 0.6 : 1 }}>  include<Operator>=</Operator>&#91;
{[0, 2, 4, 6, 8].map((i) => {
  let category1 = CATEGORIES[i],
      category2 = CATEGORIES[i + 1]

  return <div key={i}>
    <label style={{ width: '200px', display: 'inline-block' }}>    <input type='checkbox' data-key='include' data-value={category1} data-mount={true} onChange={this.handleInput.bind(this)} disabled={this.state.exclude.length} /> <String>'{category1}'</String></label>
    {category2 && <label><input type='checkbox' data-key='include' data-value={category2} data-mount={true} onChange={this.handleInput.bind(this)} disabled={this.state.exclude.length} /> <String>'{category2}'</String></label>}
  </div>
})}
  &#93;
</div>
<div style={{ opacity: this.state.include.length ? 0.6 : 1 }}>  exclude<Operator>=</Operator>&#91;
{[0, 2, 4, 6, 8].map((i) => {
  let category1 = CATEGORIES[i],
      category2 = CATEGORIES[i + 1]

  return <div key={i}>
    <label style={{ width: '200px', display: 'inline-block' }}>    <input type='checkbox' data-key='exclude' data-value={category1} data-mount={true} onChange={this.handleInput.bind(this)} disabled={this.state.include.length} /> <String>'{category1}'</String></label>
    {category2 && <label><input type='checkbox' data-key='exclude' data-value={category2} data-mount={true} onChange={this.handleInput.bind(this)} disabled={this.state.include.length} /> <String>'{category2}'</String></label>}
  </div>
})}
  &#93;
</div>
<Operator>/&gt;</Operator>
      </pre>

      {!this.state.hidden &&
        <Picker
          emojiSize={this.state.emojiSize}
          perLine={this.state.perLine}
          skin={this.state.skin}
          native={this.state.native}
          set={this.state.set}
          custom={CUSTOM_EMOJIS}
          autoFocus={this.state.autoFocus}
          defaultValue={this.state.defaultValue}
          include={this.state.include}
          exclude={this.state.exclude}
          onClick={(emoji) => {
            this.setState({ currentEmoji: emoji })
            console.log(emoji)
          }}
        />
      }

      <div>
        <pre style={{
          fontSize: 18,
          display: 'inline-block',
          verticalAlign: 'top',
          margin: '1em',
          width: '370px',
        }}>
<Operator>import</Operator> &#123;Emoji&#125; <Operator>from</Operator> <String>'emoji-mart'</String>
<br />
<br /><Operator>&lt;</Operator><Variable>Emoji</Variable>
<br />  emoji<Operator>=</Operator>{this.state.currentEmoji.custom ? (<Variable>{'{…}'}</Variable>) : (<String>'{this.state.currentEmoji.id}'</String>)}
<br />  size<Operator>=</Operator>&#123;<Variable>{64}</Variable>&#125;
<br /><Operator>/&gt;</Operator>
        </pre>

        <span style={{ display: 'inline-block', marginTop: 60 }}>
          {Emoji({
            emoji: this.state.currentEmoji.custom ? this.state.currentEmoji : this.state.currentEmoji.id,
            size: 64,
            set: this.state.set,
          })}
        </span>
      </div>

      <div>
        <pre style={{
          fontSize: 18,
          display: 'inline-block',
          verticalAlign: 'top',
          margin: '1em',
          width: '370px',
        }}>
<br /><Operator>&lt;</Operator><Variable>Emoji</Variable>
<br />  emoji<Operator>=</Operator><String>':{this.state.currentEmoji.id}:'</String>
<br />  size<Operator>=</Operator>&#123;<Variable>{64}</Variable>&#125;
<br /><Operator>/&gt;</Operator>
        </pre>

        <span style={{ display: 'inline-block', marginTop: 40 }}>
          {Emoji({
            emoji: `:${this.state.currentEmoji.id}:`,
            size: 64,
            set: this.state.set,
          })}
        </span>
      </div>

      <div>
        <pre style={{
          fontSize: 18,
          display: 'inline-block',
          verticalAlign: 'top',
          margin: '1em',
          width: '370px',
        }}>
  <br /><Operator>&lt;</Operator><Variable>Emoji</Variable>
  <br />  emoji<Operator>=</Operator><String>':{this.state.currentEmoji.id}::skin-tone-3:'</String>
  <br />  size<Operator>=</Operator>&#123;<Variable>{64}</Variable>&#125;
  <br /><Operator>/&gt;</Operator>
        </pre>

        <span style={{ display: 'inline-block', marginTop: 40 }}>
          {Emoji({
            emoji: `:${this.state.currentEmoji.id}::skin-tone-3:`,
            size: 64,
            set: this.state.set,
          })}
        </span>
      </div>

      <div>
        <pre style={{
          fontSize: 18,
          display: 'inline-block',
          verticalAlign: 'top',
          margin: '1em',
          width: '370px',
        }}>
  <br /><Operator>&lt;</Operator><Variable>Emoji</Variable>
  <br />  emoji<Operator>=</Operator><String>':{this.state.currentEmoji.id}::skin-tone-3:'</String>
  <br />  size<Operator>=</Operator>&#123;<Variable>{64}</Variable>&#125;
  <br />  native<Operator>=</Operator>&#123;<Variable>{'true'}</Variable>&#125;
  <br /><Operator>/&gt;</Operator>
        </pre>

        <span style={{ display: 'inline-block', marginTop: 60 }}>
          {Emoji({
            emoji: `:${this.state.currentEmoji.id}::skin-tone-3:`,
            size: 64,
            native: true,
          })}
        </span>
      </div>
    </div>
  }
}

class Operator extends React.Component {
  render() {
    return <span style={{color: '#a71d5d'}}>
      {this.props.children}
    </span>
  }
}

class Variable extends React.Component {
  render() {
    return <span style={{color: '#0086b3'}}>
      {this.props.children}
    </span>
  }
}

class String extends React.Component {
  render() {
    return <span style={{color: '#183691'}}>
      {this.props.children}
    </span>
  }
}

ReactDOM.render(<Example />, document.querySelector('div'))
