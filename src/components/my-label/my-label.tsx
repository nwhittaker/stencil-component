import { Component, Host, Listen, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-label',
  shadow: true,
})
export class MyLabel {
  @Prop() for?: string;

  @Listen('click')
  handleClick() {
    if (!this.for) {
      return
    }

    const inputEl = document.getElementById(this.for);

    if ('setFocus' in inputEl && typeof inputEl.setFocus === 'function') {
      inputEl.setFocus();
    } else {
      inputEl.focus();
    }
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
