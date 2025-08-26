import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-dialog',
})
export class MyDialog {

  @Prop({ mutable: true }) open: boolean = false;

  render() {
    return (
      <calcite-dialog beforeClose={this.beforeClose} close-disabled open={this.open}>
        <calcite-button onClick={this.close} slot="footer-end">Done</calcite-button>
      </calcite-dialog>
    );
  }

  private beforeClose = () => {
    console.log('beforeClose');
  }

  private close = () => {
    this.open = false;
  }
}
