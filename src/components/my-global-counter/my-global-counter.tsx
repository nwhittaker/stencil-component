import { Component, Prop, h } from '@stencil/core';
import type Store from '../../stores/store';
import { storage } from '../../stores/decorator';

@Component({
  tag: 'my-global-counter',
  shadow: true,
})
export class MyGlobalCounter {

  @storage() declare private state: Store

  @Prop({ mutable: true }) expanded = false
  @Prop({ mutable: true }) declare label: string

  componentWillLoad() {
    this.label = 'Clicked: '
  }

  render() {
    console.log('my-global-counter render')//, { seconds: this.clicked ? this.state.seconds : undefined, clicks: this.state.clicks, squaredClicks: this.state.squaredClicks }, { clicked: this.clicked });
    return (
      <button onClick={() => {
        this.expanded = !this.expanded
        this.state.clicks++
      }}>
        {this.label}
        {this.state.clicks}
        {this.expanded ? ` in ${this.state.seconds} seconds` : ''}
      </button>
    )
  }
}
