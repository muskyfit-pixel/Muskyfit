import { FoodItem, Client } from './types';

export const FOOD_DATABASE: FoodItem[] = [
  { id: 'f1', name: 'Chapati (plain)', calories: 119, protein: 3, carbs: 20, fats: 3, type: 'INDIAN', servingSize: '1 chapati', suitableMeals: ['BREAKFAST', 'LUNCH', 'DINNER'] },
  { id: 'f2', name: 'Basmati rice (cooked)', calories: 225, protein: 4, carbs: 50, fats: 1, type: 'WESTERN', servingSize: '1 bowl (250g)', suitableMeals: ['LUNCH', 'DINNER'] },
  { id: 'f3', name: 'Chicken breast (cooked)', calories: 185, protein: 35, carbs: 0, fats: 5, type: 'WESTERN', servingSize: '150g', suitableMeals: ['LUNCH', 'DINNER'] },
  { id: 'f4', name: 'Paneer (regular)', calories: 276, protein: 18, carbs: 6, fats: 20, type: 'INDIAN', servingSize: '150g', suitableMeals: ['LUNCH', 'DINNER'] },
  { id: 'f5', name: 'Whey shake', calories: 130, protein: 25, carbs: 3, fats: 2, type: 'DRINK', servingSize: '1 shake', suitableMeals: ['BREAKFAST', 'SNACKS'] },
  { id: 'f6', name: 'Makhana (Roasted)', calories: 110, protein: 3, carbs: 22, fats: 0, type: 'SNACKS', servingSize: '30g', suitableMeals: ['SNACKS'] },
];

export const MOCK_CLIENTS: Client[] = [];
