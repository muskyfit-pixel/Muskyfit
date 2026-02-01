
export type UserRole = 'COACH' | 'CLIENT';
export type PlanStatus = 'NONE' | 'CONSULTATION_SUBMITTED' | 'PLAN_READY';
export type MealCategory = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface WeeklyCheckIn {
  date: string;
  energyLevel: number;
  stressLevel: number;
  sleepHours: number;
  digestionStatus: string;
  clientComments: string;
  coachFeedback?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  url: string;
  type: 'FRONT' | 'SIDE' | 'BACK';
  weight: number;
}

export interface VaultArticle {
  id: string;
  title: string;
  category: 'NUTRITION' | 'TRAINING' | 'MINDSET' | 'BIO-HACKING';
  summary: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface IntakeData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  weight: number; 
  height: number;
  heartCondition: boolean;
  chestPainActivity: boolean;
  chestPainRest: boolean;
  dizzinessLossBalance: boolean;
  boneJointProblem: boolean;
  bloodPressureMedication: boolean;
  otherReasonNoExercise: boolean;
  pregnant: boolean;
  chronicCondition: boolean;
  currentMedications: string;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  jobType: 'Desk' | 'Active' | 'Physical Labour';
  sleepQuality: 'Poor' | 'Average' | 'Good';
  stressLevel: 'Low' | 'Moderate' | 'High';
  trainingDaysPerWeek: number;
  goal: 'FAT_LOSS' | 'MUSCLE_GAIN' | 'STRENGTH' | 'ATHLETIC_PERFORMANCE';
  dietPreference: 'NON_VEG' | 'VEGETARIAN' | 'VEGAN' | 'PESCATARIAN';
  culturalPreference: 'INDIAN' | 'WESTERN' | 'MIXED';
  religiousExclusions: string; 
  allergies: string;
  injuries: string;
  trainingHistory: string;
}

export type FoodCategory = 'INDIAN' | 'WESTERN' | 'SNACKS' | 'ALCOHOL' | 'DRINK' | 'DAIRY';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: FoodCategory;
  servingSize: string;
  suitableMeals?: MealCategory[];
  instructions?: string;
}

export interface LoggedFood extends FoodItem {
  logId: number;
  category: MealCategory;
}

export interface MacroSplit {
  calories: number;
  p: number;
  c: number;
  f: number;
}

export interface Meal {
  mealType: string;
  name: string;
  ingredients: string[];
  instructions: string;
  macros: MacroSplit;
  substitutes: string[];
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  targetRpe: number;
  tempo: string;
  notes: string;
  videoUrl?: string;
  isWarmup?: boolean;
}

export interface WorkoutDay {
  id: string;
  day: string;
  title: string;
  exercises: WorkoutExercise[];
}

export interface SetLog {
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface DailyLog {
  date: string;
  steps: number;
  water: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatsConsumed: number;
  workoutCompleted: boolean;
  workoutId?: string;
  foods?: LoggedFood[];
  exerciseLogs?: ExerciseLog[];
  readinessScore?: number;
  rituals?: {
    mobility: boolean;
    supplements: boolean;
    morningSunlight: boolean;
    noPhoneBeforeBed: boolean;
  };
}

export interface Client {
  id: string;
  profile: UserProfile;
  intake?: IntakeData;
  planStatus: PlanStatus;
  currentWorkoutIndex: number;
  exerciseProgress: Record<string, number>;
  plan?: {
    trainingDayMacros: MacroSplit;
    restDayMacros: MacroSplit;
    mealPlan: Meal[];
    workoutSplit: WorkoutDay[];
    coachAdvice: string;
  };
  logs: DailyLog[];
  checkIns: WeeklyCheckIn[];
  photos: ProgressPhoto[];
  performanceStatus: 'ON_TRACK' | 'STRUGGLING' | 'OFF_TRACK';
}
