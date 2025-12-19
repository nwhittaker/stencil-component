import { Component, ComponentInterface, Prop, h } from '@stencil/core';
import Store from '../../stores/store';
import { storage } from '../../stores/decorator';
import { watch } from '@arcgis/core/core/reactiveUtils';

function prop(name: string) {
  return function (this: ComponentInterface) {
    return this[name]
  }
}

@Component({
  tag: 'app-profile',
})
export class AppProfile {

  @storage(Store) declare private state: Store
  @storage(Store) declare private state2: Store
  @storage(Store, { group: prop('group') }) declare private state3: Store

  @Prop() group?: string

  connectedCallback() {
    console.log('app-profile connectedCallback')
  }

  disconnectedCallback() {
    console.log('app-profile disconnectedCallback')
  }

  componentWillLoad() {
    console.log('app-profile componentWillLoad')
    // window.setInterval(() => this.state.seconds++, 1_000);

    watch(() => this.state.clicks, value => {
      this.state.squaredClicks = value ** 2
    })
  }

  componentDidLoad() {
    console.log('app-profile componentDidLoad')
    // this.state.seconds = 1
  }

  componentWillRender() {
    console.log('app-profile componentWillRender')
  }

  componentDidRender() {
    console.log('app-profile componentDidRender')
  }

  componentWillUpdate() {
    console.log('app-profile componentWillUpdate')
  }

  componentDidUpdate() {
    console.log('app-profile componentDidUpdate')
  }

  render() {
    console.log('app-profile render')//, { seconds: this.state.seconds, clicks: this.state.clicks, squaredClicks: this.state.squaredClicks });
    return (
      <p>
        Seconds: {this.state.seconds}
        <br />
        Clicks: {this.state.clicks}, {this.state2.clicks}, {this.state3.clicks}
        <br />
        Squared Clicks: {this.state.squaredClicks}
      </p>
    )
  }
}
