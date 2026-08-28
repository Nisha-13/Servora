import { ApiClient } from '../../api.js';
import { store } from '../../state.js';
import { Toast } from '../../components/toast.js';

export class ProviderProfilePage {
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

    const profile = user.providerProfile || {};
    ProviderProfilePage._selectedAvatarFile = null;

    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Provider Profile</h1>
          <p class="text-xs text-slate-400 mt-1">Manage your public professional profile, credentials, and account security.</p>
        </div>

        <div class="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <!-- Avatar Section with Live Upload -->
          <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-800">
            <div class="relative group w-24 h-24 shrink-0">
              <img
                id="provider-avatar-preview"
                src="${user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop'}"
                class="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/30 shadow-xl"
                onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop'"
              />
              <label for="provider-avatar-file" class="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-white">
                <i data-lucide="camera" class="w-6 h-6 mb-1"></i>
                <span class="text-[10px] font-bold">Change</span>
              </label>
              <input type="file" id="provider-avatar-file" accept="image/*" class="hidden" onchange="window.handleProviderAvatarSelect(event)" />
            </div>

            <div class="space-y-1.5 flex-grow">
              <div class="flex items-center space-x-2">
                <h2 class="text-xl font-extrabold text-white">${user.name}</h2>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Verified Provider</span>
              </div>
              <div class="text-xs text-slate-400">${user.email} • Rating: <strong class="text-amber-400">★ ${profile.rating || '5.0'}</strong> (${profile.reviewCount || 0} reviews)</div>
              <div class="text-[11px] text-slate-500">Registered since ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
              <div class="pt-1">
                <label for="provider-avatar-file" class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold cursor-pointer transition">
                  <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                  <span>Upload New Photo</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Provider Profile Form -->
          <form onsubmit="window.updateProviderProfile(event)" class="space-y-5 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Full Name *</label>
                <input id="prov-name" type="text" value="${user.name || ''}" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                <input id="prov-phone" type="text" value="${user.phone || ''}" placeholder="+92 300 1234567" required class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Professional Bio & Credentials</label>
              <textarea id="prov-bio" rows="3" placeholder="Describe your experience, technical skills, and guarantees..." class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs">${profile.bio || ''}</textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Experience (Years)</label>
                <input id="prov-exp" type="number" min="0" value="${profile.experienceYears || 3}" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Base City</label>
                <input id="prov-city" type="text" value="${user.address?.city || ''}" placeholder="Lahore, Karachi, Islamabad" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Service Coverage Areas (comma-separated)</label>
              <input id="prov-areas" type="text" value="${(profile.serviceAreas || []).join(', ')}" placeholder="DHA, Gulberg, Model Town, Johar Town" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" id="prov-save-btn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition">
                Save Provider Profile
              </button>
            </div>
          </form>

          <!-- Change Password Section with Eye Icons -->
          <div class="pt-6 border-t border-slate-800">
            <h3 class="font-bold text-white text-sm mb-4 flex items-center">
              <i data-lucide="lock" class="w-4 h-4 mr-2 text-emerald-400"></i> Change Password
            </h3>
            <form onsubmit="window.changeProviderPassword(event)" class="space-y-4 text-xs">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Current Password *</label>
                <div class="relative">
                  <input id="prov-cur-pwd" type="password" required placeholder="Enter current password" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs pr-10" />
                  <button type="button" onclick="window.toggleProvEye('prov-cur-pwd', 'prov-cur-eye')" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition" title="Toggle password visibility">
                    <i id="prov-cur-eye" data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">New Password (min. 6 characters) *</label>
                <div class="relative">
                  <input id="prov-new-pwd" type="password" minlength="6" required placeholder="Enter a secure new password" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs pr-10" />
                  <button type="button" onclick="window.toggleProvEye('prov-new-pwd', 'prov-new-eye')" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition" title="Toggle password visibility">
                    <i id="prov-new-eye" data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <div class="flex justify-end">
                <button type="submit" id="prov-pwd-btn" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs border border-slate-700 hover:border-slate-600 transition">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.toggleProvEye = (inputId, iconId) => {
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

    window.handleProviderAvatarSelect = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      ProviderProfilePage._selectedAvatarFile = file;
      const preview = document.getElementById('provider-avatar-preview');
      if (preview) {
        preview.src = URL.createObjectURL(file);
      }
      Toast.info('Photo selected! Click "Save Provider Profile" to upload.', 'Photo Preview');
    };

    window.updateProviderProfile = async (event) => {
      event.preventDefault();
      const btn = document.getElementById('prov-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

      try {
        const name = document.getElementById('prov-name')?.value;
        const phone = document.getElementById('prov-phone')?.value;
        const bio = document.getElementById('prov-bio')?.value;
        const exp = parseInt(document.getElementById('prov-exp')?.value || '0', 10);
        const city = document.getElementById('prov-city')?.value;
        const areasRaw = document.getElementById('prov-areas')?.value || '';
        const serviceAreas = areasRaw.split(',').map((a) => a.trim()).filter(Boolean);

        let res;
        if (ProviderProfilePage._selectedAvatarFile) {
          const formData = new FormData();
          formData.append('name', name);
          if (phone) formData.append('phone', phone);
          if (bio) formData.append('bio', bio);
          formData.append('experienceYears', exp);
          if (city) formData.append('city', city);
          serviceAreas.forEach((a) => formData.append('serviceAreas[]', a));
          formData.append('avatar', ProviderProfilePage._selectedAvatarFile);

          res = await ApiClient.put('/users/profile', formData);
        } else {
          const payload = {
            name,
            phone,
            bio,
            experienceYears: exp,
            address: { city },
            serviceAreas
          };
          res = await ApiClient.put('/users/profile', payload);
        }

        const updatedUser = res.data?.user || res.data;
        if (updatedUser) {
          store.setUser({ ...store.user, ...updatedUser }, store.token);
          // Refresh avatar preview in case backend returned a full URL
          const preview = document.getElementById('provider-avatar-preview');
          if (preview && updatedUser.avatar) preview.src = updatedUser.avatar;
          ProviderProfilePage._selectedAvatarFile = null;
        }
        Toast.success('Provider profile updated successfully!', 'Profile Saved');
      } catch (err) {
        Toast.error(err.message || 'Failed to update profile');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Save Provider Profile'; }
      }
    };

    window.changeProviderPassword = async (event) => {
      event.preventDefault();
      const btn = document.getElementById('prov-pwd-btn');
      const currentPassword = document.getElementById('prov-cur-pwd')?.value;
      const newPassword = document.getElementById('prov-new-pwd')?.value;

      if (!currentPassword || !newPassword) return;

      if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }

      try {
        await ApiClient.put('/users/change-password', { currentPassword, newPassword });
        Toast.success('Password updated successfully! Your account is secure.', 'Security Updated');
        document.getElementById('prov-cur-pwd').value = '';
        document.getElementById('prov-new-pwd').value = '';
      } catch (err) {
        Toast.error(err.message || 'Failed to change password');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
      }
    };
  }
}
