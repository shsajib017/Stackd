import supabase from './config';

const TABLE = 'expenses';

const getMonthRange = (year, month) => {
  const y = Number(year);
  const m = Number(month);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

/** @returns {Promise<Array>} Filtered expenses ordered by date desc. */
export const getExpenses = async (userId, filters = {}) => {
  try {
    let query = supabase.from(TABLE).select('*').eq('user_id', userId);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.startDate) query = query.gte('date', filters.startDate);
    if (filters.endDate) query = query.lte('date', filters.endDate);
    if (filters.search) query = query.ilike('note', `%${filters.search}%`);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch expenses: ${err.message}`);
  }
};

/** @returns {Promise<Array>} Expenses for the given month. */
export const getExpensesByMonth = async (userId, year, month) => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId)
      .gte('date', startDate).lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch monthly expenses: ${err.message}`);
  }
};

/** @returns {Promise<object>} Newly created expense row. */
export const addExpense = async (userId, data) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE).insert({ user_id: userId, ...data }).select().single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add expense: ${err.message}`);
  }
};

/** @returns {Promise<object>} Updated expense row. */
export const updateExpense = async (expenseId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', expenseId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update expense: ${err.message}`);
  }
};

/** @returns {Promise<void>} */
export const deleteExpense = async (expenseId) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', expenseId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete expense: ${err.message}`);
  }
};

/** @returns {Promise<number>} Total spending for the month. */
export const getMonthlyTotal = async (userId, year, month) => {
  try {
    const { start, end } = getMonthRange(year, month);
    const { data, error } = await supabase
      .from(TABLE).select('amount').eq('user_id', userId)
      .gte('date', start).lte('date', end);
    if (error) throw error;
    return (data || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  } catch (err) {
    throw new Error(`Failed to get monthly total: ${err.message}`);
  }
};

/** @returns {Promise<object>} Object mapping category to total amount. */
export const getCategoryTotals = async (userId, year, month) => {
  try {
    const { start, end } = getMonthRange(year, month);
    const { data, error } = await supabase
      .from(TABLE).select('amount, category').eq('user_id', userId)
      .gte('date', start).lte('date', end);
    if (error) throw error;
    return (data || []).reduce((acc, row) => {
      const cat = row.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(row.amount) || 0);
      return acc;
    }, {});
  } catch (err) {
    throw new Error(`Failed to get category totals: ${err.message}`);
  }
};
