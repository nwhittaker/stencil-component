import { Component, Prop, h } from '@stencil/core';
import Store from '../../stores/store';
import { prop, store } from '../../decorators/store';
import debug from '../../decorators/debug';

@Component({
  tag: 'my-global-counter',
  shadow: true,
})
export class MyGlobalCounter {

  @store(Store) declare private state: Store // Global store
  @store(Store, { group: prop('group') }) declare private state3: Store // Grouped store

  @Prop({ mutable: true }) expanded = false
  @Prop() group?: string
  @Prop({ mutable: true }) declare label: string

  @debug()
  log(_: unknown) {}

  componentWillLoad() {
    this.label = 'Clicked: '
  }

  componentDidLoad() {
    // this.label = 'Clicked: '
  }

  render() {
    return (
      <button onClick={event => {

        // Update component state
        if (event.shiftKey) {
          this.expanded = !this.expanded
          return
        }

        // Update both global and grouped stores
        if (event.metaKey && event.altKey) {
          this.state.clicks++
          this.state3.clicks++
          return
        }

        // Update only global store
        if (event.metaKey) {
          this.state.clicks++
          return
        }

        // Update only grouped store by default
        this.state3.clicks++
      }}>
        {this.label}
        {this.state.clicks} (global), {this.state3.clicks} (grouped)
        {this.expanded ? ` in ${this.state.seconds} seconds (global)` : ''}
        {this.state.clicks > 1 ? `, squared: ${this.state.squaredClicks} (global)` : ''}
      </button>
    )
  }
}
