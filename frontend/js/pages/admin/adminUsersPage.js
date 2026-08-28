import { ApiClient } from '../../api.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';

export class AdminUsersPage {
  static _queryParams = {};

  static async render(container, queryParams = {}) {
    AdminUsersPage._queryParams = queryParams;
    const role = queryParams.role || '';

    container.innerHTML = `
      <div class="py-8 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">User Management</h1>
            <p class="text-xs text-slate-400 mt-1">Manage customer and provider accounts, roles, and access control.</p>
          </div>
          <div class="flex items-center space-x-2 text-xs">
            <span class="text-slate-400">Filter by role:</span>
            <select id="user-role-filter" onchange="window.filterAdminUsers()" class="glass-input px-3 py-2 rounded-xl text-xs">
              <option value="" ${!role ? 'selected' : ''}>All Users</option>
              <option value="CUSTOMER" ${role === 'CUSTOMER' ? 'selected' : ''}>Customers</option>
              <option value="PROVIDER" ${role === 'PROVIDER' ? 'selected' : ''}>Providers</option>
              <option value="ADMIN" ${role === 'ADMIN' ? 'selected' : ''}>Admins</option>
            </select>
          </div>
        </div>

        <div id="admin-users-table" class="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div class="animate-pulse p-4 space-y-2">
            ${Array(5).fill('<div class="h-10 bg-slate-900 rounded-lg"></div>').join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    window.filterAdminUsers = () => {
      const r = document.getElementById('user-role-filter').value;
      window.location.hash = r ? `#/admin/users?role=${r}` : '#/admin/users';
    };

    this.loadUsers(queryParams);
  }

  static async loadUsers(queryParams) {
    const tableContainer = document.getElementById('admin-users-table');
    if (!tableContainer) return;

    try {
      const params = new URLSearchParams();
      if (queryParams.role) params.append('role', queryParams.role);
      params.append('limit', 50);

      const res = await ApiClient.get(`/admin/users?${params.toString()}`);
      const users = res.data?.users || [];

      if (users.length === 0) {
        tableContainer.innerHTML = `<div class="p-8 text-center text-xs text-slate-400">No users found.</div>`;
        return;
      }

      tableContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="border-b border-slate-800">
              <tr>
                <th class="py-3 px-5 text-left font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase tracking-wider">Phone</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase tracking-wider">City</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th class="py-3 px-4 text-left font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                <th class="py-3 px-5 text-left font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-900">
              ${users.map((u) => `
                <tr class="hover:bg-slate-900/30 transition">
                  <td class="py-3.5 px-5">
                    <div class="flex items-center space-x-3">
                      <img src="${u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'}" class="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <div class="font-bold text-white">${u.name}</div>
                        <div class="text-[10px] text-slate-400">${u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : u.role === 'PROVIDER' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}">
                      ${u.role}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-slate-300">${u.phone || '—'}</td>
                  <td class="py-3.5 px-4 text-slate-300">${u.address?.city || '—'}</td>
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                      ${u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-slate-400">${new Date(u.createdAt).toLocaleDateString()}</td>
                  <td class="py-3.5 px-5">
                    <div class="flex items-center space-x-2">
                      <button onclick="window.toggleUserBlock('${u._id}', ${u.isActive}, '${u.name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${u.isActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}">
                        ${u.isActive ? 'Block' : 'Unblock'}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      window.toggleUserBlock = async (userId, isActive, userName) => {
        const action = isActive ? 'block' : 'unblock';
        if (!confirm(`Are you sure you want to ${action} "${userName}"?`)) return;

        try {
          await ApiClient.patch(`/admin/users/${userId}/status`, { isActive: !isActive });
          Toast.success(`User ${action}ed successfully`);
          AdminUsersPage.loadUsers(AdminUsersPage._queryParams);
        } catch (err) {
          Toast.error(err.message);
        }
      };

    } catch (err) {
      console.error('Admin users error:', err);
    }
  }
}
