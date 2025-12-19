/* eslint-disable no-console */
import { getElement } from '@stencil/core'

import type { ComponentInterface } from '@stencil/core'

type ExtractEntries<Type, Value = unknown, Key = unknown> = {
  [K in keyof Type as Type[K] extends Value ? Extract<K, Key> : never]: Type[K]
}

type LifecycleHooks = ExtractEntries<ComponentInterface, unknown, `${string}Callback` | `component${string}` | 'render'>
type SymmetricalLifecycleHooks = Omit<LifecycleHooks, 'componentShouldUpdate'>

const BADGE_STYLES = 'background: light-dark(black, white); color: light-dark(white, black); border-radius: 4px; padding: 2px 4px; font-weight: normal;'

/**
 * A method decorator to aid component debugging.
 *
 * Logs the points at which instances of the decorated method's component invoke its lifecycle hooks. Most logs include
 * the hook name and the component's element. The `componentShouldUpdate` log is expandable to show its parameters and a
 * trace of its call tree. Be aware the component's element is not snapshotted until expanded. Use it to identify which
 * instances the logs belong to. To log snapshotted state, provide console statements in the decorated method.
 *
 * IMPORTANT: Logs are printed immediately. As such, console group nesting can appear disorganized if multiple
 * components are updating simultaneously. For best results, use the {@link predicate} parameter to limit logging to a
 * single component instance at a time.
 *
 * #### Dev notes
 *   - Optimized for use with Chrome's DevTools.
 *   - Ideally this is a class decorator, however Stencil does not allow other class decorators due to how it performs
 *     static analysis.
 *   - In most cases, the debugger is preferable, however Stencil produces incorrect source maps which makes this very
 *     difficult.
 *
 * @example
 * ```
 * class MyComponent {
 *   \@debug()
 *   logValue(hook: keyof LifecycleHooks) {
 *     if (hook !== 'componentWillLoad') return
 *     console.log('initial value: %o', this.value)
 *   }
 *
 *   \@debug(function () { return this.el.id === 'my-instance' })
 *   logDidUpdateState() {
 *     console.log('value: %o', this.value)
 *   }
 * }
 * ```
 *
 * @param predicate Use to limit logging to specific instances.
 */
export default function (predicate: (this: ComponentInterface) => boolean = () => true) {
  return function <T extends ComponentInterface>(
    target: T,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(hook: keyof LifecycleHooks) => void>,
  ) {
    const {
        connectedCallback,
        componentDidLoad,
        componentDidRender,
        componentDidUpdate,
        componentShouldUpdate,
        componentWillLoad,
        componentWillRender,
        componentWillUpdate,
        disconnectedCallback,
        render,
      } = target,
      userLog = descriptor.value!

    target.connectedCallback = logHook('connectedCallback', connectedCallback)
    target.disconnectedCallback = logHook('disconnectedCallback', disconnectedCallback)

    target.componentWillLoad = startGroup('componentWillLoad', componentWillLoad)
    target.componentDidLoad = endGroup('componentDidLoad', componentDidLoad)

    target.componentWillUpdate = startGroup('componentWillUpdate', componentWillUpdate)
    target.componentDidUpdate = endGroup('componentDidUpdate', componentDidUpdate)

    target.componentWillRender = startGroup('componentWillRender', componentWillRender)
    target.render = logHook('render', render)
    target.componentDidRender = endGroup('componentDidRender', componentDidRender)

    target.componentShouldUpdate = logHook('componentShouldUpdate', function (this: ComponentInterface, ...args) {
      return componentShouldUpdate?.call(this, ...args) ?? true
    })

    function startGroup<
      K extends keyof SymmetricalLifecycleHooks,
      T extends Required<SymmetricalLifecycleHooks>[K],
    >(name: K, hook?: T) {
      return function (this: ComponentInterface, ...args: Parameters<T>) {
        const shouldLog = predicate.call(this)

        if (shouldLog) {
          console.group('%c%s', BADGE_STYLES, name, getElement(this))
          userLog.call(this, name)
        }

        return hook?.call(this, ...args)
      }
    }

    function logHook<T extends Extract<LifecycleHooks, 'componentShouldUpdate'>, K extends keyof T>(
      name: K,
      hook?: T[K],
    ): T[K]

    function logHook<T extends Exclude<LifecycleHooks, 'componentShouldUpdate'>, K extends keyof T>(
      name: K,
      hook?: T[K],
    ): T[K]

    function logHook(name: keyof LifecycleHooks, hook?: (...args: unknown[]) => unknown) {
      return function (this: ComponentInterface, ...args: unknown[]) {
        const shouldLog = predicate.call(this)

        try {
          const returnValue = hook?.call(this, ...args)

          if (shouldLog) {
            console.groupCollapsed('%c%s', BADGE_STYLES, name, getElement(this))
            userLog.call(this, name)

            if (name === 'componentShouldUpdate') {
              const [ newValue, oldValue, propName ] = args
              console.table({ 'I/O': { newValue, oldValue, propName, returnValue }})
            }

            console.dir(returnValue)
            console.trace()
          }

          return returnValue
          // }
        } finally {
          if (shouldLog) {
            console.groupEnd()
          }
        }
      }
    }

    function endGroup<
      K extends keyof SymmetricalLifecycleHooks,
      T extends Required<SymmetricalLifecycleHooks>[K],
    >(name: K, hook?: T) {
      return function (this: ComponentInterface, ...args: Parameters<T>) {
        const shouldLog = predicate.call(this)

        if (shouldLog) {
          console.groupEnd()
          console.group('%c%s', BADGE_STYLES, name, getElement(this))
          userLog.call(this, name)
          console.groupEnd()
        }

        return hook?.call(this, ...args)
      }
    }
  }
}
