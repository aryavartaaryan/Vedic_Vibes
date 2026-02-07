export type BilingualString = string | { hi: string, en: string };
export type BilingualList = string[] | { hi: string[], en: string[] };

export type RegionName = 'North India' | 'South India' | 'East India' | 'West India' | 'Northeast India' | 'Central India' | 'Coastal' | 'Fusion Kitchen';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert' | 'Beverage' | 'Side Dish';

export interface Ingredient {
    name: BilingualString;
    quantity: string;
    notes?: string;
    optional?: boolean;
    alternates?: string[];
}

export interface Mantra {
    sanskrit: string;
    transliteration: string;
    meaning: string;
    context: string;
}

export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
}

export interface Recipe {
    id: string;
    title: BilingualString;
    slug: string;
    region: BilingualString;
    state: BilingualString;
    description: BilingualString;
    heritageStory: BilingualString;
    images?: {
        hero: string;
        gallery?: string[];
    };
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    ingredients: Ingredient[];
    instructions: BilingualList;
    dietaryTags: string[];
    mealType: MealType[];
    mantra?: Mantra;
    nutrition?: NutritionInfo;
    rating: number;
    isFeatured?: boolean;
    sourceUrl?: string;
    isSattvic?: boolean;
    doshaEffect?: BilingualString;
}

export interface Region {
    id: string;
    name: string;
    description: string;
    image?: string;
}
