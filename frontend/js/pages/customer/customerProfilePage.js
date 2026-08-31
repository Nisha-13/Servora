import { ApiClient } from '../../api.js';
import { store } from '../../state.js';
import { Toast } from '../../components/toast.js';

export class CustomerProfilePage {
  static _selectedAvatarFile = null;

  static async render(container) {
    let user = store.user || {};
    try {
      const res = await ApiClient.get('/users/profile');
      if (res.data?.user) {
        user = res.data.user;
        store.setUser(user, store.token);
      }
    } catch (_) {}

    CustomerProfilePage._selectedAvatarFile = null;

    container.innerHTML = `
      <div class="py-6 sm:py-8 px-3 sm:px-4 lg:px-8 max-w-3xl mx-auto w-full space-y-6 overflow-hidden">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Profile</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Update your personal information, profile photo, and security preferences.</p>
        </div>

        <div class="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-6">
          <!-- Avatar Section with Upload Option -->
          <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-800">
            <div class="relative group w-24 h-24 shrink-0">
              <img
                id="profile-avatar-preview"
                src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop'}"
                class="w-24 h-24 rounded-3xl object-cover ring-4 ring-sky-500/30 shadow-xl"
                onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop'"
              />
              <label for="avatar-file-input" class="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-white">
                <i data-lucide="camera" class="w-6 h-6 mb-1"></i>
                <span class="text-[10px] font-bold">Change</span>
              </label>
              <input type="file" id="avatar-file-input" accept="image/*" class="hidden" onchange="window.handleAvatarSelect(event)" />
            </div>

            <div class="space-y-1.5 flex-grow">
              <div class="flex items-center space-x-2">
                <h2 class="text-xl font-extrabold text-white">${user.name}</h2>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">${user.role}</span>
              </div>
              <div class="text-xs text-slate-400">${user.email}</div>
              <div class="text-[11px] text-slate-500">Member since ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
              <div class="pt-1">
                <label for="avatar-file-input" class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold cursor-pointer transition">
                  <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                  <span>Upload New Photo</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Profile Details Form -->
          <form onsubmit="window.updateCustomerProfile(event)" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Full Name *</label>
                <input id="profile-name" type="text" value="${user.name || ''}" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Phone Number</label>
                <input id="profile-phone" type="text" value="${user.phone || ''}" placeholder="+92 300 1234567" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input type="email" value="${user.email || ''}" disabled class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs opacity-50 cursor-not-allowed" />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Street Address</label>
              <input id="profile-street" type="text" value="${user.address?.street || ''}" placeholder="House/Apartment, Street name" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">City</label>
                <input id="profile-city" type="text" value="${user.address?.city || ''}" placeholder="Lahore, Karachi, Islamabad" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Zip / Postal Code</label>
                <input id="profile-zip" type="text" value="${user.address?.zipCode || ''}" placeholder="54000" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" id="update-profile-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition">
                Save Profile Changes
              </button>
            </div>
          </form>

          <!-- Change Password Section with Eye Icons -->
          <div class="pt-6 border-t border-slate-800">
            <h3 class="font-bold text-white text-sm mb-4 flex items-center">
              <i data-lucide="lock" class="w-4 h-4 mr-2 text-sky-400"></i> Change Password
            </h3>
            <form onsubmit="window.changePassword(event)" class="space-y-4 text-xs">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Current Password *</label>
                <div class="relative">
                  <input id="cur-password" type="password" required placeholder="Enter your current password" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs pr-10" />
                  <button type="button" onclick="window.toggleFieldEye('cur-password', 'cur-eye-icon')" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition" title="Toggle password visibility">
                    <i id="cur-eye-icon" data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">New Password (min. 6 characters) *</label>
                <div class="relative">
                  <input id="new-password" type="password" minlength="6" required placeholder="Enter a secure new password" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs pr-10" />
                  <button type="button" onclick="window.toggleFieldEye('new-password', 'new-eye-icon')" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition" title="Toggle password visibility">
                    <i id="new-eye-icon" data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <div class="flex justify-end">
                <button type="submit" id="pwd-submit-btn" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs border border-slate-700 hover:border-slate-600 transition">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.toggleFieldEye = (inputId, iconId) => {
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

    window.handleAvatarSelect = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      CustomerProfilePage._selectedAvatarFile = file;
      const preview = document.getElementById('profile-avatar-preview');
      if (preview) {
        preview.src = URL.createObjectURL(file);
      }
      Toast.info('Photo selected! Click "Save Profile Changes" to upload.', 'Photo Preview');
    };

    window.updateCustomerProfile = async (event) => {
      event.preventDefault();
      const btn = document.getElementById('update-profile-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

      try {
        const name = document.getElementById('profile-name')?.value;
        const phone = document.getElementById('profile-phone')?.value;
        const street = document.getElementById('profile-street')?.value;
        const city = document.getElementById('profile-city')?.value;
        const zipCode = document.getElementById('profile-zip')?.value;

        let res;
        if (CustomerProfilePage._selectedAvatarFile) {
          const formData = new FormData();
          formData.append('name', name);
          if (phone) formData.append('phone', phone);
          formData.append('address[street]', street || '');
          formData.append('address[city]', city || '');
          formData.append('address[zipCode]', zipCode || '');
          formData.append('avatar', CustomerProfilePage._selectedAvatarFile);

          res = await ApiClient.put('/users/profile', formData);
        } else {
          const payload = {
            name,
            phone,
            address: { street, city, zipCode }
          };
          res = await ApiClient.put('/users/profile', payload);
        }

        const updatedUser = res.data?.user || res.data;
        store.setUser({ ...store.user, ...updatedUser }, store.token);
        Toast.success('Profile updated successfully!', 'Profile Saved');
      } catch (err) {
        Toast.error(err.message || 'Failed to update profile');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Save Profile Changes'; }
      }
    };

    window.changePassword = async (event) => {
      event.preventDefault();
      const btn = document.getElementById('pwd-submit-btn');
      const currentPassword = document.getElementById('cur-password')?.value;
      const newPassword = document.getElementById('new-password')?.value;

      if (!currentPassword || !newPassword) return;

      if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }

      try {
        await ApiClient.put('/users/change-password', { currentPassword, newPassword });
        Toast.success('Password updated successfully! Your account is secure.', 'Security Updated');
        document.getElementById('cur-password').value = '';
        document.getElementById('new-password').value = '';
      } catch (err) {
        Toast.error(err.message || 'Failed to change password');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
      }
    };
  }
}
