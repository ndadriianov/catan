type Inventory = {
  clay: number;
  forrest: number;
  sheep: number;
  stone: number;
  wheat: number;
}

export function parseInventory(inventoryJSON: Inventory): Inventory {
  return {
    clay: inventoryJSON.clay,
    forrest: inventoryJSON.forrest,
    sheep: inventoryJSON.sheep,
    stone: inventoryJSON.stone,
    wheat: inventoryJSON.wheat
  };
}

export default Inventory;