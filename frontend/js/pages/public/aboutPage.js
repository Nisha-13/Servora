import { Toast } from '../../components/toast.js';
import { ApiClient } from '../../api.js';

export class AboutPage {
  static async render(container) {
    container.innerHTML = `
      <div class="py-12 px-4 lg:px-8 max-w-6xl mx-auto w-full space-y-16">
        <!-- Hero Section -->
        <div class="text-center space-y-4 max-w-3xl mx-auto">
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Engineering the Future of Local Services</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Connecting Verified Experts with Homeowners & Businesses
          </h1>
          <p class="text-slate-400 text-sm sm:text-base leading-relaxed">
            Servora was created to eliminate guesswork, opaque pricing, and unreliable handymen. We bring enterprise reliability, live status tracking, and secure itemized invoicing to local on-demand services.
          </p>
        </div>

        <!-- Metrics Grid (Dynamic) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div class="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <div id="stat-completed" class="text-3xl sm:text-4xl font-extrabold text-sky-400 mb-1">50,000+</div>
            <div class="text-xs text-slate-400 font-medium">Services Completed</div>
          </div>
          <div class="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <div id="stat-satisfaction" class="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">99.4%</div>
            <div class="text-xs text-slate-400 font-medium">Customer Satisfaction</div>
          </div>
          <div class="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <div id="stat-categories" class="text-3xl sm:text-4xl font-extrabold text-purple-400 mb-1">28+</div>
            <div class="text-xs text-slate-400 font-medium">Service Categories</div>
          </div>
          <div class="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <div id="stat-response" class="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">15 Mins</div>
            <div class="text-xs text-slate-400 font-medium">Avg. Provider Response</div>
          </div>
        </div>

        <!-- Core Values / Pillars -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-white tracking-tight">Our Core Operational Pillars</h2>
            <p class="text-xs text-slate-400 mt-1">Built from day one for safety, speed, and absolute quality.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <i data-lucide="shield-check" class="w-6 h-6"></i>
              </div>
              <h3 class="font-bold text-white text-base">Multi-Step Provider Vetting</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Every service professional undergoes criminal background checks, trade credential verification, and practical skills evaluation before receiving their first booking.
              </p>
            </div>

            <div class="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <i data-lucide="file-text" class="w-6 h-6"></i>
              </div>
              <h3 class="font-bold text-white text-base">Itemized Invoicing & Escrow</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                No arbitrary pricing or surprise quotes. Get itemized line items for service fees, labor costs, and genuine replacement parts with complete cost breakdowns.
              </p>
            </div>

            <div class="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <i data-lucide="zap" class="w-6 h-6"></i>
              </div>
              <h3 class="font-bold text-white text-base">Real-time Coordination & Chat</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Coordinate smoothly through instant real-time in-app chat, direct status notifications, and interactive booking lifecycle management from start to finish.
              </p>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div class="text-center max-w-xl mx-auto">
            <h2 class="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p class="text-xs text-slate-400 mt-1">Everything you need to know about booking and paying on Servora.</p>
          </div>

          <div class="space-y-3 max-w-3xl mx-auto text-xs" id="faq-accordion-list">
            <!-- FAQ 1 -->
            <div class="faq-item rounded-xl bg-slate-900/60 border border-slate-800 transition overflow-hidden">
              <button type="button" onclick="window.toggleFaq(this)" class="w-full p-4 text-left font-bold text-white text-sm flex items-center justify-between hover:text-sky-300 transition">
                <span>How does the booking and payment process work?</span>
                <i data-lucide="chevron-down" class="faq-icon w-4 h-4 text-sky-400 transform transition duration-300"></i>
              </button>
              <div class="faq-answer px-4 pb-4 text-slate-400 leading-relaxed text-xs">
                Choose a service, select your preferred time slot and address, and submit the booking. The provider will review and accept your request. Once the work is performed on-site, the provider submits an itemized invoice and you settle the payment via Cash on Delivery. The provider then confirms receipt in the app.
              </div>
            </div>

            <!-- FAQ 2 -->
            <div class="faq-item rounded-xl bg-slate-900/60 border border-slate-800 transition overflow-hidden">
              <button type="button" onclick="window.toggleFaq(this)" class="w-full p-4 text-left font-bold text-white text-sm flex items-center justify-between hover:text-sky-300 transition">
                <span>Are all service technicians background-checked?</span>
                <i data-lucide="chevron-down" class="faq-icon w-4 h-4 text-sky-400 transform transition duration-300"></i>
              </button>
              <div class="faq-answer px-4 pb-4 text-slate-400 leading-relaxed text-xs hidden">
                Yes. Every single provider on Servora is identity-verified and reviewed by our admin moderation team with real verified customer reviews.
              </div>
            </div>

            <!-- FAQ 3 -->
            <div class="faq-item rounded-xl bg-slate-900/60 border border-slate-800 transition overflow-hidden">
              <button type="button" onclick="window.toggleFaq(this)" class="w-full p-4 text-left font-bold text-white text-sm flex items-center justify-between hover:text-sky-300 transition">
                <span>What if I am unsatisfied with the service quality?</span>
                <i data-lucide="chevron-down" class="faq-icon w-4 h-4 text-sky-400 transform transition duration-300"></i>
              </button>
              <div class="faq-answer px-4 pb-4 text-slate-400 leading-relaxed text-xs hidden">
                Servora offers a 100% Satisfaction Guarantee. If any service is not completed to professional standards, our resolution team steps in to arrange a free re-work or immediate refund.
              </div>
            </div>

            <!-- FAQ 4 -->
            <div class="faq-item rounded-xl bg-slate-900/60 border border-slate-800 transition overflow-hidden">
              <button type="button" onclick="window.toggleFaq(this)" class="w-full p-4 text-left font-bold text-white text-sm flex items-center justify-between hover:text-sky-300 transition">
                <span>Can I chat directly with the provider before they arrive?</span>
                <i data-lucide="chevron-down" class="faq-icon w-4 h-4 text-sky-400 transform transition duration-300"></i>
              </button>
              <div class="faq-answer px-4 pb-4 text-slate-400 leading-relaxed text-xs hidden">
                Yes! As soon as your booking is accepted, a dedicated real-time chat room is created where you can message, coordinate timings, and send photos or special instructions directly to your provider.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    window.toggleFaq = (btn) => {
      const item = btn.closest('.faq-item');
      const answer = item?.querySelector('.faq-answer');
      const icon = item?.querySelector('.faq-icon');
      if (!answer) return;

      const isHidden = answer.classList.contains('hidden');

      // Close all other open FAQ answers
      document.querySelectorAll('#faq-accordion-list .faq-item').forEach((other) => {
        const otherAnswer = other.querySelector('.faq-answer');
        const otherIcon = other.querySelector('.faq-icon');
        if (otherAnswer) otherAnswer.classList.add('hidden');
        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
      });

      // If clicked item was hidden, open it now
      if (isHidden) {
        answer.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    };

    if (window.lucide) window.lucide.createIcons();

    // Dynamically load category metrics
    try {
      const catsRes = await ApiClient.get('/categories');
      const totalCats = catsRes.data?.categories?.length || 24;
      const catEl = document.getElementById('stat-categories');
      if (catEl) catEl.textContent = `${totalCats}+`;
    } catch (_) {}
  }
}

export class ContactPage {
  static render(container) {
    container.innerHTML = `
      <div class="py-12 px-4 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        <div class="text-center max-w-2xl mx-auto">
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
            <i data-lucide="headset" class="w-3.5 h-3.5"></i>
            <span>24/7 Platform Support</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white">Get in Touch with Our Team</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-2">Have a question about a booking, becoming a provider, or partnership? We're here to help.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Contact Info Cards -->
          <div class="space-y-4 md:col-span-1">
            <div class="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div class="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-1">
                <i data-lucide="mail" class="w-4 h-4"></i>
              </div>
              <h4 class="font-bold text-white text-xs">Email Inquiries</h4>
              <p class="text-[11px] text-slate-400">support@servora.com</p>
              <p class="text-[11px] text-slate-400">partners@servora.com</p>
            </div>

            <div class="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                <i data-lucide="phone" class="w-4 h-4"></i>
              </div>
              <h4 class="font-bold text-white text-xs">Direct Phone Line</h4>
              <p class="text-[11px] text-slate-400">+92 (042) 111-737-842</p>
              <p class="text-[10px] text-slate-500">Mon - Sat: 8:00 AM - 10:00 PM</p>
            </div>

            <div class="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1">
                <i data-lucide="map-pin" class="w-4 h-4"></i>
              </div>
              <h4 class="font-bold text-white text-xs">Headquarters</h4>
              <p class="text-[11px] text-slate-400">Gulberg III, Main Boulevard, Lahore, Pakistan</p>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 md:col-span-2 shadow-2xl space-y-5">
            <div>
              <h3 class="font-bold text-white text-base">Send Us a Direct Message</h3>
              <p class="text-[11px] text-slate-400 mt-0.5">Your inquiry is logged into our support ticketing system. Our moderation team replies directly to your submitted email address.</p>
            </div>

            <form onsubmit="window.handleContactSubmit(event)" class="space-y-4 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold text-slate-300 mb-1.5">Full Name *</label>
                  <input id="contact-name" type="text" required placeholder="e.g. Usman Ali" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-300 mb-1.5">Email Address *</label>
                  <input id="contact-email" type="email" required placeholder="name@domain.com" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Subject / Topic *</label>
                <input id="contact-subject" type="text" required placeholder="e.g. Invoicing Inquiry / Provider Onboarding" class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs" />
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Message Body *</label>
                <textarea id="contact-message" rows="4" required placeholder="Describe your question, issue, or feedback in detail..." class="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"></textarea>
              </div>

              <button type="submit" id="contact-submit-btn" class="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition">
                Submit Message
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    window.handleContactSubmit = async (event) => {
      event.preventDefault();
      const btn = document.getElementById('contact-submit-btn');
      const name = document.getElementById('contact-name')?.value?.trim();
      const email = document.getElementById('contact-email')?.value?.trim();
      const subject = document.getElementById('contact-subject')?.value?.trim();
      const message = document.getElementById('contact-message')?.value?.trim();

      if (!name || !email || !subject || !message) return;

      if (btn) { btn.disabled = true; btn.textContent = 'Sending Message...'; }

      try {
        await ApiClient.post('/contact', { name, email, subject, message });
        Toast.success(
          `Thank you ${name}! Your inquiry has been sent to our support desk. We will reply directly to ${email} within 2 hours.`,
          'Message Delivered'
        );
        event.target.reset();
      } catch (err) {
        Toast.error(err.message || 'Failed to send message. Please try again.');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Submit Message'; }
      }
    };
  }
}
