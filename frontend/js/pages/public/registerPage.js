import { ApiClient } from '../../api.js';
import { store } from '../../state.js';
import { Toast } from '../../components/toast.js';
import { initSocketClient } from '../../socket.js';

export class RegisterPage {
  static render(container) {
    container.innerHTML = `
      <div class="py-12 px-4 flex items-center justify-center min-h-[calc(100vh-140px)]">
        <div class="glass-panel p-8 rounded-3xl border border-slate-800 max-w-lg w-full shadow-2xl space-y-6">
          <div class="text-center">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-500/30">
              <i data-lucide="user-plus" class="w-6 h-6"></i>
            </div>
            <h2 class="text-2xl font-extrabold text-white">Join Servora</h2>
            <p class="text-xs text-slate-400 mt-1">Create an account to book verified services or offer your expertise</p>
          </div>

          <!-- Role Selector -->
          <div class="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              id="role-btn-customer"
              onclick="window.selectRegisterRole('CUSTOMER')"
              class="py-2.5 rounded-xl bg-sky-500 text-white shadow-md transition flex items-center justify-center space-x-2"
            >
              <i data-lucide="user" class="w-4 h-4"></i>
              <span>Customer</span>
            </button>
            <button
              type="button"
              id="role-btn-provider"
              onclick="window.selectRegisterRole('PROVIDER')"
              class="py-2.5 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center space-x-2"
            >
              <i data-lucide="briefcase" class="w-4 h-4"></i>
              <span>Service Provider</span>
            </button>
          </div>

          <!-- Register Form -->
          <form id="register-form" onsubmit="window.handleRegisterSubmit(event)" class="space-y-4 text-xs">
            <input type="hidden" id="reg-role" value="CUSTOMER" />

            <!-- Profile Avatar Picker -->
            <div class="flex items-center space-x-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div class="relative group w-14 h-14 shrink-0">
                <img
                  id="reg-avatar-preview"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                  class="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/30 shadow-md"
                />
                <label for="reg-avatar-file" class="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white">
                  <i data-lucide="camera" class="w-4 h-4"></i>
                </label>
                <input type="file" id="reg-avatar-file" accept="image/*" class="hidden" onchange="window.handleRegisterAvatarSelect(event)" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Profile Photo (Optional)</label>
                <label for="reg-avatar-file" class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-semibold cursor-pointer transition">
                  <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                  <span>Choose Photo</span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Full Name *</label>
                <input id="reg-name" type="text" placeholder="John Doe" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                <input id="reg-phone" type="text" placeholder="+92 300 1234567" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Email Address *</label>
              <input id="reg-email" type="email" placeholder="name@domain.com" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">City *</label>
                <input id="reg-city" type="text" placeholder="Lahore, Karachi, Islamabad" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Password *</label>
                <div class="relative">
                  <input id="reg-password" type="password" placeholder="Min. 6 characters" minlength="6" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs pr-10" />
                  <button type="button" onclick="window.toggleRegisterPasswordVisibility()" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition" title="Toggle password visibility">
                    <i id="reg-eye-icon" data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Provider Specific Fields -->
            <div id="provider-extra-fields" class="hidden space-y-4 pt-3 border-t border-slate-800">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Professional Bio / Specialty *</label>
                <textarea id="reg-bio" rows="2" placeholder="Describe your experience, certifications, and specialty..." class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-300 mb-1.5">Experience (Years)</label>
                  <input id="reg-exp" type="number" min="0" value="3" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-300 mb-1.5">Service Areas (comma-separated)</label>
                  <input id="reg-areas" type="text" placeholder="DHA, Gulberg, Model Town" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition transform active:scale-98"
            >
              Create Account
            </button>
          </form>

          <div class="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Already have an account?
            <a href="#/login" class="text-sky-400 font-semibold hover:text-sky-300 ml-1">Sign In</a>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.handleRegisterAvatarSelect = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      RegisterPage._selectedAvatarFile = file;
      const preview = document.getElementById('reg-avatar-preview');
      if (preview) {
        preview.src = URL.createObjectURL(file);
      }
    };

    window.toggleRegisterPasswordVisibility = () => {
      const input = document.getElementById('reg-password');
      const icon = document.getElementById('reg-eye-icon');
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

    window.selectRegisterRole = (role) => {
      const customerBtn = document.getElementById('role-btn-customer');
      const providerBtn = document.getElementById('role-btn-provider');
      const extraFields = document.getElementById('provider-extra-fields');
      const roleInput = document.getElementById('reg-role');

      if (role === 'PROVIDER') {
        roleInput.value = 'PROVIDER';
        customerBtn.className = 'py-2.5 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center space-x-2';
        providerBtn.className = 'py-2.5 rounded-xl bg-emerald-500 text-white shadow-md transition flex items-center justify-center space-x-2';
        extraFields.classList.remove('hidden');
      } else {
        roleInput.value = 'CUSTOMER';
        customerBtn.className = 'py-2.5 rounded-xl bg-sky-500 text-white shadow-md transition flex items-center justify-center space-x-2';
        providerBtn.className = 'py-2.5 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center space-x-2';
        extraFields.classList.add('hidden');
      }
    };

    window.handleRegisterSubmit = async (event) => {
      event.preventDefault();
      const submitBtn = document.getElementById('register-submit-btn');
      const role = document.getElementById('reg-role').value;
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const phone = document.getElementById('reg-phone').value;
      const city = document.getElementById('reg-city').value;
      const password = document.getElementById('reg-password').value;

      const payload = {
        name,
        email,
        phone,
        password,
        role,
        address: { city }
      };

      if (role === 'PROVIDER') {
        payload.bio = document.getElementById('reg-bio')?.value || '';
        payload.experienceYears = parseInt(document.getElementById('reg-exp')?.value || '0', 10);
        const areasRaw = document.getElementById('reg-areas')?.value || '';
        payload.serviceAreas = areasRaw.split(',').map((a) => a.trim()).filter(Boolean);
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Creating Account...';
      }

      try {
        const res = await ApiClient.post('/auth/register', payload);
        let { user, token } = res.data || {};

        store.setUser(user, token);
        initSocketClient();

        // If avatar file was chosen, upload it now
        if (RegisterPage._selectedAvatarFile) {
          try {
            const formData = new FormData();
            formData.append('avatar', RegisterPage._selectedAvatarFile);
            const avatarRes = await ApiClient.put('/users/profile', formData);
            if (avatarRes.data?.user) {
              user = avatarRes.data.user;
              store.setUser(user, token);
            }
          } catch (_) {}
        }

        Toast.success(`Welcome to Servora, ${user.name}!`, 'Registration Complete');

        if (user.role === 'PROVIDER') {
          window.location.hash = '#/provider/dashboard';
        } else {
          window.location.hash = '#/customer/dashboard';
        }
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Create Account';
        }
      }
    };
  }
}
