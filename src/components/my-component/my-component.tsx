import { Component, Listen, h } from '@stencil/core';
import type { CalciteAlertCustomEvent } from '@esri/calcite-components'

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {

  @Listen('calciteAlertClose')
  alertClosed(event: CalciteAlertCustomEvent<void>) {
    event.currentTarget.open // Should be bad.
    event.currentTarget as HTMLMyComponentElement // Should be good.
  }

  render() {
    return <calcite-alert label='' open />
  }
}
