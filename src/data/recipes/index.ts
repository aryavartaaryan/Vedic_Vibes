import { northRecipes } from './north';
import { southRecipes } from './south';
import { eastRecipes } from './east';
import { westRecipes } from './west';
import { northeastRecipes } from './northeast';
import { centralRecipes } from './central';
import { coastalRecipes } from './coastal';
import { beverageRecipes } from './beverages';
import { Recipe } from '@/lib/types';

export const allRecipes: Recipe[] = [
    ...northRecipes,
    ...southRecipes,
    ...eastRecipes,
    ...westRecipes,
    ...northeastRecipes,
    ...centralRecipes,
    ...coastalRecipes,
    ...beverageRecipes
];
