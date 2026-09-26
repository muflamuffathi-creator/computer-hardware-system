export const confirmAction = (message) => {
  return new Promise((resolve) => {
    try {
      // If a ConfirmProvider is mounted it sets window.__hasConfirmProvider = true
      if (window.__hasConfirmProvider) {
        // dispatch event with resolver function for the provider to call
        window.dispatchEvent(new CustomEvent('app:confirm', { detail: { message, resolve } }));
      } else {
        // fallback to native confirm
        resolve(window.confirm(message));
      }
    } catch (e) {
      resolve(false);
    }
  });
};

export default confirmAction;
