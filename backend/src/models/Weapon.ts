export enum WeaponType {
  MARVEL = 'marvel',
  DC = 'dc'
}

export interface Weapon {
  id: string;
  name: string;
  universe: 'Marvel' | 'DC';
  power: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
}

export const marvelWeapons: Weapon[] = [
  {
    id: 'mjolnir',
    name: 'Mjolnir',
    universe: 'Marvel',
    power: 95,
    rarity: 'legendary',
    imageUrl: 'https://img.icons8.com/color/96/thor-hammer.png'
  },
  {
    id: 'shield',
    name: "Captain America's Shield",
    universe: 'Marvel',
    power: 85,
    rarity: 'epic',
    imageUrl: 'https://img.icons8.com/color/96/captain-america.png'
  },
  {
    id: 'repulsors',
    name: 'Iron Man Repulsors',
    universe: 'Marvel',
    power: 88,
    rarity: 'epic',
    imageUrl: 'https://img.icons8.com/color/96/iron-man.png'
  },
  {
    id: 'claws',
    name: 'Adamantium Claws',
    universe: 'Marvel',
    power: 80,
    rarity: 'rare',
    imageUrl: 'https://img.icons8.com/color/96/wolverine.png'
  },
  {
    id: 'agamotto',
    name: 'Eye of Agamotto',
    universe: 'Marvel',
    power: 92,
    rarity: 'legendary',
    imageUrl: 'https://img.icons8.com/fluency/96/visible.png'
  }
];

export const dcWeapons: Weapon[] = [
  {
    id: 'lasso',
    name: 'Lasso of Truth',
    universe: 'DC',
    power: 90,
    rarity: 'legendary',
    imageUrl: 'https://img.icons8.com/color/96/wonder-woman.png'
  },
  {
    id: 'batarangs',
    name: 'Batarangs',
    universe: 'DC',
    power: 75,
    rarity: 'rare',
    imageUrl: 'https://img.icons8.com/color/96/batman.png'
  },
  {
    id: 'ring',
    name: 'Green Lantern Ring',
    universe: 'DC',
    power: 94,
    rarity: 'legendary',
    imageUrl: 'https://img.icons8.com/color/96/green-lantern.png'
  },
  {
    id: 'trident',
    name: "Aquaman's Trident",
    universe: 'DC',
    power: 87,
    rarity: 'epic',
    imageUrl: 'https://img.icons8.com/color/96/aquaman.png'
  },
  {
    id: 'heat_vision',
    name: 'Heat Vision',
    universe: 'DC',
    power: 89,
    rarity: 'epic',
    imageUrl: 'https://img.icons8.com/color/96/superman.png'
  }
];

export const ALL_WEAPONS: Weapon[] = [...marvelWeapons, ...dcWeapons];

export class WeaponSystem {
  static getWeaponsByType(type: WeaponType): Weapon[] {
    return type === WeaponType.MARVEL ? marvelWeapons : dcWeapons;
  }

  static getWeaponById(id: string): Weapon | undefined {
    return ALL_WEAPONS.find(weapon => weapon.id === id);
  }

  static getRandomWeapon(type: WeaponType): Weapon {
    const weapons = this.getWeaponsByType(type);
    return weapons[Math.floor(Math.random() * weapons.length)];
  }

  static getAllWeapons(): Weapon[] {
    return ALL_WEAPONS;
  }
} 