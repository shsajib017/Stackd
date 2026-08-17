import supabase from './config';

const TABLE = 'income';

const getMonthRange = (year, month) => {
  const y = Number(year);
  const m = Number(month);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

/** @returns {Promise<Array>} Filtered income records ordered by date desc. */
export const getIncome = async (userId, filters = {}) => {
  try {
    let query = supabase.from(TABLE).select('*').eq('user_id', userId);
    if (filters.source) query = query.eq('source', filters.source);
    if (filters.startDate) query = query.gte('date', filters.startDate);
    if (filters.endDate) query = query.lte('date', filters.endDate);
    if (filters.search) query = query.ilike('note', `%${filters.search}%`);
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch income: ${err.message}`);
  }
};

/** @returns {Promise<Array>} Income records for the given month. */
export const getIncomeByMonth = async (userId, year, month) => {
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
    throw new Error(`Failed to fetch monthly income: ${err.message}`);
  }
};

/** @returns {Promise<object>} Newly created income row. */
export const addIncome = async (userId, data) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE).insert({ user_id: userId, ...data }).select().single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add income: ${err.message}`);
  }
};

/** @returns {Promise<object>} Updated income row. */
export const updateIncome = async (incomeId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', incomeId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update income: ${err.message}`);
  }
};

/** @returns {Promise<void>} */
export const deleteIncome = async (incomeId) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', incomeId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete income: ${err.message}`);
  }
};

/** @returns {Promise<number>} Total income for the month. */
export const getMonthlyIncomeTotal = async (userId, year, month) => {
  try {
    const { start, end } = getMonthRange(year, month);
    const { data, error } = await supabase
      .from(TABLE).select('amount').eq('user_id', userId)
      .gte('date', start).lte('date', end);
    if (error) throw error;
    return (data || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  } catch (err) {
    throw new Error(`Failed to get monthly income total: ${err.message}`);
  }
};
