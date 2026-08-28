export class PrivacyPolicyPage {
  static render(container) {
    container.innerHTML = `
      <div class="py-12 px-4 lg:px-8 max-w-4xl mx-auto w-full">
        <!-- Header -->
        <div class="mb-10">
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4">
            <i data-lucide="shield" class="w-3.5 h-3.5"></i>
            <span>Legal Document</span>
          </div>
          <h1 class="text-4xl font-extrabold text-white tracking-tight mb-3">Privacy Policy</h1>
          <p class="text-slate-400 text-sm">Last updated: August 28, 2026 &nbsp;•&nbsp; Effective immediately</p>
        </div>

        <div class="glass-panel rounded-3xl border border-slate-800 p-8 space-y-8 text-sm text-slate-300 leading-relaxed">

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-extrabold">1</span>
              <span>Information We Collect</span>
            </h2>
            <p class="mb-3">Servora collects information you provide directly when creating an account, booking a service, or contacting support. This includes:</p>
            <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li><strong class="text-slate-300">Account Data:</strong> Name, email address, phone number, profile photo, and role (Customer or Service Provider).</li>
              <li><strong class="text-slate-300">Booking Data:</strong> Service preferences, scheduling details, address information, and booking history.</li>
              <li><strong class="text-slate-300">Payment Data:</strong> All payments are settled via Cash on Delivery upon service completion. We record transaction amounts, invoice items, and provider confirmation timestamps.</li>
              <li><strong class="text-slate-300">Usage Data:</strong> Pages visited, features used, device type, browser, and IP address for security and analytics.</li>
              <li><strong class="text-slate-300">Communications:</strong> Messages sent through our in-app chat system between customers and providers.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-extrabold">2</span>
              <span>How We Use Your Information</span>
            </h2>
            <p class="mb-3">We use the collected information to:</p>
            <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>Provide, operate, and improve the Servora platform.</li>
              <li>Process bookings, generate itemized invoices, and facilitate Cash on Delivery verification.</li>
              <li>Send transactional notifications (booking confirmations, status updates, invoice alerts).</li>
              <li>Match customers with the most suitable service providers in their area.</li>
              <li>Maintain platform security, detect fraud, and enforce our Terms of Service.</li>
              <li>Provide customer support and resolve disputes.</li>
              <li>Generate anonymized analytics to improve platform performance.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-extrabold">3</span>
              <span>Data Sharing & Third Parties</span>
            </h2>
            <p class="mb-3">We do <strong class="text-white">not</strong> sell your personal data. We share data only with:</p>
            <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li><strong class="text-slate-300">Service Providers:</strong> Relevant booking and contact details are shared with the assigned provider to fulfill your service.</li>
              <li><strong class="text-slate-300">Legal Authorities:</strong> When required by law, court order, or to protect the rights and safety of our users.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-extrabold">4</span>
              <span>Data Retention & Deletion</span>
            </h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. You may request account deletion at any time by contacting <a href="#/contact" class="text-sky-400 hover:text-sky-300 underline">our support team</a>. Booking and invoice records may be retained for compliance and audit requirements.</p>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-extrabold">5</span>
              <span>Your Rights</span>
            </h2>
            <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>Access and download your personal data.</li>
              <li>Correct inaccurate information in your profile.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Opt out of marketing communications at any time.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-extrabold">6</span>
              <span>Contact Us</span>
            </h2>
            <p>For privacy-related questions or data requests, contact us at: <a href="#/contact" class="text-sky-400 hover:text-sky-300 underline">Servora Support</a> or email <span class="text-white font-semibold">privacy@servora.pk</span></p>
          </section>
        </div>

        <!-- Related Links -->
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="#/terms" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700">
            Terms of Service →
          </a>
          <a href="#/security" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700">
            Security Guidelines →
          </a>
          <a href="#/contact" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700">
            Contact Support →
          </a>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

export class TermsOfServicePage {
  static render(container) {
    container.innerHTML = `
      <div class="py-12 px-4 lg:px-8 max-w-4xl mx-auto w-full">
        <!-- Header -->
        <div class="mb-10">
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span>Legal Document</span>
          </div>
          <h1 class="text-4xl font-extrabold text-white tracking-tight mb-3">Terms of Service</h1>
          <p class="text-slate-400 text-sm">Last updated: August 28, 2026 &nbsp;•&nbsp; Please read carefully before using Servora</p>
        </div>

        <div class="glass-panel rounded-3xl border border-slate-800 p-8 space-y-8 text-sm text-slate-300 leading-relaxed">

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-extrabold">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>By creating an account or using Servora, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use of the platform. Servora reserves the right to update these terms at any time with notice.</p>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-extrabold">2</span>
              <span>User Accounts & Eligibility</span>
            </h2>
            <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>One person may not maintain multiple accounts.</li>
              <li>You must provide accurate, current, and complete information during registration.</li>
              <li>Accounts found in violation of these terms may be suspended or permanently deleted.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-extrabold">3</span>
              <span>Booking & Service Rules</span>
            </h2>
            <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>Bookings are confirmed only after the service provider accepts the request.</li>
              <li>Customers must be present or ensure access to property at the scheduled time.</li>
              <li>Cancellations should be made promptly before the provider travels on-site.</li>
              <li>Providers must deliver services as described in their listed profiles.</li>
              <li>Any disputes between customers and providers should first be resolved through our in-app support. Servora may mediate if necessary.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-extrabold">4</span>
              <span>Cash on Delivery & Invoicing</span>
            </h2>
            <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>Servora operates strictly on a <strong class="text-white">Cash on Delivery</strong> payment model.</li>
              <li>Upon completing the service on-site, the provider issues a final itemized invoice.</li>
              <li>The customer pays the total invoice amount directly in cash to the provider.</li>
              <li>The provider confirms cash receipt in the app, marking the booking as PAID.</li>
              <li>Customers cannot self-confirm payments; confirmation must come from the provider or admin.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-extrabold">5</span>
              <span>Prohibited Conduct</span>
            </h2>
            <p class="mb-3">The following are strictly prohibited on Servora:</p>
            <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>Posting false, misleading, or fraudulent service listings.</li>
              <li>Harassment, abuse, or threatening behavior toward other users.</li>
              <li>Creating fake reviews or manipulating the rating system.</li>
              <li>Using bots, scrapers, or automated tools to abuse the platform.</li>
              <li>Sharing login credentials or impersonating another user.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-extrabold">6</span>
              <span>Contact</span>
            </h2>
            <p>For questions about these terms, contact us at <span class="text-white font-semibold">legal@servora.pk</span> or via <a href="#/contact" class="text-sky-400 hover:text-sky-300 underline">our support page</a>.</p>
          </section>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <a href="#/privacy" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700">
            Privacy Policy →
          </a>
          <a href="#/security" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700">
            Security Guidelines →
          </a>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

export class SecurityGuidelinesPage {
  static render(container) {
    container.innerHTML = `
      <div class="py-12 px-4 lg:px-8 max-w-4xl mx-auto w-full">
        <!-- Header -->
        <div class="mb-10">
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
            <span>Security</span>
          </div>
          <h1 class="text-4xl font-extrabold text-white tracking-tight mb-3">Security Guidelines</h1>
          <p class="text-slate-400 text-sm">Last updated: August 28, 2026 &nbsp;•&nbsp; How we keep your account and transactions safe</p>
        </div>

        <!-- Security Badges -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          ${[
            { icon: 'lock', label: 'JWT Encrypted Auth', color: 'sky' },
            { icon: 'banknote', label: 'Cash on Delivery', color: 'purple' },
            { icon: 'shield-check', label: 'Verified Providers', color: 'emerald' },
            { icon: 'eye-off', label: 'No Data Selling', color: 'rose' }
          ].map(b => `
            <div class="glass-panel rounded-2xl border border-slate-800 p-4 text-center">
              <div class="w-10 h-10 rounded-xl bg-${b.color}-500/10 text-${b.color}-400 flex items-center justify-center mx-auto mb-2">
                <i data-lucide="${b.icon}" class="w-5 h-5"></i>
              </div>
              <div class="text-[11px] font-semibold text-slate-300 leading-tight">${b.label}</div>
            </div>
          `).join('')}
        </div>

        <div class="glass-panel rounded-3xl border border-slate-800 p-8 space-y-8 text-sm text-slate-300 leading-relaxed">

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <i data-lucide="key" class="w-5 h-5 text-emerald-400"></i>
              <span>Account Security Best Practices</span>
            </h2>
            <ul class="list-disc list-inside space-y-2 text-slate-400 ml-2">
              <li>Use a <strong class="text-white">strong, unique password</strong> (minimum 8 characters with letters, numbers, and symbols).</li>
              <li>Never share your password or login credentials with anyone.</li>
              <li>Always log out when using shared or public devices.</li>
              <li>Keep your registered phone number and email up to date.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <i data-lucide="banknote" class="w-5 h-5 text-purple-400"></i>
              <span>Cash on Delivery Verification</span>
            </h2>
            <p class="mb-3">Servora enforces secure Cash on Delivery protocols:</p>
            <ul class="list-disc list-inside space-y-2 text-slate-400 ml-2">
              <li>Customers pay directly in cash after service completion.</li>
              <li>Providers issue an itemized digital invoice prior to requesting payment.</li>
              <li>Both parties receive real-time notifications upon provider payment confirmation.</li>
              <li>All transaction timestamps and confirmations are recorded for auditing.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <i data-lucide="user-check" class="w-5 h-5 text-sky-400"></i>
              <span>Provider Verification</span>
            </h2>
            <ul class="list-disc list-inside space-y-2 text-slate-400 ml-2">
              <li>Identity verification via government-issued ID.</li>
              <li>Background checks before profile activation.</li>
              <li>Service credentials and certifications reviewed by the Servora team.</li>
              <li>Customer ratings and reviews monitored continuously.</li>
            </ul>
          </section>

          <div class="border-t border-slate-800"></div>

          <section>
            <h2 class="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <i data-lucide="phone" class="w-5 h-5 text-sky-400"></i>
              <span>Report an Issue</span>
            </h2>
            <p>For support or dispute concerns, contact us via <a href="#/contact" class="text-sky-400 hover:text-sky-300 underline">our support page</a> or email <span class="text-white font-semibold">support@servora.pk</span>.</p>
          </section>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <a href="#/privacy" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700">
            Privacy Policy →
          </a>
          <a href="#/terms" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700">
            Terms of Service →
          </a>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}
