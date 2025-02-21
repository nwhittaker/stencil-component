import { Component, h } from '@stencil/core';
import state from '../store';

@Component({
  tag: 'my-global-counter',
  shadow: true,
})
export class MyGlobalCounter {
  render() {
    return (
      <button onClick={() => state.clicks++}>
        {state.clicks}
      </button>
    );
  }
}
