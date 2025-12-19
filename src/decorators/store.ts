import { ComponentInterface, forceUpdate, getElement } from "@stencil/core";
import { watch } from "@arcgis/core/core/reactiveUtils";
import Accessor from "@arcgis/core/core/Accessor";

const stores = new Map<string, [Accessor, Set<ComponentInterface>]>()

interface Options {
  group?: string | ((target: ComponentInterface) => string)
}

interface State {
  handle?: __esri.WatchHandle,
  key: string,
  willRender: boolean
}

export function prop(name: string) {
  return function (target: ComponentInterface) {
    return target[name]
  }
}

/**
 * IMPORTANT: The usual warnings apply around changing store state in the `componentDid*` hooks.
 *
 * @param type
 * @param param1
 */
export function store(type: typeof Accessor, { group }: Options = {}): PropertyDecorator {

  return function (target: ComponentInterface, propertyKey: string | symbol) {
    const {
        componentDidRender,
        componentWillLoad,
        componentWillUpdate,
        connectedCallback,
        disconnectedCallback,
        render
      } = target,
      state = new WeakMap<ComponentInterface, State>()

    target.connectedCallback = function () {
      state.set(this, { key: storeKey(this), willRender: false })

      const store = linkStore(this, state.get(this)!)
      Reflect.set(this, propertyKey, store)

      // Reconnecting an element doesn't re-render it by default. So force an update to begin storage watching.
      getElement(this).componentOnReady().then(({ isConnected }) => {
        if (!isConnected || isWatchingStorage(state.get(this)!)) return
        forceUpdate(this)
      })

      connectedCallback?.call(this)
    }

    target.componentWillLoad = function () {
      state.get(this)!.willRender = true
      return componentWillLoad?.call(this)
    }

    target.componentWillUpdate = function () {
      state.get(this)!.willRender = true
      return componentWillUpdate?.call(this)
    }

    target.render = function () {
      // Stop and restart watching in the `render` hook for a few reasons:
      //   1. Ensures `render()` is called at the right time within the component's lifecycle.
      //   2. Refreshes the watcher with the set of store values used during rendering.
      stopWatchingStorage(state.get(this)!)
      return startWatchingStorage(this, state.get(this)!, render)
    }

    target.componentDidRender = function () {
      state.get(this)!.willRender = false
      return componentDidRender?.call(this)
    }

    target.disconnectedCallback = function () {
      disconnectedCallback?.call(this)
      stopWatchingStorage(state.get(this)!)
      unlinkStore(this, state.get(this)!)
      state.delete(this)
    }
  }

  function storeKey(target: ComponentInterface, state?: State) {
    return state?.key ?? [
      type.name,
      typeof group === 'function' ? group(target) : group
    ].filter(Boolean).join('/')
  }

  function linkStore(target: ComponentInterface, state: State) {
    const key = storeKey(target, state),
      [ store, refs ] = stores.get(key) ?? [ new type(), new Set() ]

    refs.add(target)
    stores.set(key, [ store, refs ])

    return store
  }

  function unlinkStore(target: ComponentInterface, state: State) {
    const key = storeKey(target, state),
      [ store, refs ] = stores.get(key)!

    refs.delete(target)

    if (refs.size === 0) {
      store.destroy()
      stores.delete(key)
    }
  }

  function shouldUpdate(state: State) {
    return state.willRender === false
  }

  function isWatchingStorage(state: State) {
    return Boolean(state.handle)
  }

  function startWatchingStorage(target: ComponentInterface, state: State, render = () => {}) {
    let jsx: unknown,
      shouldRender = true

    const getValue = () => {
        // Only render if we're in the `render` phase of the lifecycle. Otherwise the callback will kick off an update.
        if (shouldRender) {
          shouldRender = false
          // Setting jsx here, as a side-effect, instead of in the callback. This avoids enabling the `initial` option
          // which causes a double hit in the beginning.
          jsx = render.call(target)
        }
      },
      callback = () => {
        // Only kick off an update in the likely event we're not already in the beginning of one.
        if (shouldUpdate(state)) {
          forceUpdate(target)
        }
      },
      handle = watch(getValue, callback, { equals: () => false, sync: true })

    state.handle = handle
    return jsx
  }

  function stopWatchingStorage(state: State) {
    state.handle?.remove()
    delete state.handle
  }
}
