import "@esri/calcite-components/dist/calcite/calcite.css";
import { defineCustomElements } from '../loader/index.js';
import { defineCustomElements as defineCalciteComponents } from '@esri/calcite-components/dist/loader';

/**
 * Registers all custom elements in the Storybook preview.
 * This is useful if your components rely on other nested Stencil components.
 */
defineCustomElements();
defineCalciteComponents();
