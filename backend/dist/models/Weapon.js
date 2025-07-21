"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponSystem = exports.ALL_WEAPONS = exports.dcWeapons = exports.marvelWeapons = exports.WeaponType = void 0;
var WeaponType;
(function (WeaponType) {
    WeaponType["MARVEL"] = "marvel";
    WeaponType["DC"] = "dc";
})(WeaponType || (exports.WeaponType = WeaponType = {}));
exports.marvelWeapons = [
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
exports.dcWeapons = [
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
exports.ALL_WEAPONS = [...exports.marvelWeapons, ...exports.dcWeapons];
class WeaponSystem {
    static getWeaponsByType(type) {
        return type === WeaponType.MARVEL ? exports.marvelWeapons : exports.dcWeapons;
    }
    static getWeaponById(id) {
        return exports.ALL_WEAPONS.find(weapon => weapon.id === id);
    }
    static getRandomWeapon(type) {
        const weapons = this.getWeaponsByType(type);
        return weapons[Math.floor(Math.random() * weapons.length)];
    }
    static getAllWeapons() {
        return exports.ALL_WEAPONS;
    }
}
exports.WeaponSystem = WeaponSystem;
//# sourceMappingURL=Weapon.js.map