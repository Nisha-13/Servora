import { ApiClient } from '../../api.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { store } from '../../state.js';

const PRESET_IMAGES = [
  { label: 'AC / HVAC', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop' },
  { label: 'Electrician', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop' },
  { label: 'Plumbing', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600&fit=crop' },
  { label: 'Car Wash', url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop' },
  { label: 'Car Detail', url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop' },
  { label: 'Oil Change', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&h=600&fit=crop' },
  { label: 'Laptop Repair', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop' },
  { label: 'CCTV', url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&h=600&fit=crop' },
  { label: 'Cleaning', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop' },
  { label: 'Haircut', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop' },
  { label: 'Makeup', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop' },
  { label: 'Photography', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop' },
];

let selectedImageFile = null;

export class ProviderServicesPage {
  static categories = [];
  static existingServices = [];

  static async render(container) {
    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-6xl mx-auto w-full space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">My Services</h1>
            <p class="text-xs text-slate-400 mt-1">Create, edit, and manage your service listings visible to customers.</p>
          </div>
          <button onclick="window.openAddServiceModal()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Service</span>
          </button>
        </div>

        <div id="provider-services-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>
          <div class="animate-pulse bg-slate-900/60 rounded-2xl h-64"></div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    // Preload categories
    try {
      const catsRes = await ApiClient.get('/categories');
      ProviderServicesPage.categories = catsRes.data?.categories || [];
    } catch (_) {}

    this.loadServices();
  }

  static async loadServices() {
    const grid = document.getElementById('provider-services-grid');
    if (!grid) return;

    try {
      const res = await ApiClient.get(`/services?provider=${store.user?._id || ''}&limit=100&includeInactive=true`);
      const services = res.data?.services || [];
      ProviderServicesPage.existingServices = services;

      if (services.length === 0) {
        grid.innerHTML = `
          <div class="col-span-3 glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto"><i data-lucide="tool" class="w-6 h-6"></i></div>
            <h3 class="font-bold text-white text-base">No services listed yet</h3>
            <p class="text-xs text-slate-400">Add your first service offering to start receiving booking requests from customers.</p>
            <button onclick="window.openAddServiceModal()" class="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs shadow-md">Add First Service</button>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      grid.innerHTML = services.map((s) => `
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col">
          <div class="relative h-40 bg-slate-900">
            <img src="${s.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=500&fit=crop'}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=500&fit=crop'" />
            <div class="absolute top-3 right-3">
              <button onclick="window.toggleServiceStatus('${s._id}', ${s.isActive}, '${s.name.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md transition ${s.isActive ? 'bg-emerald-500 text-white hover:bg-rose-500' : 'bg-slate-900 text-amber-300 border border-amber-500/50 hover:bg-emerald-600 hover:text-white'}" title="${s.isActive ? 'Click to deactivate' : 'Click to activate'}">
                ${s.isActive ? '● Active' : '○ Deactive / Inactive (Click to Activate)'}
              </button>
            </div>
          </div>

          <div class="p-5 flex flex-col justify-between flex-grow">
            <div>
              <div class="text-[10px] font-bold text-sky-400 uppercase mb-1">${s.category?.name || 'Category'}</div>
              <h3 class="font-bold text-white text-sm mb-1 line-clamp-1">${s.name}</h3>
              <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">${s.description}</p>
            </div>
            <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div class="text-[10px] text-slate-500 uppercase font-semibold">Starting Price</div>
                <div class="text-sm font-extrabold text-sky-400">Rs. ${s.startingPrice.toLocaleString()}</div>
              </div>
              <div class="flex items-center space-x-1.5">
                <button onclick="window.openEditServiceModal(${JSON.stringify(s).replace(/"/g, '&quot;')})" class="p-2 rounded-lg bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/20 transition text-xs" title="Edit Service">
                  <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="window.confirmDeleteService('${s._id}', '${s.name.replace(/'/g, "\\'")}')" class="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition text-xs" title="Delete Service">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();

      window.toggleServiceStatus = async (sId, currentActive, sName) => {
        if (currentActive) {
          const ok = confirm(`Are you sure you want to deactivate "${sName}"?\nIt will be hidden from customer search and bookings until you reactivate it.`);
          if (!ok) return;
        }

        try {
          await ApiClient.put(`/services/${sId}`, { isActive: !currentActive });
          Toast.success(`Service "${sName}" ${!currentActive ? 'activated and live for customer bookings!' : 'deactivated. You can reactivate it anytime.'}`);
          ProviderServicesPage.loadServices();
        } catch (err) {
          Toast.error(err.message || 'Failed to update service status');
        }
      };

      window.confirmDeleteService = (sId, sName) => {
        if (!confirm(`Are you sure you want to delete "${sName}"? This action cannot be undone.`)) return;
        ApiClient.delete(`/services/${sId}`)
          .then(() => { Toast.success('Service removed'); ProviderServicesPage.loadServices(); })
          .catch((err) => Toast.error(err.message));
      };

    } catch (err) {
      console.error('Provider services error:', err);
    }
  }
}

// Helper: Show inline field error
function setFieldError(fieldId, message) {
  const el = document.getElementById(`err-${fieldId}`);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

function clearFieldErrors() {
  document.querySelectorAll('[id^="err-"]').forEach((el) => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

// Service form modal content builder
function buildServiceFormContent(service = null) {
  selectedImageFile = null;
  const cats = ProviderServicesPage.categories;
  const catOptions = cats.map((c) => `<option value="${c._id}" ${service && (c._id === (service.category?._id || service.category)) ? 'selected' : ''}>${c.name} (${c.group})</option>`).join('');
  const currentImage = service?.images?.[0] || '';

  const presetHtml = PRESET_IMAGES.map((p) => `
    <button type="button" onclick="window.selectPresetImage('${p.url}')" title="${p.label}"
      class="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-sky-400 transition group shrink-0"
      style="height:52px; width:72px;">
      <img src="${p.url}" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition flex items-end justify-center pb-1">
        <span class="text-[9px] text-white font-bold">${p.label}</span>
      </div>
    </button>
  `).join('');

  return `
    <div class="space-y-4 text-xs">
      <!-- Name -->
      <div>
        <label class="block font-semibold text-slate-300 mb-1">Service Name *</label>
        <input id="svc-name" type="text" value="${service?.name || ''}" placeholder="e.g. Expert Split AC Installation & Gas Recharge"
          class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
        <p id="err-svc-name" class="hidden text-rose-400 text-[11px] mt-1 font-medium"></p>
      </div>

      <!-- Category -->
      <div>
        <label class="block font-semibold text-slate-300 mb-1">Category *</label>
        <select id="svc-category" class="glass-input w-full px-3 py-2.5 rounded-xl text-xs">
          <option value="">Select Category</option>
          ${catOptions}
        </select>
        <p id="err-svc-category" class="hidden text-rose-400 text-[11px] mt-1 font-medium"></p>
      </div>

      <!-- Description -->
      <div>
        <label class="block font-semibold text-slate-300 mb-1">Description *</label>
        <textarea id="svc-description" rows="3" placeholder="Describe the service scope, process, and what's included..."
          class="glass-input w-full px-3 py-2 rounded-xl text-xs">${service?.description || ''}</textarea>
        <p id="err-svc-description" class="hidden text-rose-400 text-[11px] mt-1 font-medium"></p>
      </div>

      <!-- Price & Duration -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Starting Price (Rs.) *</label>
          <input id="svc-price" type="number" min="0" value="${service?.startingPrice || ''}" placeholder="e.g. 2500"
            class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
          <p id="err-svc-price" class="hidden text-rose-400 text-[11px] mt-1 font-medium"></p>
        </div>
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Est. Duration *</label>
          <input id="svc-duration" type="text" value="${service?.estimatedDuration || ''}" placeholder="e.g. 2-4 hours"
            class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
          <p id="err-svc-duration" class="hidden text-rose-400 text-[11px] mt-1 font-medium"></p>
        </div>
      </div>

      <!-- Service Areas -->
      <div>
        <label class="block font-semibold text-slate-300 mb-1">Service Areas (comma-separated)</label>
        <input id="svc-areas" type="text" value="${(service?.serviceArea || []).join(', ')}" placeholder="DHA Phase 5, Gulberg III, Model Town"
          class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
      </div>

      <!-- Image Section: Presets & URL only (no file upload) -->
      <div>
        <label class="block font-semibold text-slate-300 mb-1.5">Service Cover Image</label>

        <!-- Image Preview -->
        <div id="svc-image-preview" class="${currentImage ? '' : 'hidden'} mb-3 rounded-2xl overflow-hidden border border-slate-700 relative" style="height:110px;">
          <img id="svc-img-tag" src="${currentImage}" class="w-full h-full object-cover" onerror="this.parentElement.classList.add('hidden')" />
          <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-emerald-400">Preview</div>
        </div>

        <!-- Direct URL Option -->
        <div class="space-y-1 mb-2">
          <div class="text-[10px] text-slate-400 font-semibold">Paste image URL:</div>
          <input id="svc-image-url" type="url" value="${currentImage}" placeholder="https://..."
            class="glass-input w-full px-3 py-2 rounded-xl text-xs"
            oninput="window.previewServiceImage()" />
        </div>

        <!-- Preset Choices -->
        <div class="text-[10px] text-slate-400 mb-1.5 font-semibold">Or pick from presets:</div>
        <div class="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          ${presetHtml}
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-3 border-t border-slate-800">
        <button type="button" onclick="window.Modal.close()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition">Cancel</button>
        <button type="button" id="submit-svc-btn" onclick="window.submitServiceForm(${service ? `'${service._id}'` : 'null'})"
          class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg transition hover:from-emerald-400 hover:to-teal-500">
          ${service ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </div>
  `;
}

// Globally attach modal openers & helpers
window.openAddServiceModal = () => {
  selectedImageFile = null;
  Modal.open({
    title: 'Add New Service Offering',
    content: buildServiceFormContent(),
    maxWidth: 'max-w-xl'
  });
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

window.handleServiceFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  selectedImageFile = file;
  const preview = document.getElementById('svc-image-preview');
  const img = document.getElementById('svc-img-tag');
  const urlInput = document.getElementById('svc-image-url');

  if (preview && img) {
    img.src = URL.createObjectURL(file);
    preview.classList.remove('hidden');
    if (urlInput) urlInput.value = ''; // clear url input when file is selected
  }
};

window.previewServiceImage = () => {
  const url = document.getElementById('svc-image-url')?.value?.trim();
  const preview = document.getElementById('svc-image-preview');
  const img = document.getElementById('svc-img-tag');
  if (!preview || !img) return;
  if (url) {
    selectedImageFile = null; // clear file if url is typed
    img.src = url;
    preview.classList.remove('hidden');
  } else if (!selectedImageFile) {
    preview.classList.add('hidden');
  }
};

window.selectPresetImage = (url) => {
  selectedImageFile = null;
  const input = document.getElementById('svc-image-url');
  if (input) {
    input.value = url;
    window.previewServiceImage();
  }
};

window.submitServiceForm = async (serviceId = null) => {
  clearFieldErrors();
  let hasError = false;

  const name = document.getElementById('svc-name')?.value?.trim();
  const category = document.getElementById('svc-category')?.value;
  const description = document.getElementById('svc-description')?.value?.trim();
  const priceRaw = document.getElementById('svc-price')?.value;
  const duration = document.getElementById('svc-duration')?.value?.trim();
  const imageUrl = document.getElementById('svc-image-url')?.value?.trim();
  const areasRaw = document.getElementById('svc-areas')?.value || '';

  if (!name) { setFieldError('svc-name', 'Service name is required.'); hasError = true; }
  if (!category) { setFieldError('svc-category', 'Please select a category.'); hasError = true; }
  if (!description || description.length < 15) { setFieldError('svc-description', 'Description must be at least 15 characters.'); hasError = true; }
  const startingPrice = parseFloat(priceRaw);
  if (!priceRaw || isNaN(startingPrice) || startingPrice < 0) { setFieldError('svc-price', 'Enter a valid starting price (Rs.).'); hasError = true; }
  if (!duration) { setFieldError('svc-duration', 'Estimated duration is required (e.g. 2-3 hours).'); hasError = true; }

  // Check duplicate service name and category for this provider
  if (name && category) {
    const isEdit = serviceId && serviceId !== 'null';
    const isDuplicate = (ProviderServicesPage.existingServices || []).some((s) => {
      const sCatId = s.category?._id || s.category;
      const sNameMatch = s.name?.trim().toLowerCase() === name.toLowerCase();
      const sCatMatch = sCatId?.toString() === category.toString();
      const isOtherService = !isEdit || s._id?.toString() !== serviceId?.toString();
      return sNameMatch && sCatMatch && isOtherService;
    });

    if (isDuplicate) {
      setFieldError('svc-name', 'already exists service name and category');
      setFieldError('svc-category', 'already exists service name and category');
      hasError = true;
    }
  }

  if (hasError) return;

  const btn = document.getElementById('submit-svc-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    const isEdit = serviceId && serviceId !== 'null';

    if (selectedImageFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('startingPrice', startingPrice);
      formData.append('estimatedDuration', duration);
      
      const areas = areasRaw.split(',').map((a) => a.trim()).filter(Boolean);
      areas.forEach((a) => formData.append('serviceArea[]', a));
      formData.append('images', selectedImageFile);

      if (isEdit) {
        await ApiClient.put(`/services/${serviceId}`, formData);
        Toast.success('Service updated with uploaded image!');
      } else {
        await ApiClient.upload('/services', formData);
        Toast.success('New service created successfully!', 'Service Created');
      }
    } else {
      // JSON payload
      const payload = {
        name,
        category,
        description,
        startingPrice,
        estimatedDuration: duration,
        serviceArea: areasRaw.split(',').map((a) => a.trim()).filter(Boolean),
        ...(imageUrl ? { images: [imageUrl] } : {})
      };

      if (isEdit) {
        await ApiClient.put(`/services/${serviceId}`, payload);
        Toast.success('Service updated successfully!');
      } else {
        await ApiClient.post('/services', payload);
        Toast.success('New service listed successfully!', 'Service Created');
      }
    }

    Modal.close();
    ProviderServicesPage.loadServices();
  } catch (err) {
    Toast.error(err.message || 'Failed to save service');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = serviceId ? 'Update Service' : 'Create Service'; }
  }
};

window.openEditServiceModal = (service) => {
  selectedImageFile = null;
  Modal.open({
    title: 'Edit Service',
    content: buildServiceFormContent(service),
    maxWidth: 'max-w-xl'
  });
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};
