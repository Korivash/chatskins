/** Build a user-facing model for an OAuth return without exposing credentials. */
export function authBannerModel(result, kind = 'twitch') {
  if (!result?.handled) return null;
  if (result.rewardSetup) return rewardSetupBannerModel(result.rewardSetup);
  if (result.error) return {status: 'error', message: result.error, retry: true};
  const login = String(result.login || result.identity?.login || '').trim();
  if (!login) return {status: 'error', message: 'Twitch did not return an account name. Please try again.', retry: true};
  if (kind === 'twitch') return {status: 'success', message: `Connected as ${login}. Your channel is filled in.`, retry: false};
  const points = String(result.action || '').startsWith('connect-chat-play') || result.action === 'create-chat-play-rewards';
  return {status: 'success', message: `${points ? 'Channel points' : 'Alerts'} connected for ${login}.`, retry: false};
}

export function rewardSetupBannerModel(result) {
  if (!result?.ok) return {status: 'error', message: result?.error || 'Could not set up channel-point rewards.', retry: true};
  const created = result.created || [], reused = result.reused || [], disabled = result.disabledExisting || [];
  const titles = [...created, ...reused].map(item => item.title).filter(Boolean);
  const createdText=`${created.length} reward${created.length===1?'':'s'} created ${result.requestedEnabled?'and turned on':'and left turned off as requested'}`;
  if (disabled.length) return {status: 'success', message: `${createdText}. ${disabled.length} existing reward${disabled.length===1?' is':'s are'} turned off: ${disabled.map(item=>item.title).join(', ')}.`, retry: false, action: 'Turn them on'};
  const reusedText=reused.length?`; ${reused.length} matching reward${reused.length===1?' was':'s were'} reused${result.requestedEnabled?' and are turned on':''}`:'';
  if (!result.requestedEnabled) return {status: 'success', message: `${createdText}${reusedText}${titles.length?`: ${titles.join(', ')}`:''}.`, retry: false};
  if (!created.length) return {status: 'success', message: `${reused.length} matching reward${reused.length===1?' already exists':'s already exist'} and ${reused.length===1?'is':'are'} turned on${titles.length?`: ${titles.join(', ')}`:''}.`, retry: false};
  return {status: 'success', message: `${createdText}${reusedText}${titles.length?`: ${titles.join(', ')}`:''}.`, retry: false};
}

/** Render an accessible, dismissible toast using text nodes only. */
export function showAuthBanner({document: doc = globalThis.document, result, kind = 'twitch', retry, action, setTimer = globalThis.setTimeout, duration = 10000} = {}) {
  const model = authBannerModel(result, kind);
  if (!model || !doc?.createElement) return null;
  doc.querySelector?.('[data-auth-toast]')?.remove?.();
  const toast = doc.createElement('section');
  toast.className = `auth-toast auth-toast-${model.status}`;
  toast.dataset.authToast = '';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  const message = doc.createElement('p');
  message.className = 'auth-toast-message';
  message.textContent = model.message;
  const actions = doc.createElement('div');
  actions.className = 'auth-toast-actions';
  if (model.retry) {
    const again = doc.createElement('button');
    again.type = 'button';
    again.className = 'site-button primary';
    again.textContent = 'Try again';
    again.addEventListener('click', () => retry?.());
    actions.append(again);
  }
  if (model.action && action) {
    const actionButton = doc.createElement('button');
    actionButton.type = 'button';
    actionButton.className = 'site-button primary';
    actionButton.textContent = model.action;
    actionButton.addEventListener('click', () => action());
    actions.append(actionButton);
  }
  const dismiss = doc.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'auth-toast-dismiss';
  dismiss.setAttribute('aria-label', 'Dismiss connection message');
  dismiss.textContent = 'Dismiss';
  dismiss.addEventListener('click', () => toast.remove());
  actions.append(dismiss);
  toast.append(message, actions);
  (doc.body || doc.documentElement).append(toast);
  setTimer(() => toast.remove(), Math.max(8000, Number(duration) || 10000));
  return toast;
}

/** Return focus to the control/section saved before the OAuth redirect. */
export function restoreEditorReturnTarget({document: doc = globalThis.document, target = ''} = {}) {
  if (!target || !doc?.querySelector) return null;
  let element = null;
  try { element = doc.querySelector(target); } catch { return null; }
  if (!element) return null;
  element.scrollIntoView?.({behavior: 'smooth', block: 'center'});
  if (!element.matches?.('button,input,select,textarea,a,[tabindex]')) element.setAttribute?.('tabindex', '-1');
  element.focus?.({preventScroll: true});
  return element;
}
