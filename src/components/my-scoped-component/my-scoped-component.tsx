import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-scoped-component',
  scoped: true,
})
export class MyScopedComponent {
  @Prop() visible = false

  render() {
    return (
      <Host>
        {this.visible && <slot name="content" />}
      </Host>
    );
  }
}
