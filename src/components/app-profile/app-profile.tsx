import { Component, Prop, h } from '@stencil/core';
import Store from '../../stores/store';
import { prop, store } from '../../decorators/store';
import { watch } from '@arcgis/core/core/reactiveUtils';
import debug from '../../decorators/debug';

@Component({
  tag: 'app-profile',
})
export class AppProfile {

  @store(Store) declare private state: Store // Global store
  @store(Store) declare private state2: Store // Duplicated global store
  @store(Store, { group: prop('group') }) declare private state3: Store // Grouped store

  @Prop() group?: string

  @debug()
  log(_: unknown) {}

  componentWillLoad() {
    window.setInterval(() => this.state.seconds++, 1_000);

    watch(() => this.state.clicks, value => {
      this.state.squaredClicks = value ** 2
    })
  }

  componentDidLoad() {
    // this.state.seconds = 1
  }

  render() {
    return (
      <dl>
        <dt>Group:</dt>
        <dd>{this.group}</dd>

        <dt>Seconds:</dt>
        <dd>{this.state.seconds} (global)</dd>

        <dt>Clicks:</dt>
        <dd>{this.state.clicks} (global), {this.state2.clicks} (global 2), {this.state3.clicks} (grouped)</dd>

        <dt>Squared Clicks:</dt>
        <dd>{this.state.squaredClicks} (global)</dd>
      </dl>
    )
  }
}
