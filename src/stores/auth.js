import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // null means not logged in
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    login(userData) {
      // userData example: { name: "Andi Rizky", initials: "AR", role: "admin" }
      this.user = userData
    },
    logout() {
      this.user = null
    }
  }
})
