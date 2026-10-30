import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const memoryGoals = new Map();

function formatGoal(row) {
  const target = Number(row.target_amount ?? row.target);
  const saved = Number(row.saved_amount ?? row.saved ?? 0);
  const remaining = Math.max(0, Math.round((target - saved) * 100) / 100);
  const percentage = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  // Monthly required pacing
  const now = new Date();
  const deadlineDate = new Date(row.deadline);
  const monthsDiff = Math.max(
    1,
    (deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth())
  );
  const monthlyPacing = Math.round((remaining / monthsDiff) * 100) / 100;

  return {
    id: row.id,
    name: row.name,
    target,
    saved,
    remaining,
    percentage,
    monthlyPacing,
    deadline: typeof row.deadline === 'string' ? row.deadline.slice(0, 10) : new Date(row.deadline).toISOString().slice(0, 10),
    color: row.color || '#2dd4bf',
    createdAt: row.created_at,
  };
}

export const listGoals = async (userId) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryGoals.get(userId) || [];
    return list.map(formatGoal);
  }

  const { data, error } = await supabaseAdmin
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('deadline', { ascending: true });

  if (error) throw error;
  return data.map(formatGoal);
};

export const createGoal = async (userId, input) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryGoals.get(userId) || [];
    const newGoal = {
      id: crypto.randomUUID(),
      name: input.name,
      target: Number(input.target),
      saved: Number(input.saved || 0),
      deadline: input.deadline,
      color: input.color || '#2dd4bf',
      created_at: new Date().toISOString(),
    };
    memoryGoals.set(userId, [...list, newGoal]);
    return formatGoal(newGoal);
  }

  const { data, error } = await supabaseAdmin
    .from('goals')
    .insert({
      user_id: userId,
      name: input.name,
      target_amount: input.target,
      saved_amount: input.saved || 0,
      deadline: input.deadline,
      color: input.color || '#2dd4bf',
    })
    .select()
    .single();

  if (error) throw error;
  return formatGoal(data);
};

export const updateGoal = async (userId, id, input) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryGoals.get(userId) || [];
    const index = list.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    const updated = { ...list[index], ...input };
    if (input.target !== undefined) updated.target = Number(input.target);
    if (input.saved !== undefined) updated.saved = Number(input.saved);
    list[index] = updated;
    memoryGoals.set(userId, list);
    return formatGoal(updated);
  }

  const patch = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.target !== undefined) patch.target_amount = input.target;
  if (input.saved !== undefined) patch.saved_amount = input.saved;
  if (input.deadline !== undefined) patch.deadline = input.deadline;
  if (input.color !== undefined) patch.color = input.color;

  const { data, error } = await supabaseAdmin
    .from('goals')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) throw new Error('Goal not found or unauthorized');
  return formatGoal(data);
};

export const deleteGoal = async (userId, id) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryGoals.get(userId) || [];
    memoryGoals.set(userId, list.filter((g) => g.id !== id));
    return { success: true };
  }

  const { error } = await supabaseAdmin
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
};

export const contributeToGoal = async (userId, id, amount) => {
  const contribution = Number(amount);
  if (contribution <= 0) throw new Error('Contribution must be greater than zero');

  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryGoals.get(userId) || [];
    const index = list.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    const goal = list[index];
    const newSaved = Math.min(goal.target, Math.round((goal.saved + contribution) * 100) / 100);
    goal.saved = newSaved;
    list[index] = goal;
    memoryGoals.set(userId, list);
    return formatGoal(goal);
  }

  // Fetch current goal
  const { data: goal, error: fetchErr } = await supabaseAdmin
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !goal) throw new Error('Goal not found');

  const currentSaved = Number(goal.saved_amount);
  const target = Number(goal.target_amount);
  const newSaved = Math.min(target, Math.round((currentSaved + contribution) * 100) / 100);

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('goals')
    .update({ saved_amount: newSaved })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (updateErr) throw updateErr;
  return formatGoal(updated);
};

export const seedMemoryGoals = (userId, goals) => {
  memoryGoals.set(userId, goals);
};

