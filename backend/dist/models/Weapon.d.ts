export declare enum WeaponType {
    MARVEL = "marvel",
    DC = "dc"
}
export interface Weapon {
    id: string;
    name: string;
    universe: 'Marvel' | 'DC';
    power: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    imageUrl: string;
}
export declare const marvelWeapons: Weapon[];
export declare const dcWeapons: Weapon[];
export declare const ALL_WEAPONS: Weapon[];
export declare class WeaponSystem {
    static getWeaponsByType(type: WeaponType): Weapon[];
    static getWeaponById(id: string): Weapon | undefined;
    static getRandomWeapon(type: WeaponType): Weapon;
    static getAllWeapons(): Weapon[];
}
//# sourceMappingURL=Weapon.d.ts.map