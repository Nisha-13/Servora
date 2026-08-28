import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Service } from '../src/models/Service.js';
import { Booking } from '../src/models/Booking.js';
import { Invoice } from '../src/models/Invoice.js';
import { Payment } from '../src/models/Payment.js';
import { Review } from '../src/models/Review.js';
import { Favorite } from '../src/models/Favorite.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';
import { Notification } from '../src/models/Notification.js';
import { ActivityLog } from '../src/models/ActivityLog.js';
import { ROLES } from '../src/constants/roles.js';
import { BOOKING_STATUS } from '../src/constants/bookingStatus.js';
import { INVOICE_STATUS, PAYMENT_STATUS } from '../src/constants/paymentStatus.js';
import { NOTIFICATION_TYPES } from '../src/constants/notificationTypes.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servora';

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB at', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      Favorite.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    const defaultPassword = 'Password123!';
    const adminPassword = 'Admin123!';

    console.log('[Seeder] Creating Users...');
    const [admin, provider1, provider2, provider3, customer1, customer2, customer3] = await Promise.all([
      User.create({
        name: 'Super Admin',
        email: 'admin@servora.com',
        password: adminPassword,
        role: ROLES.ADMIN,
        phone: '+92 300 1234567',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        address: { street: 'Main Boulevard, Gulberg III', city: 'Lahore', state: 'Punjab', zipCode: '54000' },
        isActive: true
      }),
      User.create({
        name: 'Ahmed Khan (Pro Cool AC & Electric)',
        email: 'ahmed.tech@servora.com',
        password: defaultPassword,
        role: ROLES.PROVIDER,
        phone: '+92 301 9876543',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        address: { street: 'DHA Phase 5, Commercial', city: 'Lahore', state: 'Punjab', zipCode: '54792' },
        isActive: true,
        providerProfile: {
          bio: 'Certified HVAC technician & Master Electrician with 10+ years experience in inverter ACs and commercial electrical systems.',
          experienceYears: 10,
          rating: 4.9,
          reviewCount: 48,
          isVerified: true,
          serviceAreas: ['Lahore', 'Gulberg', 'DHA', 'Model Town', 'Johar Town'],
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            startTime: '08:00',
            endTime: '20:00',
            isAvailable: true
          }
        }
      }),
      User.create({
        name: 'Sara Malik (Prime Auto Spa & Detailing)',
        email: 'sara.auto@servora.com',
        password: defaultPassword,
        role: ROLES.PROVIDER,
        phone: '+92 321 4567890',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        address: { street: 'Sector F-7/2', city: 'Islamabad', state: 'Federal', zipCode: '44000' },
        isActive: true,
        providerProfile: {
          bio: 'Automotive detailing specialist offering ceramic coating, paint correction, interior steam deep-clean, and mobile doorstep mechanics.',
          experienceYears: 6,
          rating: 4.8,
          reviewCount: 32,
          isVerified: true,
          serviceAreas: ['Islamabad', 'Rawalpindi', 'Bahria Town', 'F-7', 'Blue Area'],
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
            startTime: '09:00',
            endTime: '19:00',
            isAvailable: true
          }
        }
      }),
      User.create({
        name: 'Bilal Tariq (TechFix Systems)',
        email: 'bilal.dev@servora.com',
        password: defaultPassword,
        role: ROLES.PROVIDER,
        phone: '+92 333 7654321',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        address: { street: 'Clifton Block 4', city: 'Karachi', state: 'Sindh', zipCode: '75600' },
        isActive: true,
        providerProfile: {
          bio: 'Hardware engineer and networking specialist. Laptop board-level repair, CCTV security setup, and home smart-office infrastructure.',
          experienceYears: 8,
          rating: 4.9,
          reviewCount: 26,
          isVerified: true,
          serviceAreas: ['Karachi', 'Clifton', 'DHA', 'PECHS', 'Gulshan-e-Iqbal'],
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '10:00',
            endTime: '21:00',
            isAvailable: true
          }
        }
      }),
      User.create({
        name: 'Usman Ali',
        email: 'usman.customer@servora.com',
        password: defaultPassword,
        role: ROLES.CUSTOMER,
        phone: '+92 302 1122334',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop',
        address: { street: 'House 42, Street 10, DHA Phase 6', city: 'Lahore', state: 'Punjab', zipCode: '54792' },
        isActive: true
      }),
      User.create({
        name: 'Fatima Noor',
        email: 'fatima.customer@servora.com',
        password: defaultPassword,
        role: ROLES.CUSTOMER,
        phone: '+92 322 5566778',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        address: { street: 'Apartment 5B, Silver Oaks, F-10', city: 'Islamabad', state: 'Federal', zipCode: '44000' },
        isActive: true
      }),
      User.create({
        name: 'Hamza Rauf',
        email: 'hamza.customer@servora.com',
        password: defaultPassword,
        role: ROLES.CUSTOMER,
        phone: '+92 345 9988776',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
        address: { street: 'Villa 14, 26th Street, DHA Phase 5', city: 'Karachi', state: 'Sindh', zipCode: '75600' },
        isActive: true
      })
    ]);

    console.log('[Seeder] Creating Categories across 5 Groups...');
    const categoryData = [
    // Home Services
      { name: 'AC Repair', slug: 'ac-repair', group: 'Home Services', icon: 'wrench', description: 'AC diagnostics, gas leak repair, cooling issues, and capacitor replacement.' },
      { name: 'AC Installation', slug: 'ac-installation', group: 'Home Services', icon: 'wind', description: 'Complete split and inverter AC unmounting, mounting, and copper piping setup.' },
      { name: 'AC Maintenance', slug: 'ac-maintenance', group: 'Home Services', icon: 'shield-check', description: 'Seasonal chemical jet wash, filter cleaning, and energy efficiency tuning.' },
      { name: 'Plumbing', slug: 'plumbing', group: 'Home Services', icon: 'droplet', description: 'Pipe leak repairs, geyser installation, sanitary fixtures, and motor pumps.' },
      { name: 'Electrical', slug: 'electrical', group: 'Home Services', icon: 'zap', description: 'UPS installation, short circuit fixes, wiring, breaker boards, and lighting.' },
      { name: 'Carpentry', slug: 'carpentry', group: 'Home Services', icon: 'hammer', description: 'Door repair, custom cabinets, lock fixes, furniture assembly, and polishing.' },
      { name: 'Home Cleaning', slug: 'home-cleaning', group: 'Home Services', icon: 'sparkles', description: 'Full house standard cleaning, kitchen degreasing, and floor scrubbing.' },
      { name: 'Deep Cleaning', slug: 'deep-cleaning', group: 'Home Services', icon: 'sparkles', description: 'Intensive upholstery steam wash, sofa shampooing, and post-construction clean.' },
      { name: 'Pest Control', slug: 'pest-control', group: 'Home Services', icon: 'shield-alert', description: 'Termite proofing, cockroach spray, bedbug eradication, and fumigation.' },
      { name: 'Appliance Repair', slug: 'appliance-repair', group: 'Home Services', icon: 'tv', description: 'Refrigerator, washing machine, microwave, and water dispenser repairs.' },

      // Automotive
      { name: 'Car Wash', slug: 'car-wash', group: 'Automotive', icon: 'car', description: 'Doorstep high-pressure foam wash, interior vacuuming, and dashboard polish.' },
      { name: 'Car Detailing', slug: 'car-detailing', group: 'Automotive', icon: 'sparkles', description: '3-stage paint correction, ceramic quartz coating, and interior restoration.' },
      { name: 'Car Repair', slug: 'car-repair', group: 'Automotive', icon: 'wrench', description: 'Brake pad replacement, suspension check, engine tuning, and diagnostics.' },
      { name: 'Car AC Repair', slug: 'car-ac-repair', group: 'Automotive', icon: 'wind', description: 'Auto AC compressor overhaul, gas recharge R134a, and cooling coil flush.' },
      { name: 'Oil Change', slug: 'oil-change', group: 'Automotive', icon: 'droplet', description: 'Doorstep synthetic engine oil change with genuine OEM filter replacement.' },
      { name: 'Battery Replacement', slug: 'battery-replacement', group: 'Automotive', icon: 'battery-charging', description: 'Instant dry/acid battery delivery, testing, terminal cleaning, and fitting.' },
      { name: 'Tyre Service', slug: 'tyre-service', group: 'Automotive', icon: 'disc', description: 'Tyre puncture assistance, wheel balancing, rotation, and replacement.' },

      // Technology
      { name: 'Computer Repair', slug: 'computer-repair', group: 'Technology', icon: 'cpu', description: 'Desktop PC troubleshooting, power supply fixes, OS install, and malware removal.' },
      { name: 'Laptop Repair', slug: 'laptop-repair', group: 'Technology', icon: 'laptop', description: 'Screen replacement, keyboard repair, hinge fixes, and motherboard rework.' },
      { name: 'CCTV Installation', slug: 'cctv-installation', group: 'Technology', icon: 'camera', description: 'IP camera setup, DVR/NVR configuration, remote mobile view, and cabling.' },
      { name: 'Network Setup', slug: 'network-setup', group: 'Technology', icon: 'wifi', description: 'Wi-Fi mesh deployment, router config, CAT6 cabling, and signal boosting.' },
      { name: 'Printer Repair', slug: 'printer-repair', group: 'Technology', icon: 'printer', description: 'LaserJet and InkJet head cleaning, cartridge refilling, and paper jam repair.' },

      // Personal Care
      { name: 'Salon at Home', slug: 'salon-at-home', group: 'Personal Care', icon: 'scissors', description: 'Complete beauty salon treatments in the comfort of your private home.' },
      { name: 'Haircut', slug: 'haircut', group: 'Personal Care', icon: 'scissors', description: 'Modern hair styling, trimming, beard grooming, and hot towel treatment.' },
      { name: 'Makeup', slug: 'makeup', group: 'Personal Care', icon: 'heart', description: 'Party, engagement, and bridal makeup by certified aesthetic artists.' },
      { name: 'Manicure/Pedicure', slug: 'manicure-pedicure', group: 'Personal Care', icon: 'smile', description: 'Relaxing herbal foot soak, scrub, nail cuticle care, and massage.' },

      // Professional
      { name: 'Photography', slug: 'photography', group: 'Professional', icon: 'camera', description: 'Event coverage, portrait sessions, product photography, and drone video.' },
      { name: 'Graphic Design', slug: 'graphic-design', group: 'Professional', icon: 'palette', description: 'Branding, logo design, social media banners, vector illustration, and print.' },
      { name: 'Tutoring', slug: 'tutoring', group: 'Professional', icon: 'book-open', description: 'One-on-one academic tutoring for O/A Levels, Matric, and University STEM.' },
      { name: 'Video Editing', slug: 'video-editing', group: 'Professional', icon: 'video', description: 'YouTube video production, cinematic color grading, sound design, and reels.' },
      { name: 'Web Development', slug: 'web-development', group: 'Professional', icon: 'code', description: 'Modern responsive websites, custom web apps, e-commerce, and API systems.' }
    ];

    const categories = await Category.insertMany(
      categoryData.map((c, index) => ({ ...c, order: index + 1, isActive: true }))
    );

    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('[Seeder] Creating Realistic Services...');
    const services = await Service.insertMany([
      {
        name: 'Inverter AC Diagnostic & Master Repair',
        category: categoryMap['ac-repair'],
        provider: provider1._id,
        description: 'Complete fault diagnostics with digital gauges, PCB error code tracing, compressor testing, and electrical wiring inspection. Includes 30-day service warranty.',
        startingPrice: 2000,
        estimatedDuration: '1-2 hours',
        serviceArea: ['Lahore', 'Gulberg', 'DHA', 'Model Town', 'Johar Town', 'Cantt'],
        images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'],
        tags: ['ac repair', 'cooling', 'inverter', 'hvac', 'lahore'],
        isActive: true,
        rating: 4.9,
        reviewCount: 28
      },
      {
        name: 'Split AC Dismantling & Master Installation',
        category: categoryMap['ac-installation'],
        provider: provider1._id,
        description: 'Complete split and inverter AC unmounting, wall core drilling, mounting on vibration pads, and pure copper tubing flare connection.',
        startingPrice: 3000,
        estimatedDuration: '2-3 hours',
        serviceArea: ['Lahore', 'DHA', 'Gulberg', 'Model Town'],
        images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'],
        tags: ['ac installation', 'mounting', 'hvac', 'copper piping'],
        isActive: true,
        rating: 4.8,
        reviewCount: 15
      },
      {
        name: 'Split & Inverter AC Chemical Jet Wash',
        category: categoryMap['ac-maintenance'],
        provider: provider1._id,
        description: 'High-pressure chemical jet wash of indoor blower, cooling coils, drain tray, and outdoor condenser. Restores ice-cold cooling and reduces electricity consumption up to 25%.',
        startingPrice: 1800,
        estimatedDuration: '1 hour',
        serviceArea: ['Lahore', 'All Areas'],
        images: ['https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&h=600&fit=crop'],
        tags: ['ac service', 'jet wash', 'ac cleaning', 'cooling'],
        isActive: true,
        rating: 4.8,
        reviewCount: 20
      },
      {
        name: 'Master Sanitary & Leakage Plumbing Service',
        category: categoryMap['plumbing'],
        provider: provider1._id,
        description: 'Expert diagnostics for concealed wall leakages, PPRC pipe fusion repair, bathroom mixer replacement, drainage unclogging, and automatic water pump maintenance.',
        startingPrice: 1500,
        estimatedDuration: '1-2 hours',
        serviceArea: ['Lahore', 'DHA', 'Cantt'],
        images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600&fit=crop'],
        tags: ['plumber', 'sanitary', 'leakage', 'pipe repair'],
        isActive: true,
        rating: 4.9,
        reviewCount: 22
      },
      {
        name: 'Residential Electrical Inspection & DB Board Repair',
        category: categoryMap['electrical'],
        provider: provider1._id,
        description: 'Comprehensive electrical safety inspection, breaker replacement, short-circuit diagnostics, UPS and solar inverter connection checking.',
        startingPrice: 2500,
        estimatedDuration: '2-3 hours',
        serviceArea: ['Lahore', 'DHA', 'Gulberg'],
        images: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop'],
        tags: ['electrician', 'wiring', 'circuit', 'ups'],
        isActive: true,
        rating: 5.0,
        reviewCount: 12
      },
      {
        name: 'Custom Carpentry & Door Lock Installation',
        category: categoryMap['carpentry'],
        provider: provider1._id,
        description: 'Door hinge realignment, smart digital lock installation, kitchen cabinet repair, custom drawer sliders, and wood polishing.',
        startingPrice: 1800,
        estimatedDuration: '1-3 hours',
        serviceArea: ['Lahore', 'Gulberg', 'Johar Town'],
        images: ['https://images.unsplash.com/photo-1502005229762-ee1b2da97ba4?w=800&h=600&fit=crop'],
        tags: ['carpentry', 'woodwork', 'furniture', 'locks'],
        isActive: true,
        rating: 4.7,
        reviewCount: 14
      },
      {
        name: 'Full House Standard Cleaning & Kitchen Degrease',
        category: categoryMap['home-cleaning'],
        provider: provider1._id,
        description: 'Thorough dusting, vacuuming, floor scrubbing, window wipe-down, bathroom sanitization, and heavy kitchen tile degreasing.',
        startingPrice: 3500,
        estimatedDuration: '3-4 hours',
        serviceArea: ['Lahore', 'DHA', 'Cantt', 'Model Town'],
        images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
        tags: ['cleaning', 'maid', 'housekeeping', 'sanitization'],
        isActive: true,
        rating: 4.9,
        reviewCount: 31
      },
      {
        name: 'Sofa & Upholstery Deep Steam Shampooing',
        category: categoryMap['deep-cleaning'],
        provider: provider1._id,
        description: '7-seater sofa set and dining chair high-suction chemical shampoo extraction. Removes stubborn coffee/oil stains, dust mites, and odors.',
        startingPrice: 3000,
        estimatedDuration: '2 hours',
        serviceArea: ['Lahore', 'All Areas'],
        images: ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=600&fit=crop'],
        tags: ['sofa cleaning', 'steam wash', 'deep clean', 'upholstery'],
        isActive: true,
        rating: 4.8,
        reviewCount: 25
      },
      {
        name: 'Eco-Friendly Pest Control & Termite Proofing',
        category: categoryMap['pest-control'],
        provider: provider1._id,
        description: 'Odorless Bayer spray treatment for cockroaches, ants, lizards, and targeted chemical injection for underground termite eradication with 1-year warranty.',
        startingPrice: 4500,
        estimatedDuration: '2 hours',
        serviceArea: ['Lahore', 'All Areas'],
        images: ['https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&h=600&fit=crop'],
        tags: ['pest control', 'fumigation', 'termite', 'cockroach'],
        isActive: true,
        rating: 4.8,
        reviewCount: 16
      },
      {
        name: 'Automatic Washing Machine & Refrigerator Repair',
        category: categoryMap['appliance-repair'],
        provider: provider1._id,
        description: 'Front-load/top-load automatic washer motor diagnostics, drain pump repair, inverter fridge gas recharging, and thermostat fixing.',
        startingPrice: 2000,
        estimatedDuration: '1-2 hours',
        serviceArea: ['Lahore', 'DHA', 'Johar Town'],
        images: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=600&fit=crop'],
        tags: ['appliance repair', 'washing machine', 'fridge repair'],
        isActive: true,
        rating: 4.7,
        reviewCount: 19
      },
      {
        name: 'Doorstep High-Pressure Snow Foam Car Wash',
        category: categoryMap['car-wash'],
        provider: provider2._id,
        description: 'pH-neutral snow foam wash with pressure washer, microfiber scratch-free mitts, wheel rim de-ironization, tire shine, and interior vacuuming.',
        startingPrice: 1500,
        estimatedDuration: '1 hour',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop'],
        tags: ['car wash', 'foam wash', 'auto spa', 'doorstep'],
        isActive: true,
        rating: 4.9,
        reviewCount: 40
      },
      {
        name: 'Doorstep Ceramic Detail & Paint Polish',
        category: categoryMap['car-detailing'],
        provider: provider2._id,
        description: 'Professional multi-stage machine compounding and polish to eliminate swirl marks, followed by premium 9H hydrophobic ceramic protection coating.',
        startingPrice: 6500,
        estimatedDuration: '3-4 hours',
        serviceArea: ['Islamabad', 'Rawalpindi', 'Bahria Town', 'DHA'],
        images: ['https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop'],
        tags: ['car detailing', 'ceramic coating', 'polish', 'car spa'],
        isActive: true,
        rating: 4.8,
        reviewCount: 19
      },
      {
        name: 'Complete Brake Pad & Suspension Diagnostics',
        category: categoryMap['car-repair'],
        provider: provider2._id,
        description: 'Comprehensive inspection of shock absorbers, steering rack bushings, rotor disc resurfacing, and OEM brake pad replacements.',
        startingPrice: 3500,
        estimatedDuration: '2-3 hours',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&h=600&fit=crop'],
        tags: ['car mechanic', 'brake pad', 'suspension', 'tuning'],
        isActive: true,
        rating: 4.8,
        reviewCount: 21
      },
      {
        name: 'Automotive AC Gas Recharge R134a & Coil Flush',
        category: categoryMap['car-ac-repair'],
        provider: provider2._id,
        description: 'Automotive AC vacuum check, leak test with UV dye, compressor oil replenishment, and pure Honeywell R134a refrigerant charge.',
        startingPrice: 3200,
        estimatedDuration: '1-2 hours',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop'],
        tags: ['car ac', 'gas charge', 'cooling', 'compressor'],
        isActive: true,
        rating: 4.9,
        reviewCount: 17
      },
      {
        name: 'Mobile Doorstep Synthetic Oil Change & 20-Point Check',
        category: categoryMap['oil-change'],
        provider: provider2._id,
        description: 'Premium synthetic motor oil replacement (Total / Shell / Mobil), OEM filter change, brake fluid check, battery health test, and tyre pressure adjustment.',
        startingPrice: 4000,
        estimatedDuration: '45 mins',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop'],
        tags: ['oil change', 'car service', 'maintenance', 'mechanic'],
        isActive: true,
        rating: 4.9,
        reviewCount: 13
      },
      {
        name: 'Emergency Car Battery Replacement & Alternator Test',
        category: categoryMap['battery-replacement'],
        provider: provider2._id,
        description: 'Fast 30-minute delivery and installation of maintenance-free AGM / Dry batteries (AGS / Daewoo / Hankook) with full warranty and old battery buyback.',
        startingPrice: 2000,
        estimatedDuration: '30 mins',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop'],
        tags: ['car battery', 'jump start', 'alternator', 'emergency'],
        isActive: true,
        rating: 5.0,
        reviewCount: 29
      },
      {
        name: 'Mobile Tyre Puncture & Wheel Balancing',
        category: categoryMap['tyre-service'],
        provider: provider2._id,
        description: 'On-site tubeless puncture patching, high-precision electronic wheel balancing, tire rotation, and nitrogen gas inflation.',
        startingPrice: 1200,
        estimatedDuration: '40 mins',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&h=600&fit=crop'],
        tags: ['tyre service', 'puncture', 'wheel alignment', 'balancing'],
        isActive: true,
        rating: 4.7,
        reviewCount: 15
      },
      {
        name: 'Gaming Desktop PC Custom Assembly & Diagnostics',
        category: categoryMap['computer-repair'],
        provider: provider3._id,
        description: 'Custom PC build, cable management, GPU overheating fixes, liquid cooler setup, BIOS flashing, and Windows 11 optimization.',
        startingPrice: 2500,
        estimatedDuration: '2 hours',
        serviceArea: ['Karachi', 'Clifton', 'DHA', 'Gulshan'],
        images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&h=600&fit=crop'],
        tags: ['computer repair', 'pc build', 'gaming pc', 'windows'],
        isActive: true,
        rating: 4.9,
        reviewCount: 22
      },
      {
        name: 'Motherboard Level Laptop Repair & Thermal Service',
        category: categoryMap['laptop-repair'],
        provider: provider3._id,
        description: 'Chip-level motherboard diagnosis, GPU reballing, power rail IC repair, liquid damage treatment, and high-performance thermal paste re-application.',
        startingPrice: 3500,
        estimatedDuration: '2-4 hours',
        serviceArea: ['Karachi', 'Clifton', 'DHA', 'PECHS'],
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop'],
        tags: ['laptop repair', 'motherboard', 'macbook', 'hardware'],
        isActive: true,
        rating: 4.9,
        reviewCount: 18
      },
      {
        name: 'High-Definition CCTV Security System Installation',
        category: categoryMap['cctv-installation'],
        provider: provider3._id,
        description: 'Turnkey 4/8-camera Hikvision/Dahua 4K IP security camera installation with Night Vision, NVR setup, hard drive recording, and mobile remote live feed configuration.',
        startingPrice: 5000,
        estimatedDuration: '3-5 hours',
        serviceArea: ['Karachi', 'All Areas'],
        images: ['https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&h=600&fit=crop'],
        tags: ['cctv', 'security', 'camera', 'surveillance'],
        isActive: true,
        rating: 4.9,
        reviewCount: 8
      },
      {
        name: 'Commercial Wi-Fi Mesh & Gigabit Network Setup',
        category: categoryMap['network-setup'],
        provider: provider3._id,
        description: 'CAT6 network cable routing, patch panel punch down, TP-Link Deco mesh Wi-Fi optimization, firewall configuration, and dead spot elimination.',
        startingPrice: 3000,
        estimatedDuration: '2-3 hours',
        serviceArea: ['Karachi', 'Clifton', 'DHA'],
        images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop'],
        tags: ['networking', 'wifi mesh', 'router', 'cabling'],
        isActive: true,
        rating: 4.8,
        reviewCount: 14
      },
      {
        name: 'LaserJet Printer Head Clean & Cartridge Refill',
        category: categoryMap['printer-repair'],
        provider: provider3._id,
        description: 'HP / Canon / Epson printer roller replacement, paper jam fix, scanner calibration, and toner cartridge refurbishment.',
        startingPrice: 1500,
        estimatedDuration: '1 hour',
        serviceArea: ['Karachi', 'DHA', 'PECHS'],
        images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&h=600&fit=crop'],
        tags: ['printer repair', 'laserjet', 'toner refill'],
        isActive: true,
        rating: 4.7,
        reviewCount: 11
      },
      {
        name: 'Luxury Organic Facial & Hair Treatment at Home',
        category: categoryMap['salon-at-home'],
        provider: provider2._id,
        description: 'Full Janssen herbal facial, steam treatment, blackhead extraction, hair protein mask, and relaxing neck/shoulder massage in the privacy of your home.',
        startingPrice: 4000,
        estimatedDuration: '2 hours',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop'],
        tags: ['salon at home', 'facial', 'spa', 'beauty'],
        isActive: true,
        rating: 5.0,
        reviewCount: 36
      },
      {
        name: 'Executive Haircut, Beard Styling & Hot Towel',
        category: categoryMap['haircut'],
        provider: provider2._id,
        description: 'Custom scissor/clipper haircut, beard shaping with straight razor, peppermint hot towel treatment, and charcoal face scrub.',
        startingPrice: 1500,
        estimatedDuration: '45 mins',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop'],
        tags: ['haircut', 'barber', 'grooming', 'beard style'],
        isActive: true,
        rating: 4.9,
        reviewCount: 42
      },
      {
        name: 'Bridal & Party Glam Makeup with HD Lashes',
        category: categoryMap['makeup'],
        provider: provider2._id,
        description: 'HD party and bridal makeup using authentic Huda Beauty, MAC, and NARS cosmetics, including 3D mink eyelashes and hairdo styling.',
        startingPrice: 8000,
        estimatedDuration: '2-3 hours',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop'],
        tags: ['makeup', 'bridal', 'party makeup', 'beauty'],
        isActive: true,
        rating: 4.9,
        reviewCount: 27
      },
      {
        name: 'Herbal Foot Spa, Manicure & Pedicure',
        category: categoryMap['manicure-pedicure'],
        provider: provider2._id,
        description: 'Aromatherapy sea salt foot soak, dead skin exfoliation, nail shaping, cuticle nourishment, and hot stone foot massage.',
        startingPrice: 2500,
        estimatedDuration: '1 hour',
        serviceArea: ['Islamabad', 'Rawalpindi'],
        images: ['https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&h=600&fit=crop'],
        tags: ['pedicure', 'manicure', 'foot spa', 'nails'],
        isActive: true,
        rating: 4.8,
        reviewCount: 18
      },
      {
        name: 'Professional Event & Portrait Photography',
        category: categoryMap['photography'],
        provider: provider3._id,
        description: 'Full event coverage with Sony A7IV 4K camera, high-speed prime lenses, wireless flash setup, and 100+ master edited high-res digital photos.',
        startingPrice: 12000,
        estimatedDuration: '4 hours',
        serviceArea: ['Karachi', 'All Areas'],
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop'],
        tags: ['photography', 'event coverage', 'photoshoot', 'portraits'],
        isActive: true,
        rating: 5.0,
        reviewCount: 15
      },
      {
        name: 'Brand Identity & Logo Design Vector Package',
        category: categoryMap['graphic-design'],
        provider: provider3._id,
        description: 'Custom minimalist logo design (3 concepts), complete brand typography guidelines, color palette, social media kit, and print-ready vector files (AI, SVG, PDF).',
        startingPrice: 6000,
        estimatedDuration: '2-3 days',
        serviceArea: ['Online / Remote (All Pakistan)'],
        images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop'],
        tags: ['graphic design', 'logo', 'branding', 'vector'],
        isActive: true,
        rating: 4.9,
        reviewCount: 23
      },
      {
        name: 'One-on-One O/A Level Math & Physics Tutoring',
        category: categoryMap['tutoring'],
        provider: provider3._id,
        description: 'Interactive Cambridge & Edexcel O/A Level Physics and Mathematics coaching with past paper drilling, topical worksheets, and concept reinforcement.',
        startingPrice: 5000,
        estimatedDuration: '1 month (12 sessions)',
        serviceArea: ['Online / Karachi'],
        images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop'],
        tags: ['tutoring', 'maths', 'physics', 'o levels', 'a levels'],
        isActive: true,
        rating: 5.0,
        reviewCount: 19
      },
      {
        name: 'Cinematic YouTube & Reel Video Post-Production',
        category: categoryMap['video-editing'],
        provider: provider3._id,
        description: 'Premiere Pro & DaVinci Resolve 4K video editing, dynamic subtitles, B-roll transitions, licensed sound effects, and color grading for viral YouTube and Instagram content.',
        startingPrice: 4500,
        estimatedDuration: '1-2 days',
        serviceArea: ['Online / Remote'],
        images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop'],
        tags: ['video editing', 'youtube', 'reels', 'davinci'],
        isActive: true,
        rating: 4.8,
        reviewCount: 14
      },
      {
        name: 'Custom Full-Stack Responsive Web Application',
        category: categoryMap['web-development'],
        provider: provider3._id,
        description: 'Custom tailored responsive business website or web application with modern responsive UI, secure REST API, database architecture, and SEO optimization.',
        startingPrice: 20000,
        estimatedDuration: '1-2 weeks',
        serviceArea: ['Online / Remote'],
        images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'],
        tags: ['web development', 'full stack', 'website', 'javascript'],
        isActive: true,
        rating: 5.0,
        reviewCount: 16
      }
    ]);

    console.log('[Seeder] Creating Realistic Booking Lifecycle Scenarios...');

    // Scenario 1: Fully Completed and PAID Booking with Invoice, Payment, and 5-Star Review
    const booking1 = await Booking.create({
      bookingNumber: 'BK-2026-904128',
      customer: customer1._id,
      provider: provider1._id,
      service: services[0]._id, // AC Diagnostic & Master Repair
      startingPrice: 2000,
      bookingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      timeSlot: '10:00 AM - 12:00 PM',
      address: {
        street: 'House 42, Street 10, DHA Phase 6',
        city: 'Lahore',
        state: 'Punjab',
        zipCode: '54792'
      },
      notes: 'Master bedroom 1.5-ton Dawlance inverter not cooling and throwing E6 communication code.',
      status: BOOKING_STATUS.PAID,
      hasReview: true,
      statusHistory: [
        { status: BOOKING_STATUS.PENDING, changedBy: customer1._id, note: 'Booking created', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: BOOKING_STATUS.ACCEPTED, changedBy: provider1._id, note: 'Provider accepted', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000) },
        { status: BOOKING_STATUS.IN_PROGRESS, changedBy: provider1._id, note: 'Provider started work on site', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000) },
        { status: BOOKING_STATUS.SERVICE_COMPLETED, changedBy: provider1._id, note: 'Work completed successfully', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000) },
        { status: BOOKING_STATUS.PAYMENT_PENDING, changedBy: provider1._id, note: 'Final itemized invoice generated', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 125 * 60 * 1000) },
        { status: BOOKING_STATUS.PAID, changedBy: provider1._id, note: 'Cash payment received and confirmed by provider', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 150 * 60 * 1000) }
      ]
    });

    const invoice1 = await Invoice.create({
      invoiceNumber: 'INV-2026-802154',
      booking: booking1._id,
      customer: customer1._id,
      provider: provider1._id,
      items: [
        { title: 'Inverter AC Diagnostic & Inspection', amount: 2000, type: 'SERVICE', description: 'PCB diagnostic and gas leak test' },
        { title: 'Outdoor PCB Capacitor & Relay Replacement', amount: 1500, type: 'PARTS', description: 'Original high-spec electrolytic capacitor' },
        { title: 'Specialist PCB Soldering & Reconnection Labor', amount: 1000, type: 'LABOR', description: 'On-site circuit restoration' }
      ],
      serviceFee: 2000,
      partsFee: 1500,
      laborFee: 1000,
      extraFee: 0,
      tax: 0,
      discount: 0,
      totalAmount: 4500,
      paymentMethod: 'CASH_ON_DELIVERY',
      status: INVOICE_STATUS.PAID,
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 150 * 60 * 1000),
      confirmedBy: provider1._id
    });

    booking1.invoice = invoice1._id;
    await booking1.save();

    await Payment.create({
      transactionId: 'COD-2026-554101',
      booking: booking1._id,
      invoice: invoice1._id,
      customer: customer1._id,
      provider: provider1._id,
      amount: 4500,
      currency: 'pkr',
      paymentMethod: 'CASH_ON_DELIVERY',
      status: PAYMENT_STATUS.COMPLETED,
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 150 * 60 * 1000),
      confirmedBy: provider1._id
    });

    await Review.create({
      booking: booking1._id,
      customer: customer1._id,
      provider: provider1._id,
      service: services[0]._id,
      rating: 5,
      comment: 'Ahmed is an absolute lifesaver! Found the exact PCB issue within 20 minutes and had the spare parts ready. The AC is chilling like day one now. Highly recommended!',
      providerReply: {
        comment: 'Thank you Usman! Glad we could resolve the E6 code swiftly for you. Reach out anytime!',
        repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      isVisible: true
    });

    // Scenario 2: Booking in PAYMENT_PENDING state (Ready for provider to confirm cash payment receipt)
    const booking2 = await Booking.create({
      bookingNumber: 'BK-2026-904129',
      customer: customer1._id,
      provider: provider2._id,
      service: services[3]._id, // Car Detailing
      startingPrice: 6500,
      bookingDate: new Date(),
      timeSlot: '02:00 PM - 05:00 PM',
      address: {
        street: 'House 42, Street 10, DHA Phase 6',
        city: 'Lahore',
        state: 'Punjab',
        zipCode: '54792'
      },
      notes: 'Ceramic polish for Honda Civic 2022.',
      status: BOOKING_STATUS.PAYMENT_PENDING,
      statusHistory: [
        { status: BOOKING_STATUS.PENDING, changedBy: customer1._id, note: 'Booking requested', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
        { status: BOOKING_STATUS.ACCEPTED, changedBy: provider2._id, note: 'Provider accepted', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
        { status: BOOKING_STATUS.IN_PROGRESS, changedBy: provider2._id, note: 'Detailing underway', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { status: BOOKING_STATUS.SERVICE_COMPLETED, changedBy: provider2._id, note: 'Detailing completed', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
        { status: BOOKING_STATUS.PAYMENT_PENDING, changedBy: provider2._id, note: 'Final invoice generated', timestamp: new Date(Date.now() - 20 * 60 * 1000) }
      ]
    });

    const invoice2 = await Invoice.create({
      invoiceNumber: 'INV-2026-802155',
      booking: booking2._id,
      customer: customer1._id,
      provider: provider2._id,
      items: [
        { title: 'Doorstep Ceramic Detail & Paint Polish', amount: 6500, type: 'SERVICE', description: '3-stage compounding' },
        { title: 'Hydrophobic Glass Treatment Sealant', amount: 1500, type: 'PARTS', description: 'Rain-repellent windscreen coating' },
        { title: 'Interior Steam Odor Elimination Labor', amount: 1000, type: 'LABOR', description: 'AC vent sanitization' }
      ],
      serviceFee: 6500,
      partsFee: 1500,
      laborFee: 1000,
      extraFee: 0,
      tax: 0,
      discount: 0,
      totalAmount: 9000,
      status: INVOICE_STATUS.PENDING,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    booking2.invoice = invoice2._id;
    await booking2.save();

    // Scenario 3: Booking in PENDING state (Ready for provider to Accept/Reject)
    await Booking.create({
      bookingNumber: 'BK-2026-904130',
      customer: customer2._id,
      provider: provider1._id,
      service: services[1]._id, // AC Jet Wash
      startingPrice: 1800,
      bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      timeSlot: '11:00 AM - 12:00 PM',
      address: {
        street: 'Apartment 5B, Silver Oaks, F-10',
        city: 'Islamabad',
        state: 'Federal',
        zipCode: '44000'
      },
      notes: 'Need full jet wash for two split units before summer heat.',
      status: BOOKING_STATUS.PENDING,
      statusHistory: [
        { status: BOOKING_STATUS.PENDING, changedBy: customer2._id, note: 'Booking submitted', timestamp: new Date() }
      ]
    });

    // Scenario 4: Booking in IN_PROGRESS state (Ready for provider to Complete & Invoice)
    await Booking.create({
      bookingNumber: 'BK-2026-904131',
      customer: customer3._id,
      provider: provider3._id,
      service: services[5]._id, // Laptop Repair
      startingPrice: 3500,
      bookingDate: new Date(),
      timeSlot: '03:00 PM - 06:00 PM',
      address: {
        street: 'Villa 14, 26th Street, DHA Phase 5',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75600'
      },
      notes: 'Dell XPS 15 overheating and shutting down under load.',
      status: BOOKING_STATUS.IN_PROGRESS,
      statusHistory: [
        { status: BOOKING_STATUS.PENDING, changedBy: customer3._id, note: 'Booking requested', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
        { status: BOOKING_STATUS.ACCEPTED, changedBy: provider3._id, note: 'Provider accepted', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { status: BOOKING_STATUS.IN_PROGRESS, changedBy: provider3._id, note: 'Diagnosis & thermal overhaul in progress', timestamp: new Date(Date.now() - 30 * 60 * 1000) }
      ]
    });

    console.log('[Seeder] Creating Favorites...');
    await Promise.all([
      Favorite.create({ customer: customer1._id, provider: provider1._id }),
      Favorite.create({ customer: customer1._id, provider: provider2._id }),
      Favorite.create({ customer: customer2._id, provider: provider1._id })
    ]);

    console.log('[Seeder] Creating Chat Conversations & Messages...');
    const conv1 = await Conversation.create({
      participants: [customer1._id, provider1._id],
      booking: booking1._id,
      lastMessage: 'All working smoothly now, thanks again!',
      lastMessageSender: customer1._id,
      lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unreadCount: { [customer1._id.toString()]: 0, [provider1._id.toString()]: 0 }
    });

    await Message.insertMany([
      {
        conversation: conv1._id,
        sender: customer1._id,
        recipient: provider1._id,
        text: 'Hi Ahmed, are you on your way to DHA Phase 6?',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000)
      },
      {
        conversation: conv1._id,
        sender: provider1._id,
        recipient: customer1._id,
        text: 'Yes Usman! I am right outside your gate with the diagnostics toolkit.',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000)
      },
      {
        conversation: conv1._id,
        sender: customer1._id,
        recipient: provider1._id,
        text: 'All working smoothly now, thanks again!',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('[Seeder] Creating Notifications...');
    await Notification.insertMany([
      {
        recipient: customer1._id,
        sender: provider2._id,
        type: NOTIFICATION_TYPES.PAYMENT_PENDING,
        title: 'Invoice Ready for Payment',
        message: 'Final invoice #INV-2026-802155 for Rs. 9,000 is ready for booking #BK-2026-904129. Please complete payment.',
        data: { bookingId: booking2._id, invoiceId: invoice2._id },
        isRead: false
      },
      {
        recipient: provider1._id,
        sender: customer2._id,
        type: NOTIFICATION_TYPES.BOOKING_CREATED,
        title: 'New Service Booking Request',
        message: 'Fatima Noor booked "Split & Inverter AC Chemical Jet Wash" for tomorrow.',
        data: { bookingId: booking2._id },
        isRead: false
      },
      {
        recipient: provider1._id,
        sender: customer1._id,
        type: NOTIFICATION_TYPES.REVIEW_RECEIVED,
        title: 'New Customer Review (5 Stars)',
        message: 'Usman Ali left a 5-star review for AC Diagnostic & Master Repair.',
        data: { bookingId: booking1._id },
        isRead: true
      }
    ]);

    console.log('[Seeder] Creating System Activity Logs...');
    await ActivityLog.insertMany([
      {
        user: admin._id,
        userEmail: admin.email,
        role: 'ADMIN',
        action: 'SYSTEM_INITIALIZED',
        description: 'Servora platform seeded with realistic production datasets',
        entityType: 'SYSTEM'
      },
      {
        user: provider1._id,
        userEmail: provider1.email,
        role: 'PROVIDER',
        action: 'SERVICE_CREATED',
        description: 'Service created: Inverter AC Diagnostic & Master Repair (Rs. 2,000)',
        entityType: 'SERVICE',
        entityId: services[0]._id
      },
      {
        user: customer1._id,
        userEmail: customer1.email,
        role: 'CUSTOMER',
        action: 'BOOKING_CREATED',
        description: 'New booking #BK-2026-904128 created',
        entityType: 'BOOKING',
        entityId: booking1._id
      },
      {
        user: customer1._id,
        userEmail: customer1.email,
        role: 'CUSTOMER',
        action: 'PAYMENT_PROCESSED',
        description: 'Payment of Rs. 4,500 processed for Invoice #INV-2026-802154',
        entityType: 'PAYMENT'
      },
      {
        user: customer1._id,
        userEmail: customer1.email,
        role: 'CUSTOMER',
        action: 'REVIEW_SUBMITTED',
        description: '5-star review submitted for booking #BK-2026-904128',
        entityType: 'REVIEW'
      }
    ]);

    console.log('✅ [Seeder] Database seeded successfully with 7 Users, 28 Categories, 7 Services, 4 Bookings, Invoices, Reviews, and Logs!');
    console.log('---------------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Admin:    admin@servora.com       / Admin123!');
    console.log('  Provider: ahmed.tech@servora.com  / Password123!');
    console.log('  Customer: usman.customer@servora.com / Password123!');
    console.log('---------------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err);
    process.exit(1);
  }
};

seedDatabase();
