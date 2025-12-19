import { Component, ComponentInterface, Prop, h } from '@stencil/core';
import Store from '../../stores/store';
import { storage } from '../../stores/decorator';

function prop(name: string) {
  return function (this: ComponentInterface) {
    return this[name]
  }
}

@Component({
  tag: 'my-global-counter',
  shadow: true,
})
export class MyGlobalCounter {

  @storage(Store) declare private state: Store
  @storage(Store, { group: prop('group') }) declare private state3: Store

  @Prop({ mutable: true }) expanded = false
  @Prop() group?: string
  @Prop({ mutable: true }) declare label: string

  connectedCallback() {
    console.log('my-global-counter connectedCallback')
  }

  disconnectedCallback() {
    console.log('my-global-counter disconnectedCallback')
  }

  componentWillLoad() {
    console.log('my-global-counter componentWillLoad')
    this.label = 'Clicked: '
  }

  componentDidLoad() {
    console.log('my-global-counter componentDidLoad')
    // this.label = 'Clicked: '
  }

  componentWillRender() {
    console.log('my-global-counter componentWillRender')
  }

  componentDidRender() {
    console.log('my-global-counter componentDidRender')
  }

  componentWillUpdate() {
    console.log('my-global-counter componentWillUpdate')
  }

  componentDidUpdate() {
    console.log('my-global-counter componentDidUpdate')
  }

  render() {
    console.log('my-global-counter render')//, { seconds: this.clicked ? this.state.seconds : undefined, clicks: this.state.clicks, squaredClicks: this.state.squaredClicks }, { clicked: this.clicked });
    return (
      <button onClick={event => {
        // Press cmd to update state3. Press cmd+alt to update both stores.
        if (event.metaKey) {
          this.state3.clicks++

          if (event.altKey) {
            this.state.clicks++
          }

          return
        }

        if (event.shiftKey) {
          this.expanded = !this.expanded
          return
        }

        this.state.clicks++
      }}>
        {this.label}
        {this.state.clicks}, {this.state3.clicks}
        {this.expanded ? ` in ${this.state.seconds} seconds` : ''}
        {this.state.clicks > 1 ? ` (squared: ${this.state.squaredClicks})` : ''}
      </button>
    )
  }
}
