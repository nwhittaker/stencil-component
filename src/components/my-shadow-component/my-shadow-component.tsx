import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-shadow-component',
  shadow: true,
})
export class MyShadowComponent {
  @Prop() visible = false

  render() {
    return (
      <Host>
        {this.visible && <slot name="content" />}
      </Host>
    );
  }
}
