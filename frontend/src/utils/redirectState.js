const REDIRECT_STATE_KEY = 'appRedirectState';

export const saveRedirectState = (data) => {
  try {
    const normalized = normalizeRedirectState(data);
    if (!normalized.from && !normalized.builderState) {
      return;
    }
    sessionStorage.setItem(REDIRECT_STATE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn('Unable to persist redirect state', error);
  }
};

export const readRedirectState = () => {
  try {
    const raw = sessionStorage.getItem(REDIRECT_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('Unable to read redirect state', error);
    return {};
  }
};

export const clearRedirectState = () => {
  try {
    sessionStorage.removeItem(REDIRECT_STATE_KEY);
  } catch (error) {
    console.warn('Unable to clear redirect state', error);
  }
};

export const normalizeRedirectState = (state) => {
  if (!state || typeof state !== 'object') return {};
  const builderState = state.builderState ?? state.loadBuild;
  const normalized = { ...state, builderState };
  if (normalized.loadBuild) {
    delete normalized.loadBuild;
  }
  return normalized;
};

export const mergeRedirectState = (base, override) => {
  const baseObj = base && typeof base === 'object' ? base : {};
  const overrideObj = override && typeof override === 'object' ? override : {};
  return normalizeRedirectState({ ...baseObj, ...overrideObj });
};
