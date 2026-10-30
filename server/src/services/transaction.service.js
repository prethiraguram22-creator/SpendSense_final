import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// In-memory store fallback for demo mode or offline test suite
const memoryTransactions = new Map();

function formatTx(row) {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    categoryId: row.category_id,
    description: row.description,
    date: typeof row.date === 'string' ? row.date.slice(0, 10) : new Date(row.date).toISOString().slice(0, 10),
    createdAt: new Date(row.created_at).getTime(),
  };
}

export const listTransactions = async (userId, query = {}) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    let list = memoryTransactions.get(userId) || [];
    if (query.type) list = list.filter((t) => t.type === query.type);
    if (query.categoryId) list = list.filter((t) => t.categoryId === query.categoryId);
    if (query.startDate) list = list.filter((t) => t.date >= query.startDate);
    if (query.endDate) list = list.filter((t) => t.date <= query.endDate);
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter((t) => t.description.toLowerCase().includes(q));
    }
    const sortField = query.sort === 'amount' ? 'amount' : 'date';
    list.sort((a, b) => (query.order === 'asc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField]));
    return list;
  }

  let dbQuery = supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  if (query.type) dbQuery = dbQuery.eq('type', query.type);
  if (query.categoryId) dbQuery = dbQuery.eq('category_id', query.categoryId);
  if (query.startDate) dbQuery = dbQuery.gte('date', query.startDate);
  if (query.endDate) dbQuery = dbQuery.lte('date', query.endDate);
  if (query.search) dbQuery = dbQuery.ilike('description', `%${query.search}%`);

  const sortColumn = query.sort === 'amount' ? 'amount' : 'date';
  dbQuery = dbQuery.order(sortColumn, { ascending: query.order === 'asc' });

  if (query.limit) dbQuery = dbQuery.limit(query.limit);
  if (query.offset) dbQuery = dbQuery.range(query.offset, query.offset + query.limit - 1);

  const { data, error } = await dbQuery;
  if (error) throw error;

  return data.map(formatTx);
};

export const createTransaction = async (userId, input) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryTransactions.get(userId) || [];
    const newTx = {
      id: crypto.randomUUID(),
      type: input.type,
      amount: Number(input.amount),
      categoryId: input.categoryId,
      description: input.description,
      date: input.date,
      createdAt: Date.now(),
    };
    memoryTransactions.set(userId, [newTx, ...list]);
    return newTx;
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: userId,
      type: input.type,
      amount: input.amount,
      category_id: input.categoryId,
      description: input.description,
      date: input.date,
    })
    .select()
    .single();

  if (error) throw error;
  return formatTx(data);
};

export const getTransactionById = async (userId, id) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryTransactions.get(userId) || [];
    const found = list.find((t) => t.id === id);
    if (!found) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }
    return found;
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }
  return formatTx(data);
};

export const updateTransaction = async (userId, id, input) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryTransactions.get(userId) || [];
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    const updated = { ...list[index], ...input };
    if (input.amount) updated.amount = Number(input.amount);
    list[index] = updated;
    memoryTransactions.set(userId, list);
    return updated;
  }

  const patch = {};
  if (input.type) patch.type = input.type;
  if (input.amount !== undefined) patch.amount = input.amount;
  if (input.categoryId) patch.category_id = input.categoryId;
  if (input.description) patch.description = input.description;
  if (input.date) patch.date = input.date;

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) throw new Error('Transaction not found or unauthorized');
  return formatTx(data);
};

export const deleteTransaction = async (userId, id) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryTransactions.get(userId) || [];
    const filtered = list.filter((t) => t.id !== id);
    memoryTransactions.set(userId, filtered);
    return { success: true };
  }

  const { error } = await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
};

export const seedMemoryTransactions = (userId, transactions) => {
  memoryTransactions.set(userId, transactions);
};
