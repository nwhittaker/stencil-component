import { Component, ComponentInterface, Prop, h } from '@stencil/core';
import type Store from '../../stores/store';
import { storage } from '../../stores/decorator';

@Component({
  tag: 'app-profile',
})
export class AppProfile {

  @storage() declare private state: Store

  componentWillLoad() {
    window.setInterval(() => this.state.seconds++, 1_000);
  }

  render() {
    console.log('app-profile render')//, { seconds: this.state.seconds, clicks: this.state.clicks, squaredClicks: this.state.squaredClicks });
    return (
      <p>
        Seconds: {this.state.seconds}
        <br />
        Squared Clicks: {this.state.squaredClicks}
      </p>
    )
  }
}
