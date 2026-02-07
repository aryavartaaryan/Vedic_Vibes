import { recipes } from '@/data/recipes';
import { regions } from '@/data/regions';
import { Recipe, Region } from '@/lib/types';
import { generateFusionRecipes } from '@/lib/smart-chef';

export function getAllRecipes(): Recipe[] {
    return recipes;
}

export function getAllRegions(): Region[] {
    return regions;
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
    return recipes.find((recipe) => recipe.slug === slug);
}

export function getRecipesByRegion(regionId: string): Recipe[] {
    // STRICT FILTERING: Normalize both strings to lowercase and check strict equality or inclusion
    // Fixes "Issue #1: Duplicate Recipes Across All Regions"
    if (!regionId) return [];

    const targetRegion = regions.find(r => r.id === regionId);
    if (!targetRegion) return [];

    const getStr = (field: any) => {
        if (typeof field === 'string') return field;
        return field?.en || field?.hi || '';
    };

    return recipes.filter((recipe) =>
        getStr(recipe.region).toLowerCase() === targetRegion.name.toLowerCase()
    );
}

export function getFeaturedRecipes(): Recipe[] {
    return recipes.filter((recipe) => recipe.isFeatured);
}

export function searchRecipes(query: string): Recipe[] {
    const lowerQuery = query.toLowerCase();
    const getStr = (field: any) => {
        if (typeof field === 'string') return field;
        return field?.en || field?.hi || '';
    };

    return recipes.filter((recipe) =>
        getStr(recipe.title).toLowerCase().includes(lowerQuery) ||
        recipe.ingredients.some(ing => getStr(ing.name).toLowerCase().includes(lowerQuery)) ||
        getStr(recipe.description).toLowerCase().includes(lowerQuery)
    );
}

export function findRecipesByIngredients(ingredients: string[]): { matches: Recipe[], generated: Recipe[] } {
    if (ingredients.length === 0) return { matches: [], generated: [] };

    // 1. Find Database Matches
    const getStr = (field: any) => {
        if (typeof field === 'string') return field;
        return field?.en || field?.hi || '';
    };

    const scoredRecipes = recipes.map(recipe => {
        const matchCount = ingredients.reduce((count, ing) => {
            const hasIngredient = recipe.ingredients.some(rIng =>
                getStr(rIng.name).toLowerCase().includes(ing.trim().toLowerCase())
            );
            return hasIngredient ? count + 1 : count;
        }, 0);

        return { recipe, matchCount };
    });

    const matches = scoredRecipes
        .filter(item => item.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .map(item => item.recipe);

    // 2. Generate AI Recipes if matches are low or just for fun
    const generated = generateFusionRecipes(ingredients);

    return { matches, generated };
}
