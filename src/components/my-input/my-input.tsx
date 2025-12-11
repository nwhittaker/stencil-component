import { Component, Host, Listen, h } from '@stencil/core';

@Component({
  tag: 'my-input',
  shadow: true,
})
export class MyInput {
  private inputEl?: HTMLCalciteInputElement;

  @Listen('focus')
  handleFocus() {
    this.inputEl?.setFocus();
  }

  render() {
    return (
      <Host tabindex="0">
        <calcite-input ref={inputEl => this.inputEl = inputEl} />
      </Host>
    );
  }
}
