import { create } from 'zustand';

/**
 * Global UI state store for modals and toast notifications.
 */
export const useUIStore = create((set) => ({
  activeModal: null,
  toastMessage: null,
  toastType: null,

  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),

  showToast: (message, type = 'info') =>
    set({ toastMessage: message, toastType: type }),
  hideToast: () =>
    set({ toastMessage: null, toastType: null }),
}));

export default useUIStore;
