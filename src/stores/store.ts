import Accessor from "@arcgis/core/core/Accessor";
import { subclass, property } from "@arcgis/core/core/accessorSupport/decorators";

@subclass('stores.Store')
export default class Store extends Accessor {

  // TODO: Check if property can be initialized normally after moving to Lumina
  @property({ value: 0 })
  declare clicks: number

  @property({ value: 0 })
  declare seconds: number

  @property({ value: 0 })
  declare squaredClicks: number
}
