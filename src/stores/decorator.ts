import { ComponentInterface, forceUpdate, getElement } from "@stencil/core";
import { watch } from "@arcgis/core/core/reactiveUtils";
import Accessor from "@arcgis/core/core/Accessor";

const stores = new Map<string, [Accessor, Set<ComponentInterface>]>()

interface Options {
  group?: string | (() => string)
}

/**
 * IMPORTANT: The usual warnings apply around changing store state in the `componentDid*` hooks.
 *
 * @param type
 * @param param1
 */
export function storage(type: typeof Accessor, { group }: Options = {}): PropertyDecorator {

  const state = new WeakMap<ComponentInterface, { handle?: __esri.WatchHandle, willRender: boolean }>()

  return function (target: ComponentInterface, propertyKey: string | symbol) {
    const {
        componentDidRender,
        componentWillLoad,
        componentWillUpdate,
        connectedCallback,
        disconnectedCallback,
        render
      } = target

    target.connectedCallback = function () {
      const store = linkStore(this)
      Reflect.set(this, propertyKey, store)

      // Force an update if reconnecting the element didn't re-render it.
      getElement(this).componentOnReady().then(() => {
        if (!isWatchingStorage(this)) {
          forceUpdate(this)
        }
      })

      state.set(this, { willRender: false })
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
      // Stop and restart watching in the `render()` hook for a few reasons:
      //   1. Ensures `render()` is called within the component's lifecycle.
      //   2. Refreshes the watcher with the set of store values used during rendering.
      stopWatchingStorage(this)
      return startWatchingStorage(this, render)
    }

    target.componentDidRender = function () {
      state.get(this)!.willRender = false
      return componentDidRender?.call(this)
    }

    target.disconnectedCallback = function () {
      disconnectedCallback?.call(this)
      stopWatchingStorage(this)
      state.delete(this)
      unlinkStore(this)
    }
  }

  function getStoreKey(target: ComponentInterface) {
    const id = [ type.name ]

    if (group) {
      id.push(typeof group === 'function' ? group.call(target) : group)
    }

    return id.join('/')
  }

  function linkStore(target: ComponentInterface) {
    const key = getStoreKey(target),
      [ store, refs ] = stores.get(key) ?? [ new type(), new Set() ]

    console.log('@storage() linkStore', { target, key, create: !stores.has(key) })

    refs.add(target)
    stores.set(key, [ store, refs ])

    return store
  }

  function unlinkStore(target: ComponentInterface) {
    const key = getStoreKey(target),
      [ store, refs ] = stores.get(key)!

    refs.delete(target)

    if (refs.size === 0) {
      store.destroy()
      stores.delete(key)
    }
  }

  function shouldUpdate(target: ComponentInterface) {
    return state.get(target)?.willRender === false
  }

  function isWatchingStorage(target: ComponentInterface) {
    return Boolean(state.get(target)?.handle)
  }

  function startWatchingStorage(target: ComponentInterface, render = () => {}) {
    let jsx: unknown,
      shouldRender = true

    const getValue = () => {
        console.log('@storage() getValue', getStoreKey(target), { target, firstRender: shouldRender })
        // Only render if we're in that phase of the lifecycle. Otherwise the callback will kick off an update.
        if (shouldRender) {
          shouldRender = false
          // Setting jsx here, as a side-effect, instead of in the callback. This avoids enabling the `initial`
          // option which causes a double render in the beginning.
          jsx = render.call(target)
        }
      },
      callback = () => {
        console.log('@storage() callback', getStoreKey(target),{ target, shouldRender: shouldUpdate(target) })
        // Only kick off an update if one hasn't already begun.
        if (shouldUpdate(target)) {
          forceUpdate(target)
        }
      },
      handle = watch(getValue, callback, { equals: () => false, sync: true })

    state.get(target)!.handle = handle
    return jsx
  }

  function stopWatchingStorage(target: ComponentInterface) {
    state.get(target)!.handle?.remove()
    state.get(target)!.handle = undefined
  }
}
