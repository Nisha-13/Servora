import { ApiClient } from '../../api.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';

export class AdminCategoriesPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Service Categories</h1>
            <p class="text-xs text-slate-400 mt-1">Manage all platform service categories and their groups.</p>
          </div>
          <button onclick="window.openAddCategoryModal()" class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition flex items-center space-x-2">
            <i data-lucide="plus" class="w-4 h-4"></i><span>Add Category</span>
          </button>
        </div>

        <div id="admin-categories-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${Array(6).fill('<div class="animate-pulse bg-slate-900/60 rounded-2xl h-28"></div>').join('')}
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    this.loadCategories();
  }

  static async loadCategories() {
    const grid = document.getElementById('admin-categories-grid');
    if (!grid) return;

    try {
      const res = await ApiClient.get('/categories');
      const categories = res.data?.categories || [];

      grid.innerHTML = categories.map((cat) => `
        <div class="glass-card p-5 rounded-2xl border border-slate-800 flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <i data-lucide="${cat.icon || 'tag'}" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="font-bold text-white text-sm">${cat.name}</h3>
              <div class="text-[10px] text-slate-400">${cat.group} • ${cat.serviceCount || 0} services</div>
            </div>
          </div>
          <div class="flex items-center space-x-1.5">
            <button onclick="window.openEditCategoryModal(${JSON.stringify(cat).replace(/"/g, '&quot;')})" class="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 text-xs transition">
              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.deleteCategory('${cat._id}', '${cat.name.replace(/'/g, "\\'")}')" class="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();

      window.deleteCategory = async (catId, catName) => {
        if (!confirm(`Delete category "${catName}"? This may affect associated services.`)) return;
        try {
          await ApiClient.delete(`/categories/${catId}`);
          Toast.success('Category deleted');
          AdminCategoriesPage.loadCategories();
        } catch (err) {
          Toast.error(err.message);
        }
      };
    } catch (err) {
      console.error('Admin categories error:', err);
    }
  }
}

const GROUPS = ['Home Services', 'Automotive', 'Technology', 'Personal Care', 'Professional'];


const LUCIDE_ICONS = [
  'wrench', 'wind', 'zap', 'droplet', 'hammer', 'sparkles', 'shield-check', 'shield-alert',
  'tv', 'car', 'cpu', 'laptop', 'camera', 'wifi', 'printer', 'scissors', 'heart', 'smile',
  'book-open', 'palette', 'video', 'code', 'battery-charging', 'disc', 'star', 'tag',
  'layers', 'settings', 'tool', 'clock', 'phone', 'mail', 'home', 'map-pin', 'users'
];

function categoryModalForm(cat = {}) {
  const selectedIcon = cat.icon || 'tag';
  const iconPickerHtml = LUCIDE_ICONS.map((icon) => `
    <button type="button" onclick="window.selectCatIcon('${icon}')" title="${icon}"
      id="icon-btn-${icon}"
      class="flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] text-slate-300 transition
        ${icon === selectedIcon ? 'border-sky-400 bg-sky-500/20 text-sky-300' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}">
      <i data-lucide="${icon}" class="w-4 h-4 mb-1"></i>
      <span class="leading-none truncate w-full text-center" style="max-width:56px">${icon}</span>
    </button>
  `).join('');

  return `
    <div class="space-y-4 text-xs">
      <div>
        <label class="block font-semibold text-slate-300 mb-1">Category Name *</label>
        <input id="cat-name" type="text" value="${cat.name || ''}" placeholder="e.g. HVAC & AC Services"
          class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
        <p id="err-cat-name" class="hidden text-rose-400 text-[11px] mt-1 font-medium"></p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Group *</label>
          <select id="cat-group" class="glass-input w-full px-3 py-2.5 rounded-xl text-xs">
            ${GROUPS.map((g) => `<option value="${g}" ${cat.group === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
          <p id="err-cat-group" class="hidden text-rose-400 text-[11px] mt-1 font-medium"></p>
        </div>
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Description</label>
          <input id="cat-desc" type="text" value="${cat.description || ''}" placeholder="Short description..."
            class="glass-input w-full px-3 py-2.5 rounded-xl text-xs" />
        </div>
      </div>

      <!-- Icon Picker -->
      <div>
        <label class="block font-semibold text-slate-300 mb-1 flex items-center space-x-2">
          <span>Icon (Lucide) *</span>
          <span class="text-slate-500 font-normal">— Selected:</span>
          <span id="cat-icon-preview-label" class="text-sky-400 font-mono">${selectedIcon}</span>
          <i id="cat-icon-preview" data-lucide="${selectedIcon}" class="w-4 h-4 text-sky-400"></i>
        </label>
        <input id="cat-icon" type="hidden" value="${selectedIcon}" />
        <div class="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          ${iconPickerHtml}
        </div>
        <p id="err-cat-icon" class="hidden text-rose-400 text-[11px] mt-1 font-medium"></p>
      </div>

      <div class="flex justify-end space-x-3 pt-2 border-t border-slate-800">
        <button type="button" onclick="window.Modal.close()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition">Cancel</button>
        <button type="button" onclick="window.submitCategoryForm('${cat._id || ''}')"
          class="px-6 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-lg transition hover:bg-sky-400">
          ${cat._id ? 'Update' : 'Create'} Category
        </button>
      </div>
    </div>
  `;
}

window.selectCatIcon = (icon) => {
  // Update hidden input
  const hiddenInput = document.getElementById('cat-icon');
  if (hiddenInput) hiddenInput.value = icon;

  // Update preview
  const previewLabel = document.getElementById('cat-icon-preview-label');
  const previewIcon = document.getElementById('cat-icon-preview');
  if (previewLabel) previewLabel.textContent = icon;
  if (previewIcon) {
    previewIcon.setAttribute('data-lucide', icon);
    if (window.lucide) window.lucide.createIcons();
  }

  // Highlight selected
  document.querySelectorAll('[id^="icon-btn-"]').forEach((btn) => {
    btn.className = btn.className.replace('border-sky-400 bg-sky-500/20 text-sky-300', 'border-slate-800 bg-slate-900/50');
  });
  const selectedBtn = document.getElementById(`icon-btn-${icon}`);
  if (selectedBtn) {
    selectedBtn.className = selectedBtn.className.replace('border-slate-800 bg-slate-900/50', 'border-sky-400 bg-sky-500/20 text-sky-300');
  }
};

window.openAddCategoryModal = () => {
  Modal.open({ title: 'Add Service Category', content: categoryModalForm(), maxWidth: 'max-w-lg' });
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

window.openEditCategoryModal = (cat) => {
  Modal.open({ title: 'Edit Category', content: categoryModalForm(cat), maxWidth: 'max-w-lg' });
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

window.submitCategoryForm = async (catId) => {
  // Clear errors
  ['cat-name', 'cat-group', 'cat-icon'].forEach((id) => {
    const el = document.getElementById(`err-${id}`);
    if (el) { el.textContent = ''; el.classList.add('hidden'); }
  });

  let hasError = false;
  const name = document.getElementById('cat-name')?.value?.trim();
  const group = document.getElementById('cat-group')?.value;
  const icon = document.getElementById('cat-icon')?.value?.trim();
  const description = document.getElementById('cat-desc')?.value?.trim();

  if (!name) {
    const el = document.getElementById('err-cat-name');
    if (el) { el.textContent = 'Category name is required.'; el.classList.remove('hidden'); }
    hasError = true;
  }
  if (!group) {
    const el = document.getElementById('err-cat-group');
    if (el) { el.textContent = 'Please select a group.'; el.classList.remove('hidden'); }
    hasError = true;
  }
  if (!icon) {
    const el = document.getElementById('err-cat-icon');
    if (el) { el.textContent = 'Please select an icon.'; el.classList.remove('hidden'); }
    hasError = true;
  }
  if (hasError) return;

  try {
    const payload = { name, group, icon, description };
    if (catId) {
      await ApiClient.put(`/categories/${catId}`, payload);
      Toast.success('Category updated!');
    } else {
      await ApiClient.post('/categories', payload);
      Toast.success('Category created!', 'Category Added');
    }
    Modal.close();
    AdminCategoriesPage.loadCategories();
  } catch (err) {
    Toast.error(err.message);
  }
};

export class AdminServicesPage {
  static async render(container, queryParams = {}) {
    const page = parseInt(queryParams.page || 1, 10);
    const limit = 10;

    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Platform Services</h1>
            <p class="text-xs text-slate-400 mt-1">All service listings across the platform with moderation controls.</p>
          </div>
          <div id="admin-services-count" class="text-xs text-slate-400 font-medium"></div>
        </div>

        <div id="admin-services-list" class="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div class="animate-pulse p-4 space-y-2">${Array(5).fill('<div class="h-10 bg-slate-900 rounded-lg"></div>').join('')}</div>
        </div>

        <!-- Pagination -->
        <div id="admin-services-pagination" class="flex justify-center items-center space-x-2 pt-2"></div>
      </div>
    `;

    try {
      const res = await ApiClient.get(`/services?page=${page}&limit=${limit}&all=true`);
      const services = res.data?.services || [];
      const total = res.data?.total || 0;
      const totalPages = res.data?.pages || Math.ceil(total / limit) || 1;

      const countEl = document.getElementById('admin-services-count');
      if (countEl) {
        countEl.innerHTML = `Total: <strong class="text-white">${total}</strong> services (Page ${page} of ${totalPages})`;
      }

      const tableContainer = document.getElementById('admin-services-list');
      const paginationContainer = document.getElementById('admin-services-pagination');
      if (!tableContainer) return;

      if (services.length === 0) {
        tableContainer.innerHTML = `
          <div class="p-12 text-center text-slate-400 text-xs">
            No services registered on the platform.
          </div>
        `;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
      }

      tableContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="border-b border-slate-800 bg-slate-900/40">
              <tr>
                <th class="py-3.5 px-5 text-left font-semibold text-slate-400 uppercase">Service Name</th>
                <th class="py-3.5 px-4 text-left font-semibold text-slate-400 uppercase">Category</th>
                <th class="py-3.5 px-4 text-left font-semibold text-slate-400 uppercase">Provider</th>
                <th class="py-3.5 px-4 text-left font-semibold text-slate-400 uppercase">Starting Price</th>
                <th class="py-3.5 px-4 text-left font-semibold text-slate-400 uppercase">Status</th>
                <th class="py-3.5 px-5 text-left font-semibold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-900">
              ${services.map((s) => `
                <tr class="hover:bg-slate-900/30 transition">
                  <td class="py-3.5 px-5 font-bold text-white flex items-center space-x-3">
                    <img src="${s.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=80&h=80&fit=crop'}" class="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700" onerror="this.src='https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=80&h=80&fit=crop'" />
                    <span class="line-clamp-1 max-w-xs">${s.name}</span>
                  </td>
                  <td class="py-3.5 px-4 text-slate-300 font-medium">${s.category?.name || '—'}</td>
                  <td class="py-3.5 px-4 text-slate-300">${s.provider?.name || '—'}</td>
                  <td class="py-3.5 px-4 font-extrabold text-sky-400">Rs. ${s.startingPrice.toLocaleString()}</td>
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${s.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-amber-400 border border-amber-500/30'}">
                      ${s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td class="py-3.5 px-5">
                    <button onclick="window.adminToggleService('${s._id}', ${s.isActive}, '${s.name.replace(/'/g, "\\'")}')" class="px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm ${s.isActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'}">
                      ${s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Render Pagination
      if (paginationContainer) {
        if (totalPages <= 1) {
          paginationContainer.innerHTML = '';
        } else {
          let pagHtml = '';
          pagHtml += `
            <button
              onclick="window.goToAdminServicePage(${page - 1})"
              ${page <= 1 ? 'disabled class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 text-xs cursor-not-allowed"' : 'class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"'}
            >
              ← Prev
            </button>
          `;

          for (let p = 1; p <= totalPages; p++) {
            pagHtml += `
              <button
                onclick="window.goToAdminServicePage(${p})"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${p === page ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'}"
              >
                ${p}
              </button>
            `;
          }

          pagHtml += `
            <button
              onclick="window.goToAdminServicePage(${page + 1})"
              ${page >= totalPages ? 'disabled class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 text-xs cursor-not-allowed"' : 'class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"'}
            >
              Next →
            </button>
          `;

          paginationContainer.innerHTML = pagHtml;
        }
      }

      window.goToAdminServicePage = (newPage) => {
        AdminServicesPage.render(document.getElementById('app'), { page: newPage });
      };

      window.adminToggleService = async (sId, isActive, sName) => {
        if (isActive) {
          const ok = confirm(`Are you sure you want to deactivate "${sName}"?\nIt will remain visible in this list with an "Activate" button, but hidden from customer search.`);
          if (!ok) return;
        }

        try {
          await ApiClient.put(`/services/${sId}`, { isActive: !isActive });
          Toast.success(`Service "${sName}" ${!isActive ? 'activated' : 'deactivated successfully'}`);
          AdminServicesPage.render(document.getElementById('app'), { page });
        } catch (err) {
          Toast.error(err.message || 'Failed to update service status');
        }
      };

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Admin services error:', err);
    }
  }
}
