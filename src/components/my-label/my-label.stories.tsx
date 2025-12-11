import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h, Host } from '@stencil/core';
import { MyLabel } from './my-label';

const meta: Meta<MyLabel> = {
  title: 'MyLabel',
  component: 'my-label',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<MyLabel>;

export const NestedComponent: Story = {
  render: () => (
    <Host>
      <my-label for="input-id">My label</my-label>
      <my-input id="input-id" />
    </Host>
  )
};
