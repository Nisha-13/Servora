import { ApiClient } from '../../api.js';
import { store } from '../../state.js';
import { Toast } from '../../components/toast.js';
import { initSocketClient } from '../../socket.js';

export class LoginPage {
  static render(container) {
    container.innerHTML = `
      <div class="py-12 px-4 flex items-center justify-center min-h-[calc(100vh-140px)]">
        <div class="glass-panel p-8 rounded-3xl border border-slate-800 max-w-md w-full shadow-2xl space-y-6">
          <div class="text-center">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-500/30">
              <i data-lucide="lock" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl font-extrabold text-white">Welcome Back</h2>
            <p class="text-xs text-slate-400 mt-1">Sign in to your Servora account to manage bookings & services</p>
          </div>

          <!-- Login Form -->
          <form id="login-form" onsubmit="window.handleLoginSubmit(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Email Address *</label>
              <input id="login-email" type="email" placeholder="name@domain.com" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="font-semibold text-slate-300">Password *</label>
                <a href="#/contact" class="text-sky-400 hover:text-sky-300 text-[11px]">Forgot password?</a>
              </div>
              <div class="relative">
                <input id="login-password" type="password" placeholder="••••••••" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs pr-10" />
                <button type="button" onclick="window.togglePasswordVisibility('login-password', 'login-eye-icon')" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition" title="Toggle password visibility">
                  <i id="login-eye-icon" data-lucide="eye" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition transform active:scale-98"
            >
              Sign In
            </button>
          </form>

          <div class="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Don't have an account?
            <a href="#/register" class="text-sky-400 font-semibold hover:text-sky-300 ml-1">Create Account</a>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.togglePasswordVisibility = (inputId, iconId) => {
      const input = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      if (!input || !icon) return;

      if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
      } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
      }
      if (window.lucide) window.lucide.createIcons();
    };

    window.fillCredentials = (email, password) => {
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput && passInput) {
        emailInput.value = email;
        passInput.value = password;
      }
    };

    window.handleLoginSubmit = async (event) => {
      event.preventDefault();
      const submitBtn = document.getElementById('login-submit-btn');
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Signing In...';
      }

      try {
        const res = await ApiClient.post('/auth/login', { email, password });
        const { user, token } = res.data || {};

        store.setUser(user, token);
        initSocketClient();
        Toast.success(`Welcome back, ${user.name}!`, 'Logged In');

        // Route by role
        if (user.role === 'ADMIN') {
          window.location.hash = '#/admin/dashboard';
        } else if (user.role === 'PROVIDER') {
          window.location.hash = '#/provider/dashboard';
        } else {
          window.location.hash = '#/customer/dashboard';
        }
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In';
        }
      }
    };
  }
}
