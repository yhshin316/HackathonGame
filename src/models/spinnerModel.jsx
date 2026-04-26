import atkIcon from '../assets/attackAbility.jpeg';
import defendIcon from '../assets/shieldAbility.jpeg';
import healIcon from '../assets/healAbility.png';

export const spinnerData = [
    { img: atkIcon, mult: 0.5, type: 'atk' },
    { img: atkIcon, mult: 1.0, type: 'atk' },
    { img: atkIcon, mult: 1.5, type: 'atk' },
    { img: defendIcon, mult: 1.25, type: 'def' },
    { img: defendIcon, mult: 1.5, type: 'def' },
    { img: defendIcon, mult: 2.0, type: 'def' },
    { img: healIcon, mult: 0.5, type: 'heal' },
    { img: healIcon, mult: 1.0, type: 'heal' },
    { img: healIcon, mult: 1.5, type: 'heal' }
];