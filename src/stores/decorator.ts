import { ComponentInterface, forceUpdate, getElement } from "@stencil/core";
import Store from "./store";
import { watch } from "@arcgis/core/core/reactiveUtils";

const globalStorage = new Store()

watch(() => globalStorage.clicks, value => {
  globalStorage.squaredClicks = value ** 2
})

/**
 * IMPORTANT: The usual warnings apply around changing store state in the `componentDid*` hooks.
 *
 * @param type
 * @param param1
 */
export function storage(): PropertyDecorator {

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
      Reflect.set(this, propertyKey, globalStorage)

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
    }
  }

  function shouldUpdate(target: ComponentInterface) {
    return state.get(target)?.willRender === false
  }

  function isWatchingStorage(target: ComponentInterface) {
    return Boolean(state.get(target)?.handle)
  }

  function startWatchingStorage(target: ComponentInterface, render = () => {}) {
    let jsx: unknown
    let shouldRender = true

    const getValue = () => {
        console.log('@storage() getValue', { target, firstRender: shouldRender })
        // Only render if we're in that phase of the lifecycle. Otherwise the callback will kick off an update.
        if (shouldRender) {
          shouldRender = false
          // Setting jsx here, as a side-effect, instead of in the callback. This avoids enabling the `initial`
          // option which causes a double render in the beginning.
          jsx = render.call(target)
        }
      },
      callback = () => {
        console.log('@storage() callback', { target, shouldRender: shouldUpdate(target) })
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
