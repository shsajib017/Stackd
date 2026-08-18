import { useCallback, useState } from 'react';
import {
  calculateBMI,
  calculateTDEE,
  getBMICategory,
  getCalorieTarget,
  getDietRecommendation,
  getMacroSplit,
} from '../utils/bmiFormulas';
import { updateProfile } from '../supabase/profiles';
import useAuthStore from '../store/useAuthStore';

/**
 * Body mass index, nutrition target calculation, and profile update hook.
 */
export const useBMI = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);

  const [bmi, setBmi] = useState(profile?.bmi || 0);
  const [category, setCategory] = useState(profile?.bmi_category || '');
  const [calorieTarget, setCalorieTarget] = useState(profile?.calorie_target || 2000);
  const [macroSplit, setMacroSplit] = useState(
    profile?.goal ? getMacroSplit(profile.goal) : { protein: 25, carbs: 50, fat: 25 }
  );
  const [dietRecommendation, setDietRecommendation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const calculate = useCallback(
    async ({ weightKg, heightCm, age = 21, gender = 'male', activityLevel = 'Sedentary', goal = 'Maintain' }) => {
      const calculatedBmi = calculateBMI(Number(weightKg), Number(heightCm));
      const calculatedCategory = getBMICategory(calculatedBmi);
      const tdee = calculateTDEE(Number(weightKg), Number(heightCm), Number(age), gender, activityLevel);
      const targetCal = getCalorieTarget(tdee, goal);
      const macros = getMacroSplit(goal);
      const recommendation = getDietRecommendation(calculatedBmi);

      setBmi(calculatedBmi);
      setCategory(calculatedCategory);
      setCalorieTarget(targetCal);
      setMacroSplit(macros);
      setDietRecommendation(recommendation);

      if (user?.id) {
        try {
          setIsSaving(true);
          const updated = await updateProfile(user.id, {
            weight: Number(weightKg),
            height: Number(heightCm),
            bmi: calculatedBmi,
            bmi_category: calculatedCategory,
            calorie_target: targetCal,
            goal_type: goal,
          });
          setProfile(updated);
        } catch {
          // Saving profile failed
        } finally {
          setIsSaving(false);
        }
      }

      return {
        bmi: calculatedBmi,
        category: calculatedCategory,
        calorieTarget: targetCal,
        macroSplit: macros,
        dietRecommendation: recommendation,
      };
    },
    [setProfile, user?.id]
  );

  return {
    calculate,
    bmi,
    category,
    calorieTarget,
    macroSplit,
    dietRecommendation,
    isSaving,
  };
};

export default useBMI;
