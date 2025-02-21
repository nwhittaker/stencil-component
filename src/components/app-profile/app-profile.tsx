import { Component, h } from '@stencil/core';
import state from '../store';

@Component({
  tag: 'app-profile',
})
export class AppProfile {

  componentWillLoad() {
    setInterval(() => state.seconds += 3, 3_000); // 3s to exceed the store's internal cleanup debounce time.
  }

  render() {
    return (
      <p>
        Seconds: {state.seconds}
        <br />
        Squared Clicks: {state.squaredClicks}
      </p>
    );
  }
}
