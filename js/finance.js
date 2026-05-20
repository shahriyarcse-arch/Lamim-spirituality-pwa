/* =============================================
   LAMIM — FINANCE MODULE (COMPLETE ENGINE)
   ============================================= */
const Finance = {
  categories: [
    /* --- 220+ MASTER CATEGORIES DATABASE --- */
    { id: 'bazar', name: 'Kacha Bazar', icon: '🥦', color: '#34C759', section: 'Bazar & Food' },
    { id: 'fish', name: 'Fish (Maach)', icon: '🐟', color: '#007AFF', section: 'Bazar & Food' },
    { id: 'meat', name: 'Meat (Goru/Khashi)', icon: '🍖', color: '#FF2D55', section: 'Bazar & Food' },
    { id: 'chicken', name: 'Chicken (Murgi)', icon: '🍗', color: '#FF9500', section: 'Bazar & Food' },
    { id: 'grocery', name: 'Grocery (Mudi)', icon: '🛒', color: '#5856D6', section: 'Bazar & Food' },
    { id: 'rice', name: 'Rice (Chaal)', icon: '🌾', color: '#FFD60A', section: 'Bazar & Food' },
    { id: 'oil', name: 'Oil & Spices', icon: '🌶️', color: '#FF3B30', section: 'Bazar & Food' },
    { id: 'dal', name: 'Dal / Lentils', icon: '🍲', color: '#FFCC00', section: 'Bazar & Food' },
    { id: 'salt_sugar', name: 'Salt & Sugar', icon: '🧂', color: '#8E8E93', section: 'Bazar & Food' },
    { id: 'snacks', name: 'Snacks (Chanachur)', icon: '🥨', color: '#AF52DE', section: 'Bazar & Food' },
    { id: 'tea', name: 'Tea & Biscuits', icon: '☕', color: '#8E8E93', section: 'Bazar & Food' },
    { id: 'sweet', name: 'Sweets (Misti)', icon: '🍭', color: '#FFCC00', section: 'Bazar & Food' },
    { id: 'fruit', name: 'Fruits (Phol)', icon: '🍎', color: '#34C759', section: 'Bazar & Food' },
    { id: 'milk', name: 'Milk & Dairy', icon: '🥛', color: '#5AC8FA', section: 'Bazar & Food' },
    { id: 'yogurt', name: 'Yogurt (Doi)', icon: '🥣', color: '#F1F5F9', section: 'Bazar & Food' },
    { id: 'egg', name: 'Eggs (Dim)', icon: '🥚', color: '#FFD60A', section: 'Bazar & Food' },
    { id: 'bread', name: 'Bread & Bakery', icon: '🍞', color: '#FF9500', section: 'Bazar & Food' },
    { id: 'baby_food', name: 'Baby Food / Cerelac', icon: '🍼', color: '#5AC8FA', section: 'Bazar & Food' },
    { id: 'frozen_food', name: 'Frozen Food', icon: '🧊', color: '#AF52DE', section: 'Bazar & Food' },
    { id: 'baking', name: 'Baking Items', icon: '🧁', color: '#FFD60A', section: 'Bazar & Food' },
    { id: 'water', name: 'Mineral Water', icon: '🥤', color: '#007AFF', section: 'Bazar & Food' },
    { id: 'juice', name: 'Juice / Drinks', icon: '🧃', color: '#FF2D55', section: 'Bazar & Food' },
    { id: 'streetfood', name: 'Street Food', icon: '🥙', color: '#FF3B30', section: 'Bazar & Food' },
    { id: 'fuchka', name: 'Fuchka / Chotpoti', icon: '🥣', color: '#AF52DE', section: 'Bazar & Food' },
    { id: 'restaurant', name: 'Restaurant', icon: '🍱', color: '#FF2D55', section: 'Bazar & Food' },
    { id: 'cafe', name: 'Cafe / Coffee', icon: '☕', color: '#AF52DE', section: 'Bazar & Food' },
    { id: 'fastfood', name: 'Burger / Pizza', icon: '🍔', color: '#FF9500', section: 'Bazar & Food' },
    { id: 'biryani', name: 'Biryani / Tehari', icon: '🍛', color: '#FF3B30', section: 'Bazar & Food' },

    { id: 'rickshaw', name: 'Rickshaw Fare', icon: '🚲', color: '#34C759', section: 'Transport' },
    { id: 'cng', name: 'CNG Fare', icon: '🛺', color: '#007AFF', section: 'Transport' },
    { id: 'bus', name: 'Bus Fare', icon: '🚌', color: '#AF52DE', section: 'Transport' },
    { id: 'uber', name: 'Uber / Pathao', icon: '🚗', color: '#000000', section: 'Transport' },
    { id: 'fuel', name: 'Fuel (Octane/LPG)', icon: '⛽', color: '#FF3B30', section: 'Transport' },
    { id: 'cng_refill', name: 'CNG Refill', icon: '💨', color: '#5AC8FA', section: 'Transport' },
    { id: 'engineoil', name: 'Engine Oil / Lube', icon: '🧴', color: '#FF9500', section: 'Transport' },
    { id: 'carrepair', name: 'Car/Bike Repair', icon: '🔧', color: '#8E8E93', section: 'Transport' },
    { id: 'carwash', name: 'Car Wash', icon: '🚿', color: '#007AFF', section: 'Transport' },
    { id: 'tyre', name: 'Tyres / Parts', icon: '🔘', color: '#333333', section: 'Transport' },
    { id: 'battery', name: 'Car/Bike Battery', icon: '🔋', color: '#FFD60A', section: 'Transport' },
    { id: 'parking', name: 'Parking Fee', icon: '🅿️', color: '#5AC8FA', section: 'Transport' },
    { id: 'toll', name: 'Bridge Toll', icon: '🌉', color: '#5856D6', section: 'Transport' },
    { id: 'fitness', name: 'Vehicle Fitness', icon: '📜', color: '#5856D6', section: 'Transport' },
    { id: 'tax_token', name: 'Tax Token', icon: '🎫', color: '#FF3B30', section: 'Transport' },
    { id: 'route_permit', name: 'Route Permit', icon: '🛣️', color: '#34C759', section: 'Transport' },
    { id: 'driving_license', name: 'Driving License', icon: '🪪', color: '#AF52DE', section: 'Transport' },
    { id: 'launch', name: 'Launch / Steamer', icon: '🚢', color: '#007AFF', section: 'Transport' },
    { id: 'train', name: 'Train Fare', icon: '🚆', color: '#5856D6', section: 'Transport' },
    { id: 'flight', name: 'Flight Ticket', icon: '✈️', color: '#AF52DE', section: 'Transport' },

    { id: 'rent', name: 'House Rent', icon: '🏠', color: '#5856D6', section: 'Household' },
    { id: 'electricity', name: 'Electricity Bill', icon: '⚡', color: '#FFD60A', section: 'Household' },
    { id: 'wasa', name: 'WASA Bill', icon: '💧', color: '#007AFF', section: 'Household' },
    { id: 'gas', name: 'Titas Gas Bill', icon: '🔥', color: '#FF3B30', section: 'Household' },
    { id: 'lp_gas', name: 'LP Gas Cylinder', icon: '⛽', color: '#FF9500', section: 'Household' },
    { id: 'internet', name: 'Broadband', icon: '🌐', color: '#5AC8FA', section: 'Household' },
    { id: 'cabletv', name: 'Cable TV / Dish', icon: '📺', color: '#FF2D55', section: 'Household' },
    { id: 'garbage', name: 'Garbage Bill', icon: '🗑️', color: '#8E8E93', section: 'Household' },
    { id: 'maid', name: 'Maid Salary', icon: '🧹', color: '#AF52DE', section: 'Household' },
    { id: 'guard', name: 'Security Guard', icon: '👮', color: '#34C759', section: 'Household' },
    { id: 'laundry', name: 'Laundry / Ironing', icon: '👕', color: '#5856D6', section: 'Household' },
    { id: 'homerepair', name: 'Home Repair', icon: '🛠️', color: '#FF9500', section: 'Household' },
    { id: 'kitchen', name: 'Kitchenware', icon: '🍳', color: '#FFCC00', section: 'Household' },
    { id: 'cleaning_kit', name: 'Cleaning Kit', icon: '🧽', color: '#34C759', section: 'Household' },
    { id: 'pest_control', name: 'Pest Control', icon: '🦟', color: '#FF3B30', section: 'Household' },
    { id: 'furniture', name: 'Furniture', icon: '🪑', color: '#FF9500', section: 'Household' },
    { id: 'bedding', name: 'Bedding / Curtains', icon: '🛌', color: '#AF52DE', section: 'Household' },
    { id: 'plants', name: 'Plants / Garden', icon: '🪴', color: '#34C759', section: 'Household' },
    { id: 'bulb', name: 'Bulbs / Electrical', icon: '💡', color: '#FFD60A', section: 'Household' },

    { id: 'domain', name: 'Domain Name', icon: '🌐', color: '#007AFF', section: 'Tech & Freelance' },
    { id: 'hosting', name: 'Web Hosting', icon: '🖥️', color: '#5856D6', section: 'Tech & Freelance' },
    { id: 'saas', name: 'SaaS Subscription', icon: '☁️', color: '#AF52DE', section: 'Tech & Freelance' },
    { id: 'creative_cloud', name: 'Adobe / Design', icon: '🎨', color: '#FF2D55', section: 'Tech & Freelance' },
    { id: 'github', name: 'GitHub / Coding', icon: '💻', color: '#000000', section: 'Tech & Freelance' },
    { id: 'chatgpt', name: 'AI / ChatGPT', icon: '🤖', color: '#10A37F', section: 'Tech & Freelance' },
    { id: 'cloud_storage', name: 'Google/iCloud', icon: '☁️', color: '#007AFF', section: 'Tech & Freelance' },
    { id: 'app_store', name: 'App / Play Store', icon: '🏪', color: '#AF52DE', section: 'Tech & Freelance' },
    { id: 'freelance_fee', name: 'Upwork/Fiverr Fee', icon: '💸', color: '#34C759', section: 'Tech & Freelance' },
    { id: 'pc_hardware', name: 'PC Parts / GPU', icon: '📟', color: '#5856D6', section: 'Tech & Freelance' },
    { id: 'keyboard_mouse', name: 'Peripherals', icon: '⌨️', color: '#8E8E93', section: 'Tech & Freelance' },
    { id: 'monitor', name: 'Monitor / Display', icon: '🖥️', color: '#007AFF', section: 'Tech & Freelance' },
    { id: 'coworking', name: 'Coworking Space', icon: '🏢', color: '#FF9500', section: 'Tech & Freelance' },
    { id: 'vpn', name: 'VPN Subscription', icon: '🛡️', color: '#5AC8FA', section: 'Tech & Freelance' },
    { id: 'software_lic', name: 'Software License', icon: '🔑', color: '#FFD60A', section: 'Tech & Freelance' },

    { id: 'wholesale', name: 'Wholesale Stock', icon: '📦', color: '#FF9500', section: 'Business & Office' },
    { id: 'shop_rent', name: 'Shop / Office Rent', icon: '🏢', color: '#5856D6', section: 'Business & Office' },
    { id: 'staff_salary', name: 'Staff Salary', icon: '💵', color: '#34C759', section: 'Business & Office' },
    { id: 'staff_lunch', name: 'Staff Lunch', icon: '🍱', color: '#FF9500', section: 'Business & Office' },
    { id: 'packaging', name: 'Packing Materials', icon: '🛍️', color: '#AF52DE', section: 'Business & Office' },
    { id: 'marketing', name: 'Ads / Marketing', icon: '📢', color: '#007AFF', section: 'Business & Office' },
    { id: 'trade_license', name: 'Trade License', icon: '📜', color: '#FF3B30', section: 'Business & Office' },
    { id: 'business_tax', name: 'VAT / Tax', icon: '📊', color: '#FF3B30', section: 'Business & Office' },
    { id: 'shop_repair', name: 'Shop Maintenance', icon: '🛠️', color: '#8E8E93', section: 'Business & Office' },
    { id: 'delivery_cost', name: 'Delivery / Courier', icon: '🚚', color: '#FF9500', section: 'Business & Office' },
    { id: 'pos_software', name: 'POS / Bill App', icon: '🧾', color: '#5AC8FA', section: 'Business & Office' },
    { id: 'notebooks', name: 'Notebooks / Pens', icon: '🖊️', color: '#5856D6', section: 'Business & Office' },
    { id: 'ink_toner', name: 'Ink / Toner', icon: '🖨️', color: '#8E8E93', section: 'Business & Office' },

    { id: 'doctor', name: 'Doctor Visit', icon: '🩺', color: '#FF2D55', section: 'Medical' },
    { id: 'medicine', name: 'Medicine', icon: '💊', color: '#FF3B30', section: 'Medical' },
    { id: 'diagnostic', name: 'Lab Test', icon: '🔬', color: '#AF52DE', section: 'Medical' },
    { id: 'hospital_bill', name: 'Hospital Bill', icon: '🏥', color: '#FF3B30', section: 'Medical' },
    { id: 'dental', name: 'Dental Care', icon: '🦷', color: '#5AC8FA', section: 'Medical' },
    { id: 'optometry', name: 'Glasses / Eyes', icon: '👓', color: '#5856D6', section: 'Medical' },
    { id: 'physio', name: 'Physiotherapy', icon: '🧘', color: '#34C759', section: 'Medical' },
    { id: 'scrubs', name: 'Scrubs / Lab Coat', icon: '🥼', color: '#007AFF', section: 'Medical' },
    { id: 'med_journal', name: 'Medical Journal', icon: '📖', color: '#5856D6', section: 'Medical' },
    { id: 'stethoscope', name: 'Medical Equipment', icon: '🩹', color: '#8E8E93', section: 'Medical' },
    { id: 'med_license', name: 'BMDC / License', icon: '📜', color: '#34C759', section: 'Medical' },

    { id: 'school_fee', name: 'School Fees', icon: '🏫', color: '#5AC8FA', section: 'Education' },
    { id: 'coaching', name: 'Coaching / Tuition', icon: '✏️', color: '#AF52DE', section: 'Education' },
    { id: 'books', name: 'Books / Stationery', icon: '📚', color: '#FF9500', section: 'Education' },
    { id: 'photocopy', name: 'Photocopy / Print', icon: '📄', color: '#8E8E93', section: 'Education' },
    { id: 'library', name: 'Library Membership', icon: '🔖', color: '#5856D6', section: 'Education' },
    { id: 'project_mat', name: 'Project Materials', icon: '🧪', color: '#5856D6', section: 'Education' },
    { id: 'canteen', name: 'Canteen / Tiffin', icon: '🥪', color: '#FFCC00', section: 'Education' },
    { id: 'internship', name: 'Internship Cost', icon: '💼', color: '#34C759', section: 'Education' },
    { id: 'hostel_rent', name: 'Hostel / Mess', icon: '🏢', color: '#5856D6', section: 'Education' },
    { id: 'admission_fee', name: 'Admission Fee', icon: '📝', color: '#FF9500', section: 'Education' },
    { id: 'exam_fee', name: 'Exam Fee', icon: '📑', color: '#FF2D55', section: 'Education' },

    { id: 'seeds', name: 'Seeds / Saplings', icon: '🌱', color: '#34C759', section: 'Agro & Farming' },
    { id: 'fertilizer', name: 'Fertilizer', icon: '🧪', color: '#FF9500', section: 'Agro & Farming' },
    { id: 'pesticide', name: 'Pesticides', icon: '☠️', color: '#8E8E93', section: 'Agro & Farming' },
    { id: 'irrigation', name: 'Irrigation / Water', icon: '🚿', color: '#007AFF', section: 'Agro & Farming' },
    { id: 'feed', name: 'Cattle/Bird Feed', icon: '🌾', color: '#FFD60A', section: 'Agro & Farming' },
    { id: 'vet_visit', name: 'Vet / Animal Med', icon: '🐕', color: '#FF2D55', section: 'Agro & Farming' },
    { id: 'harvest_labor', name: 'Harvest Labor', icon: '👨‍🌾', color: '#FF9500', section: 'Agro & Farming' },
    { id: 'farm_tools', name: 'Tool Repair', icon: '🔨', color: '#8E8E93', section: 'Agro & Farming' },

    { id: 'art_supplies', name: 'Art Supplies', icon: '🎨', color: '#FF2D55', section: 'Creative' },
    { id: 'camera_gear', name: 'Camera / Lens', icon: '📷', color: '#000000', section: 'Creative' },
    { id: 'lighting', name: 'Studio Lighting', icon: '💡', color: '#FFD60A', section: 'Creative' },
    { id: 'printing_large', name: 'Canvas / Print', icon: '🖼️', color: '#5856D6', section: 'Creative' },
    { id: 'memory_card', name: 'Memory Cards', icon: '💾', color: '#8E8E93', section: 'Creative' },
    { id: 'gallery_fee', name: 'Gallery / Exhibition', icon: '🏛️', color: '#AF52DE', section: 'Creative' },

    { id: 'zakat', name: 'Zakat Payment', icon: '🕋', color: '#34C759', section: 'Social & Religious' },
    { id: 'sadaqah', name: 'Sadaqah / Charity', icon: '🤲', color: '#5AC8FA', section: 'Social & Religious' },
    { id: 'masjid_don', name: 'Masjid Donation', icon: '🕌', color: '#5856D6', section: 'Social & Religious' },
    { id: 'madrasa_don', name: 'Madrasa Donation', icon: '📖', color: '#FF9500', section: 'Social & Religious' },
    { id: 'qurbani', name: 'Qurbani Expense', icon: '🐄', color: '#FF3B30', section: 'Social & Religious' },
    { id: 'fitra', name: 'Fitra', icon: '🌾', color: '#FFCC00', section: 'Social & Religious' },
    { id: 'wedding_gift', name: 'Wedding Gift', icon: '🎁', color: '#FF2D55', section: 'Social & Religious' },
    { id: 'birthday_gift', name: 'Birthday Gift', icon: '🎂', color: '#FF9500', section: 'Social & Religious' },
    { id: 'relatives', name: 'Family Support', icon: '👨‍👩‍👧‍👦', color: '#5AC8FA', section: 'Social & Religious' },
    { id: 'beggar', name: 'Poor / Beggar', icon: '🙌', color: '#8E8E93', section: 'Social & Religious' },
    { id: 'iftar_party', name: 'Iftar Party', icon: '🌙', color: '#FF9500', section: 'Social & Religious' },
    { id: 'mezbani', name: 'Mezbani', icon: '🍛', color: '#FF3B30', section: 'Social & Religious' },

    { id: 'recharge', name: 'Mobile Recharge', icon: '📱', color: '#34C759', section: 'Personal & Grooming' },
    { id: 'mobile_data', name: 'Mobile Data', icon: '📶', color: '#007AFF', section: 'Personal & Grooming' },
    { id: 'clothing', name: 'Clothing / Dress', icon: '👗', color: '#FF2D55', section: 'Personal & Grooming' },
    { id: 'shoes', name: 'Shoes / Footwear', icon: '👞', color: '#8E8E93', section: 'Personal & Grooming' },
    { id: 'panjabi', name: 'Panjabi / Lungi', icon: '👳', color: '#5856D6', section: 'Personal & Grooming' },
    { id: 'sharee', name: 'Sharee / Salwar', icon: '💃', color: '#AF52DE', section: 'Personal & Grooming' },
    { id: 'tailoring', name: 'Tailoring Cost', icon: '✂️', color: '#FF3B30', section: 'Personal & Grooming' },
    { id: 'saloon', name: 'Barber / Saloon', icon: '💈', color: '#5AC8FA', section: 'Personal & Grooming' },
    { id: 'parlor', name: 'Beauty Parlor', icon: '💄', color: '#FF2D55', section: 'Personal & Grooming' },
    { id: 'shaving_kit', name: 'Shaving / Deodorant', icon: '🪒', color: '#8E8E93', section: 'Personal & Grooming' },
    { id: 'perfume', name: 'Perfume / Attar', icon: '✨', color: '#AF52DE', section: 'Personal & Grooming' },
    { id: 'gym', name: 'Gym / Fitness', icon: '💪', color: '#34C759', section: 'Personal & Grooming' },
    { id: 'supplements', name: 'Gym Supplements', icon: '🥤', color: '#FF9500', section: 'Personal & Grooming' },
    { id: 'pet_food', name: 'Pet Food / Care', icon: '🐾', color: '#FF9500', section: 'Personal & Grooming' },
    { id: 'paan', name: 'Paan / Supari', icon: '🍃', color: '#34C759', section: 'Personal & Grooming' },
    { id: 'smoking', name: 'Tea / Smoking', icon: '🚬', color: '#8E8E93', section: 'Personal & Grooming' },

    { id: 'bank_fee', name: 'Bank Fees / Tax', icon: '🏦', color: '#8E8E93', section: 'Finance & Legal' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#5AC8FA', section: 'Finance & Legal' },
    { id: 'loan_inst', name: 'Loan Installment', icon: '💸', color: '#FF2D55', section: 'Finance & Legal' },
    { id: 'gold', name: 'Gold / Jewelry', icon: '💍', color: '#FFCC00', section: 'Finance & Legal' },
    { id: 'legal_fee', name: 'Lawyer / Legal', icon: '⚖️', color: '#5856D6', section: 'Finance & Legal' },
    { id: 'police_fine', name: 'Police Fine', icon: '👮', color: '#FF3B30', section: 'Finance & Legal' },
    { id: 'passport', name: 'Passport / Visa', icon: '🛂', color: '#5AC8FA', section: 'Finance & Legal' },

    { id: 'cinema', name: 'Cinema / Movies', icon: '🎬', color: '#FF3B30', section: 'Entertainment' },
    { id: 'games', name: 'Video Games', icon: '🎮', color: '#5856D6', section: 'Entertainment' },
    { id: 'steam_games', name: 'Steam / Epic', icon: '🕹️', color: '#000000', section: 'Entertainment' },
    { id: 'tour', name: 'Travel / Tour', icon: '🗺️', color: '#34C759', section: 'Entertainment' },
    { id: 'park', name: 'Amusement Park', icon: '🎡', color: '#FF9500', section: 'Entertainment' },
    { id: 'streaming', name: 'Netflix / Spotify', icon: '🎧', color: '#007AFF', section: 'Entertainment' },
    { id: 'hobbies', name: 'Hobby / Sports', icon: '🏸', color: '#AF52DE', section: 'Entertainment' },
    { id: 'other', name: 'Other Expense', icon: '✨', color: '#8E8E93', section: 'Other' }
  ],

  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  chartView: 'daily',
  exchangeRate: 118,
  showAllActivity: false,
  showAllVaults: false,
  historySearch: '',
  historyCategory: 'all',
  vaultSearch: '',

  async init() {
    this.loadData();

    // Efficiency: Pre-index categories into a Map for O(1) lookups
    if (!this.categoryMap) {
      this.categoryMap = new Map();
      this.categories.forEach(cat => this.categoryMap.set(cat.id, cat));
    }

    this.render();
    this.fetchExchangeRate();
    if (this.rateInterval) clearInterval(this.rateInterval);
    this.rateInterval = setInterval(() => {
      if (document.getElementById('section-finance')?.classList.contains('active')) {
        this.fetchExchangeRate();
      }
    }, 60000);

    // Listen for cloud/local data updates
    if (!this.dataUpdateBound) {
      window.addEventListener('lamim:data-updated', () => {
        if (document.getElementById('section-finance')?.classList.contains('active')) {
          this.loadData();
          this.render();
        }
      });
      this.dataUpdateBound = true;
    }
  },

  setChartView(view) {
    this.chartView = view;
    this.render();
  },

  async fetchExchangeRate() {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data && data.rates && data.rates.BDT) {
        const newRate = data.rates.BDT;
        if (newRate !== this.exchangeRate) {
          this.exchangeRate = newRate;
          this.render();
          // If settings modal is open, refresh its content too
          const modal = document.getElementById('finance-modal-overlay');
          if (modal && modal.classList.contains('show')) {
             // Only refresh if the title matches "Finance Settings" to avoid overriding other modals
             const title = modal.querySelector('.fin-modal-title')?.innerText;
             if (title === 'Finance Settings') this.showToolsModal();
          }
        }
      }
    } catch (e) {}
  },

  getSymbol() { return DB.getSettings().currency === 'BDT' ? '৳' : '$'; },

  setCurrency(code) {
    const s = DB.getSettings(); s.currency = code; DB.setSettings(s);
    this.render(); Utils.toast(`Switched to ${code}`, 'info');
  },

  formatVal(val) {
    const converted = DB.getSettings().currency === 'BDT' ? val * this.exchangeRate : val;
    return converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  loadData() {
    const stored = DB.getFinance();
    this.data = { 
      expenses: stored.expenses || [], 
      savings: stored.savings || [], 
      income: stored.income || [] 
    };
    this.currentViewDate = new Date();
  },

  saveData() { DB.setFinance(this.data); },

  render() {
    const container = document.getElementById('finance-content');
    if (!container) return;
    const stats = this.getStats(this.currentViewDate);

    container.innerHTML = `
      <div class="finance-container" style="position:relative;">
        <div class="finance-aurora-bg"></div>
        ${this.renderMonthSelector()}
        ${this.renderSummary(stats)}
        ${this.renderQuickAdd()}
        
        <div class="fin-chart-header">
          <div>
            <div class="fin-section-title">Spending Analysis</div>
            <div class="fin-section-subtitle">${this.chartView === 'daily' ? 'Daily breakdown of this month' : 'Monthly overview of this year'}</div>
          </div>
          <div class="fin-chart-tabs">
            <button class="fin-chart-tab ${this.chartView === 'daily' ? 'active' : ''}" onclick="Finance.setChartView('daily')">Daily</button>
            <button class="fin-chart-tab ${this.chartView === 'monthly' ? 'active' : ''}" onclick="Finance.setChartView('monthly')">Monthly</button>
          </div>
        </div>
        <div class="fin-chart-container">
          <canvas id="finance-main-chart"></canvas>
        </div>

        <div class="finance-premium-card">${this.renderExpensesList(this.currentViewDate)}</div>
        <div class="finance-premium-card">${this.renderSavingsSection()}</div>
        
        <!-- Zakat & Sadaqah Hub: Coming Soon -->
        <div class="finance-premium-card" style="text-align: center; padding: 32px 24px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.01) 100%); border: 1px dashed rgba(255, 255, 255, 0.08); border-radius: 20px; position: relative; overflow: hidden; box-shadow: var(--shadow-sm);">
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; z-index: 2; position: relative;">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(212, 163, 89, 0.1); border: 1px solid rgba(212, 163, 89, 0.2); display: flex; align-items: center; justify-content: center; color: var(--color-accent-gold); font-size: 22px; box-shadow: 0 0 20px rgba(212, 163, 89, 0.15); animation: float 6s ease-in-out infinite;">🕋</div>
            <div style="font-weight: 800; font-size: 16px; color: var(--color-text-primary); letter-spacing: 0.5px;">Zakat & Sadaqah Hub</div>
            <div style="font-size: 12px; color: var(--color-text-subtitle); max-width: 320px; line-height: 1.5; font-weight: 500; margin-bottom: 4px;">Comprehensive Zakat calculations, custom assets bookkeeping, live Nisab thresholds, and Sadaqah charity tracking are coming in the next update.</div>
            <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: var(--color-accent-gold); padding: 4px 14px; background: rgba(212, 163, 89, 0.08); border-radius: 20px; border: 1px solid rgba(212, 163, 89, 0.15);">Coming Soon</div>
          </div>
          <div class="vault-total-gloss"></div>
        </div>
      </div>
    `;
    setTimeout(() => {
      this.initChart(stats);
    }, 50);
  },

  renderMonthSelector() {
    const monthStr = this.currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const isCurrent = this.currentViewDate.getMonth() === new Date().getMonth() && this.currentViewDate.getFullYear() === new Date().getFullYear();
    const settings = DB.getSettings();

    return `
      <div class="finance-month-navigator">
        <div class="fin-unified-controls">
          <button onclick="Finance.changeMonth(-1)" class="finance-nav-btn">❮</button>
          <div style="font-size:15px; font-weight:800; min-width:120px; text-align:center;">${monthStr}</div>
          <button onclick="Finance.changeMonth(1)" class="finance-nav-btn ${isCurrent ? 'hidden' : ''}">❯</button>
        </div>
        <div style="display:flex; align-items:center;">
          <div class="fin-control-divider"></div>
          <div class="fin-currency-toggle">
            <div class="fin-currency-btn ${settings.currency === 'USD' ? 'active' : ''}" onclick="Finance.setCurrency('USD')">USD</div>
            <div class="fin-currency-btn ${settings.currency === 'BDT' ? 'active' : ''}" onclick="Finance.setCurrency('BDT')">BDT</div>
          </div>
        </div>
      </div>
    `;
  },

  changeMonth(delta) {
    const nextDate = new Date(this.currentViewDate); nextDate.setMonth(nextDate.getMonth() + delta);
    if (nextDate > new Date()) return;
    this.currentViewDate = nextDate; 
    this.showAllActivity = false; // Reset when changing month
    this.render();
  },

  renderSummary(stats) {
    const sym = this.getSymbol();
    const m = this.currentViewDate.getMonth(), y = this.currentViewDate.getFullYear();
    const curExps = this.data.expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y; }).reduce((s, e) => s + e.amount, 0);
    const prevMonth = new Date(y, m - 1, 1);
    const prevExps = this.data.expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear(); }).reduce((s, e) => s + e.amount, 0);
    
    let trendHtml = '';
    if (prevExps > 0) {
      const diff = ((curExps - prevExps) / prevExps) * 100;
      const isIncrease = curExps > prevExps;
      const trendColor = isIncrease ? 'var(--fin-red)' : 'var(--fin-green)'; 
      const icon = isIncrease ? '↗' : '↘';
      trendHtml = `<span style="color:${trendColor} !important; font-weight:800; display:inline-flex; align-items:center; gap:4px;">${icon} ${Math.abs(diff).toFixed(1)}%</span>`;
    } else {
      trendHtml = `<span style="opacity:0.4; font-size:11px;">New month started</span>`;
    }

    const catWeights = {};
    this.data.expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() === m && d.getFullYear() === y) catWeights[e.category] = (catWeights[e.category] || 0) + e.amount;
    });

    const sortedCats = Object.entries(catWeights).sort((a,b) => b[1] - a[1]);
    const gCols = [
      sortedCats[0] ? this.getResolvedColor(this.categories.find(c=>c.id===sortedCats[0][0]).color) : this.getResolvedColor('#ff3b30'),
      sortedCats[1] ? this.getResolvedColor(this.categories.find(c=>c.id===sortedCats[1][0]).color) : this.getResolvedColor('#ff9500'),
      this.getResolvedColor('#007aff'), this.getResolvedColor('#af52de')
    ];

    const isNegative = stats.totalAllTime < 0;
    // More robust date detection
    const allDates = [
      ...this.data.expenses.map(e => new Date(e.date)),
      ...this.data.income.map(i => new Date(i.date)),
      ...this.data.savings.map(s => s.createdAt ? new Date(s.createdAt) : null)
    ].filter(d => d && !isNaN(d.getTime()) && d.getFullYear() >= 2024);

    // If no valid data found, or data is older than current year but user says they just started
    const firstTrans = allDates.length > 0 ? new Date(Math.min(...allDates)) : new Date();
    
    // Safety check: If the detected month is before April 2026 and user insists it's April
    let creationYear = firstTrans.getFullYear();
    let creationMonth = firstTrans.getMonth() + 1;

    if (creationYear === 2026 && creationMonth < 4) {
      creationYear = 2026;
      creationMonth = 4;
    }

    const cardId = `LAMIM-${creationYear}-${String(creationMonth).padStart(2, '0')}`;

    return `
      <div class="finance-premium-card card-main-balance ${stats.totalAllTime < 0 ? 'is-negative' : ''}">
        <div class="card-glow-layer"><div class="card-glow-orb"></div></div>
        <div class="card-monogram-l">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="url(#rainbow-grad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <defs>
              <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f2ff" />
                <stop offset="50%" stop-color="#7a00ff" />
                <stop offset="100%" stop-color="#ff00c8" />
              </linearGradient>
            </defs>
            <path d="M7 4v16h10"/>
          </svg>
        </div>
        <div>
          <span class="balance-label">${stats.totalAllTime < 0 ? 'Total Debt' : 'Total Balance'}</span>
          <div class="balance-value">${sym}${this.formatVal(stats.totalAllTime)}</div>
        </div>
        <div class="balance-trend">${trendHtml}<span style="opacity:0.5; font-size:12px; margin-left:4px;"> vs last month</span></div>
        <div class="card-identity-id">${cardId}</div>
      </div>
      <div class="fin-stats-row">
        <div class="fin-stat-card">
          <div class="fin-stat-label">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--fin-green)"><path d="M7 17l5-5 5 5M7 12l5-5 5 5"/></svg>
            Income
          </div>
          <div class="fin-stat-value income">+${sym}${this.formatVal(stats.income)}</div>
        </div>
        <div class="fin-stat-card">
          <div class="fin-stat-label">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--fin-red)"><path d="M7 7l5 5 5-5M7 12l5 5 5-5"/></svg>
            Expenses
          </div>
          <div class="fin-stat-value expense">-${sym}${this.formatVal(stats.expenses)}</div>
        </div>
      </div>
    `;
  },

  renderQuickAdd() {
    return `
      <div class="fin-action-grid">
        <button class="fin-btn fin-btn-primary" onclick="Finance.showIncomeModal()">
          <div class="fin-btn-icon" style="background:rgba(52, 199, 89, 0.1); color:var(--fin-green)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          Deposit
        </button>
        <button class="fin-btn fin-btn-secondary" onclick="Finance.showExpenseModal()">
          <div class="fin-btn-icon" style="background:rgba(0, 122, 255, 0.1); color:var(--fin-blue)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
          </div>
          Spend
        </button>
      </div>
    `;
  },

  renderExpensesList(v) {
    const m = v.getMonth(), y = v.getFullYear(), sym = this.getSymbol();
    const exps = this.data.expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y; });
    const incs = this.data.income.filter(e => { const d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y; });
    
    const allActivity = [...exps.map(e => ({...e, type: 'expense'})), ...incs.map(i => ({...i, type: 'income'}))]
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        if (b.id && a.id) return b.id.localeCompare(a.id);
        return 0;
      });

    const totalExp = exps.reduce((s, e) => s + e.amount, 0);

    if (!allActivity.length) return `<div class="fin-section-title">${v.toLocaleString('default',{month:'long'})} Activity</div><p style="text-align:center; opacity:0.3; padding:40px; font-size:14px;">No records for this month</p>`;

    const groups = {};
    allActivity.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });

    const sortedDates = Object.keys(groups).sort((a,b) => new Date(b) - new Date(a));

    let count = 0;
    const LIMIT = 8;
    let listHtml = "";
    let hasMore = false;

    for (const date of sortedDates) {
      if (!this.showAllActivity && count >= LIMIT) {
        hasMore = true;
        break;
      }

      const dObj = new Date(date);
      const isToday = date === Utils.todayStr();
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      const isYesterday = date === yesterday.toISOString().split('T')[0];
      
      let label = dObj.toLocaleDateString('default', { day: 'numeric', month: 'short' });
      if (isToday) label = 'Today';
      else if (isYesterday) label = 'Yesterday';

      let itemsHtml = "";
      for (const e of groups[date]) {
        if (!this.showAllActivity && count >= LIMIT) {
          hasMore = true;
          break;
        }
        itemsHtml += this.renderActivityItem(e, count);
        count++;
      }

      if (itemsHtml) {
        listHtml += `
          <div class="transaction-group">
            <div class="transaction-date-label">${label}</div>
            <div class="transaction-list">
              ${itemsHtml}
            </div>
          </div>
        `;
      }
    }

    const showMoreBtn = hasMore || this.data.expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y; }).length > LIMIT ? `
      <div style="text-align:center; margin: 20px 0;">
        <button class="fin-show-more-btn" onclick="Finance.showFullHistory()">
          View History
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    ` : "";

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div class="fin-section-title" style="margin-bottom:0;">${v.toLocaleString('default',{month:'long'})} Activity</div>
        <button class="fin-delete-btn" style="opacity:1; width:auto; padding:0 12px; height:36px; gap:8px; font-size:12px; color:var(--fin-blue); background:rgba(0,122,255,0.05); border-color:rgba(0,122,255,0.1);" onclick="Finance.exportPDF()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Export Statement
        </button>
      </div>
      ${listHtml}
      ${showMoreBtn}
      <div class="ledger-summary">
        <div class="ledger-total-label">Monthly Spending</div>
        <div class="ledger-total-value">-${sym}${this.formatVal(totalExp)}</div>
      </div>
    `;
  },

  getResolvedColor(hex) {
    if (document.documentElement.getAttribute('data-theme') !== 'light') return hex;
    const map = {
      '#FF9500': '#B45309', '#007AFF': '#1D4ED8', '#5856D6': '#4338CA', '#AF52DE': '#6D28D9',
      '#FFD60A': '#A16207', '#FF2D55': '#BE123C', '#FF3B30': '#B91C1C', '#5AC8FA': '#0369A1',
      '#34C759': '#047857', '#FFCC00': '#A16207', '#8E8E93': '#4B5563', '#C7C7CC': '#6B7280'
    };
    return map[hex.toUpperCase()] || hex;
  },

  getCategory(id) {
    return this.categoryMap.get(id) || { name: 'Other', icon: '❓', color: '#8E8E93' };
  },

  renderActivityItem(e, index) {
    const isInc = e.type === 'income';
    const c = isInc ? { name: 'Deposit', icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`, color: '#34C759' } : this.getCategory(e.category);
    const sym = this.getSymbol();
    const resolvedColor = this.getResolvedColor(c.color);
    
    return `
      <div class="transaction-item-wrapper" style="position: relative;">
        <div class="transaction-timeline-connector" style="--timeline-dot-color: ${isInc ? '#34C759' : '#FF2D55'};"></div>
        <div class="transaction-item" style="animation-delay: ${index * 0.05}s;">
          <div class="transaction-icon" style="background:${resolvedColor}15; color:${resolvedColor}">${c.icon}</div>
          <div class="transaction-info">
            <div class="transaction-name">${isInc ? e.description : c.name}</div>
            <div class="transaction-meta">${isInc ? 'Deposit' : c.section}</div>
          </div>
          <div style="display:flex; align-items:center; gap:12px; position:relative; z-index:1;">
            <div class="transaction-amount ${isInc ? 'positive' : 'negative'}">${isInc ? '+' : '-'}${sym}${this.formatVal(e.amount)}</div>
            <button class="fin-delete-btn" onclick="Finance.${isInc ? 'deleteIncome' : 'deleteExpense'}('${e.id}')" title="Delete">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderSavingsSection() {
    const sym = this.getSymbol();
    const total = this.data.savings.reduce((sum, goal) => sum + (Number(goal.saved) || 0), 0);
    const hasVaults = this.data.savings.length > 0;

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="fin-section-title" style="margin-bottom:0;">Vaults</div>
          ${hasVaults ? `
            <span style="font-size:11px; font-weight:800; background:rgba(99, 102, 241, 0.08); color:#6366f1; border:1px solid rgba(99, 102, 241, 0.15); padding:4px 10px; border-radius:12px; letter-spacing:0.5px;">
              ${sym}${this.formatVal(total)} Saved
            </span>
          ` : ''}
        </div>
        <button class="fin-save-btn" style="width:auto; padding:0 16px; height:40px; gap:8px; font-size:13px; font-weight:800;" onclick="Finance.showSavingsModal()">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Create New Vault
        </button>
      </div>
      
      <div class="vault-grid">
        ${hasVaults ? (() => {
          const LIMIT = 4;
          const reversedVaults = [...this.data.savings].reverse();
          const displayVaults = reversedVaults.slice(0, LIMIT);
          return displayVaults.map(s => this.renderSavingsItem(s)).join('');
        })() : `
          <div class="vault-empty-state" onclick="Finance.showSavingsModal()">
            <div class="vault-empty-icon">💎</div>
            <div style="font-weight:700; font-size:14px; color:var(--color-text-muted);">Secure your future</div>
            <div style="font-size:12px; color:var(--color-text-muted); opacity:0.6; margin-top:4px;">Tap to create your first savings goal</div>
          </div>
        `}
      </div>

      ${hasVaults && this.data.savings.length > 4 ? `
        <div style="text-align:center; margin: 20px 0;">
          <button class="fin-show-more-btn" onclick="Finance.showVaultsOverlay()">
            Manage Vaults
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      ` : ""}
    `;
  },

  getVaultIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('iphone') || n.includes('phone') || n.includes('mobile')) return '📱';
    if (n.includes('macbook') || n.includes('laptop')) return '💻';
    if (n.includes('pc') || n.includes('desktop') || n.includes('computer') || n.includes('monitor')) return '🖥️';
    if (n.includes('watch') || n.includes('iwatch')) return '⌚';
    if (n.includes('game') || n.includes('ps5') || n.includes('xbox') || n.includes('console') || n.includes('gaming')) return '🎮';
    if (n.includes('camera') || n.includes('dslr') || n.includes('lens')) return '📷';
    if (n.includes('tech') || n.includes('gadget')) return '🔌';
    if (n.includes('car') || n.includes('auto')) return '🚗';
    if (n.includes('bike') || n.includes('motorcycle')) return '🏍️';
    if (n.includes('cycle') || n.includes('bicycle')) return '🚲';
    if (n.includes('hajj') || n.includes('umrah') || n.includes('makkah')) return '🕋';
    if (n.includes('islamic') || n.includes('mosque') || n.includes('madina')) return '🕌';
    if (n.includes('charity') || n.includes('zakat') || n.includes('sadaqah')) return '🤲';
    if (n.includes('house') || n.includes('home') || n.includes('flat') || n.includes('rent')) return '🏠';
    if (n.includes('wedding') || n.includes('marriage') || n.includes('nikah')) return '💍';
    if (n.includes('travel') || n.includes('trip') || n.includes('tour') || n.includes('flight')) return '✈️';
    if (n.includes('food') || n.includes('bazaar') || n.includes('grocery')) return '🛒';
    if (n.includes('gift') || n.includes('birthday')) return '🎁';
    if (n.includes('education') || n.includes('book') || n.includes('course') || n.includes('university')) return '📚';
    if (n.includes('business') || n.includes('office') || n.includes('startup')) return '💼';
    if (n.includes('invest') || n.includes('stock') || n.includes('crypto')) return '📈';
    if (n.includes('emergency') || n.includes('medical') || n.includes('health')) return '🏥';
    if (n.includes('money') || n.includes('cash') || n.includes('save')) return '💰';
    return '💎'; 
  },

  renderSavingsItem(g) {
    const p = g.target > 0 ? (g.saved / g.target) * 100 : 0;
    const displayP = Math.floor(p);
    const sym = this.getSymbol();
    const icon = this.getVaultIcon(g.name);

    // Dynamic high-contrast gradients based on completion progress
    let fillGradient = 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)'; // Starting (0-40%): Royal Purple to Blue
    let glowColor = 'rgba(139, 92, 246, 0.4)';
    
    if (p >= 100) {
      fillGradient = 'linear-gradient(90deg, #FFD60A 0%, #FF9F0A 100%)'; // Completed: Radiant Amber Gold
      glowColor = 'rgba(255, 214, 10, 0.5)';
    } else if (p >= 75) {
      fillGradient = 'linear-gradient(90deg, #34C759 0%, #00F2FF 100%)'; // Advanced (75-99%): Emerald to Bright Cyan
      glowColor = 'rgba(52, 199, 89, 0.4)';
    } else if (p >= 40) {
      fillGradient = 'linear-gradient(90deg, #FF2D55 0%, #AF52DE 100%)'; // Mid-way (40-74%): Electric Rose to Amethyst
      glowColor = 'rgba(255, 45, 85, 0.4)';
    }

    return `
      <div class="vault-card ${p >= 100 ? 'completed' : ''}" onclick="Finance.addToSavings('${g.id}')">
        <div class="vault-header">
          <div class="vault-icon-box" style="background:${p >= 100 ? 'rgba(255,214,10,0.1)' : ''}; color:${p >= 100 ? '#FFD60A' : ''}; box-shadow:${p >= 100 ? '0 0 20px rgba(255,214,10,0.15)' : ''};">${icon}</div>
          <div class="vault-info">
            <div class="vault-name">${g.name}</div>
            <div class="vault-status">${displayP}% Completed</div>
          </div>
          <div class="vault-action-slot">
            <div class="vault-add-btn" onclick="event.stopPropagation(); Finance.addToSavings('${g.id}')">
              ${p >= 100 ? 
                `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` :
                `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`
              }
            </div>
            <button class="fin-delete-btn" style="width:36px; height:36px; border-radius:12px; background:rgba(255,59,48,0.05); color:rgba(255,59,48,0.4);" onclick="event.stopPropagation(); Finance.deleteVault('${g.id}')">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </div>
        <div class="vault-progress-container">
          <div class="vault-metrics-row">
            <div class="vault-metric">
              <span class="vault-metric-label">Saved</span>
              <span class="vault-metric-value">${sym}${this.formatVal(g.saved)}</span>
            </div>
            <div class="vault-metric" style="text-align:right;">
              <span class="vault-metric-label">Target</span>
              <span class="vault-metric-value">${sym}${this.formatVal(g.target)}</span>
            </div>
          </div>
          <div class="vault-progress-track">
            <div class="vault-progress-fill" style="width:${Math.min(100, p)}%; background:${fillGradient}; box-shadow: 0 0 14px ${glowColor};">
              <div class="vault-progress-glow" style="box-shadow: 0 0 15px #fff, 0 0 30px ${p >= 100 ? '#FFD60A' : '#00f2ff'};"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  showExpenseModal() {
    const sym = this.getSymbol(); 
    this.selectedCategory = 'bazar';
    const now = new Date();
    let defaultDate = this.currentViewDate;
    if (now.getMonth() === this.currentViewDate.getMonth() && now.getFullYear() === this.currentViewDate.getFullYear()) {
      defaultDate = now;
    }
    const dateStr = defaultDate.toISOString().split('T')[0];
    
    const html = `
      <div class="finance-modal-content" style="max-width:500px;">
        <div class="fin-modal-header">
          <div class="fin-modal-title">Log Spending</div>
          <button class="fin-modal-close" onclick="Finance.closeModal()">✕</button>
        </div>
        
        <div class="fin-modal-amount-wrap">
          <div style="display:flex; align-items:center; justify-content:center;">
            <span class="fin-modal-currency" style="color:var(--fin-red); font-size:32px;">${sym}</span>
            <input type="number" id="finance-expense-amount" placeholder="0.00" class="fin-modal-amount-input" autofocus style="width:180px;">
          </div>
        </div>

        <div class="fin-field-group">
          <label class="fin-field-label">Category</label>
          <div class="fin-modal-search-box">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="Search 250+ categories..." oninput="Finance.handleCatSearch(this.value)" class="fin-cat-search-input">
          </div>
          <div class="fin-cat-grid" id="fin-cat-list">
            ${this.renderCategoryGrid('')}
          </div>
        </div>

        <div class="fin-field-group">
          <label class="fin-field-label">Date</label>
          <input type="date" id="finance-expense-date" value="${dateStr}" class="fin-field-input">
        </div>

        <div class="fin-modal-actions">
          <button class="fin-save-btn expense" onclick="Finance.saveExpense()" style="width:100%; height:50px; font-size:15px; border-radius:16px;">Confirm Payment</button>
        </div>
      </div>
    `;
    this.showModal(html);
  },

  handleCatSearch(val) {
    const container = document.getElementById('fin-cat-list');
    if (container) container.innerHTML = this.renderCategoryGrid(val.toLowerCase());
  },

  renderCategoryGrid(search) {
    const filtered = this.categories.filter(c => 
      c.name.toLowerCase().includes(search) || 
      c.id.includes(search) || 
      c.section.toLowerCase().includes(search)
    );

    let html = '';
    let currentSection = '';

    filtered.forEach(c => {
      if (c.section !== currentSection) {
        currentSection = c.section;
        html += `<div class="fin-cat-section-header">${currentSection.toUpperCase()}</div>`;
      }
      const rc = this.getResolvedColor(c.color); 
      html += `
        <div class="fin-cat-pill ${this.selectedCategory === c.id ? 'active' : ''}" onclick="Finance.selectCategory('${c.id}')" id="cat-${c.id}">
          <div class="fin-cat-icon" style="background:${rc}15; color:${rc}">${c.icon}</div>
          <span class="fin-cat-name">${c.name}</span>
        </div>`;
    });

    return html || `<div style="text-align:center; grid-column:1/-1; padding:40px; opacity:0.3; font-size:13px;">No categories found</div>`;
  },

  selectCategory(id) { this.selectedCategory = id; document.querySelectorAll('.fin-cat-pill').forEach(p => p.classList.remove('active')); const a = document.getElementById(`cat-${id}`); if (a) a.classList.add('active'); },
  saveExpense() {
    let a = parseFloat(document.getElementById('finance-expense-amount').value);
    const c = this.selectedCategory, d = document.getElementById('finance-expense-date').value, obj = this.categories.find(o => o.id === c);
    if (isNaN(a) || a <= 0) return Utils.toast('Enter valid amount', 'error');

    // Calculate absolute total balance in USD (base currency)
    const allIncome = this.data.income.reduce((s, o) => s + o.amount, 0);
    const allExpenses = this.data.expenses.reduce((s, o) => s + o.amount, 0);
    const totalBalance = allIncome - allExpenses;

    let amountInBase = a;
    if (DB.getSettings().currency === 'BDT') amountInBase = a / this.exchangeRate;

    // Check if expense exceeds total balance
    if (amountInBase > totalBalance + 0.0001) {
      const sym = this.getSymbol();
      return Utils.toast(`Insufficient balance! Available: ${sym}${this.formatVal(totalBalance)}`, 'error');
    }

    this.data.expenses.push({ id: Utils.uid(), description: obj.name, amount: amountInBase, category: c, date: d });
    this.saveData(); this.closeModal(); this.render();
  },

  showIncomeModal() {
    const sym = this.getSymbol();
    const now = new Date();
    let defaultDate = this.currentViewDate;
    if (now.getMonth() === this.currentViewDate.getMonth() && now.getFullYear() === this.currentViewDate.getFullYear()) {
      defaultDate = now;
    }
    const dateStr = defaultDate.toISOString().split('T')[0];
    const html = `<div class="finance-modal-content"><div class="fin-modal-header"><div class="fin-modal-title">Add Deposit</div></div><div class="fin-modal-amount-wrap"><div style="display:flex; align-items:center;"><span class="fin-modal-currency">${sym}</span><input type="number" id="finance-income-amount" placeholder="0.00" class="fin-modal-amount-input" autofocus></div></div><div class="fin-field-group"><label class="fin-field-label">Source</label><input type="text" id="finance-income-desc" placeholder="Salary, Gift etc." class="fin-field-input"></div><div class="fin-field-group"><label class="fin-field-label">Date</label><input type="date" id="finance-income-date" value="${dateStr}" class="fin-field-input"></div><div class="fin-modal-actions"><button class="fin-save-btn income" onclick="Finance.saveIncome()">Confirm</button><button class="fin-cancel-btn" onclick="Finance.closeModal()">Cancel</button></div></div>`;
    this.showModal(html);
  },

  saveIncome() { const desc = document.getElementById('finance-income-desc').value; let a = parseFloat(document.getElementById('finance-income-amount').value); const d = document.getElementById('finance-income-date').value; if (!desc || isNaN(a) || a <= 0) return Utils.toast('Fill valid fields','error'); if (DB.getSettings().currency==='BDT') a /= this.exchangeRate; this.data.income.push({ id: Utils.uid(), description: desc, amount: a, date: d }); this.saveData(); this.closeModal(); this.render(); },
  
  deleteExpense(id) {
    Utils.confirm('Delete Record', 'Are you sure you want to delete this transaction?', () => {
      this.data.expenses = this.data.expenses.filter(e => e.id !== id);
      this.saveData(); this.render();
      if (document.getElementById('finance-history-overlay')?.classList.contains('show')) this.renderHistoryItems();
      Utils.toast('Deleted', 'info');
    }, 'danger');
  },
  deleteIncome(id) {
    Utils.confirm('Delete Deposit', 'Are you sure you want to remove this income record?', () => {
      this.data.income = this.data.income.filter(e => e.id !== id);
      this.saveData(); this.render();
      if (document.getElementById('finance-history-overlay')?.classList.contains('show')) this.renderHistoryItems();
      Utils.toast('Deleted', 'info');
    }, 'danger');
  },
  deleteVault(id) {
    Utils.confirm('Remove Vault', 'This will delete this vault and all recorded savings inside it. Continue?', () => {
      this.data.savings = this.data.savings.filter(v => v.id !== id);
      this.saveData(); this.render();
      if (document.getElementById('finance-vault-overlay')?.classList.contains('show')) this.renderVaultOverlayItems();
      Utils.toast('Vault removed', 'info');
    }, 'danger');
  },

  showSavingsModal() {
    const sym = this.getSymbol();
    const html = `<div class="finance-modal-content"><div class="fin-modal-header"><div class="fin-modal-title">Create Vault</div></div><div class="fin-modal-amount-wrap"><div style="display:flex; align-items:center;"><span class="fin-modal-currency" style="color:var(--fin-green);">${sym}</span><input type="number" id="finance-savings-target" placeholder="0.00" class="fin-modal-amount-input" autofocus></div></div><div class="fin-field-group"><label class="fin-field-label">Vault Name</label><input type="text" id="finance-savings-name" placeholder="e.g. Dream House" class="fin-field-input"></div><div class="fin-modal-actions"><button class="fin-save-btn" style="background:var(--fin-green);" onclick="Finance.saveSavingsGoal()">Create</button><button class="fin-cancel-btn" onclick="Finance.closeModal()">Cancel</button></div></div>`;
    this.showModal(html);
  },

  saveSavingsGoal() {
    const name = document.getElementById('finance-savings-name').value;
    let target = parseFloat(document.getElementById('finance-savings-target').value);
    if (!name || isNaN(target) || target <= 0) return Utils.toast('Fill valid fields', 'error');
    if (DB.getSettings().currency === 'BDT') target /= this.exchangeRate;
    this.data.savings.push({ id: Utils.uid(), name, target, saved: 0 });
    this.saveData(); this.closeModal(); this.render();
    if (document.getElementById('finance-vault-overlay')?.classList.contains('show')) {
      this.renderVaultOverlayItems();
    }
  },

  addToSavings(id) {
    const sym = this.getSymbol();
    const goal = this.data.savings.find(s => s.id === id);
    if (!goal) return;

    if (goal.saved >= goal.target) {
      return Utils.toast('Goal already achieved! 🏆', 'info');
    }

    const mult = DB.getSettings().currency === 'BDT' ? this.exchangeRate : 1;
    const remaining = Math.max(0, (goal.target - goal.saved) * mult);

    const html = `
      <div class="finance-modal-content" style="max-width:400px;">
        <div class="fin-modal-header">
          <div class="fin-modal-title">Deposit to ${goal.name}</div>
          <button class="fin-modal-close" onclick="Finance.closeModal()">✕</button>
        </div>
        
        <p style="font-size:12px; color:var(--color-text-subtitle); margin-bottom:16px; line-height:1.4;">
          Enter the amount you would like to transfer to this savings vault.
          ${remaining > 0 ? `<br><span style="color:var(--fin-green); font-weight:800; display:inline-block; margin-top:4px;">Target Remaining: ${sym}${this.formatVal(goal.target - goal.saved)}</span>` : ''}
        </p>

        <div class="fin-modal-amount-wrap" style="margin-bottom:20px;">
          <div style="display:flex; align-items:center;">
            <span class="fin-modal-currency" style="color:var(--fin-green);">${sym}</span>
            <input type="number" id="vault-deposit-amount" placeholder="0.00" class="fin-modal-amount-input" autofocus>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:20px;">
          <button class="fin-chart-tab" style="padding:10px 0; font-size:12px; border-radius:12px; height:auto;" onclick="document.getElementById('vault-deposit-amount').value = 50">+50</button>
          <button class="fin-chart-tab" style="padding:10px 0; font-size:12px; border-radius:12px; height:auto;" onclick="document.getElementById('vault-deposit-amount').value = 100">+100</button>
          <button class="fin-chart-tab" style="padding:10px 0; font-size:12px; border-radius:12px; height:auto;" onclick="document.getElementById('vault-deposit-amount').value = 500">+500</button>
        </div>

        <div class="fin-modal-actions">
          <button class="fin-save-btn" style="background:var(--fin-green); width:100%; height:48px; border-radius:14px; font-weight:800;" onclick="Finance.confirmVaultDeposit('${id}')">Confirm Deposit</button>
        </div>
      </div>
    `;
    this.showModal(html);
  },

  confirmVaultDeposit(id) {
    const goal = this.data.savings.find(s => s.id === id);
    if (!goal) return;

    let amount = parseFloat(document.getElementById('vault-deposit-amount').value);
    if (isNaN(amount) || amount <= 0) {
      return Utils.toast('Invalid amount entered', 'error');
    }

    const mult = DB.getSettings().currency === 'BDT' ? this.exchangeRate : 1;
    const remainingInBase = goal.target - goal.saved; // USD base
    
    let amountInBase = amount;
    if (DB.getSettings().currency === 'BDT') amountInBase = amount / this.exchangeRate;

    // Strict validation: Prevent depositing more than remaining target (with a 0.01 tolerance for currency conversions)
    if (amountInBase > remainingInBase + 0.0001) {
      const remainingDisplay = remainingInBase * mult;
      const sym = this.getSymbol();
      return Utils.toast(`Cannot exceed remaining target! Needed: ${sym}${this.formatVal(remainingDisplay)}`, 'error');
    }

    const wasComplete = goal.saved >= goal.target;
    goal.saved += amountInBase;
    this.saveData();
    this.closeModal();
    this.render();

    if (document.getElementById('finance-vault-overlay')?.classList.contains('show')) {
      this.renderVaultOverlayItems();
    }

    Utils.toast(`Deposited successfully! 💰`, 'success');
    if (!wasComplete && goal.saved >= goal.target) {
      setTimeout(() => Utils.toast(`🏆 Goal "${goal.name}" Completed!`, 'success'), 500);
    }
  },

  toggleActivityLimit() {
    this.showAllActivity = true;
    this.render();
  },

  toggleVaultLimit() {
    this.showAllVaults = true;
    this.render();
  },

  showModal(c) { let o = document.getElementById('finance-modal-overlay'); if (!o) { o = document.createElement('div'); o.id = 'finance-modal-overlay'; o.className = 'finance-modal-overlay'; document.body.appendChild(o); } o.innerHTML = c; o.classList.add('show'); o.onclick = (e) => { if(e.target === o) this.closeModal(); }; },
  closeModal() { const o = document.getElementById('finance-modal-overlay'); if (o) o.classList.remove('show'); },

  showFullHistory() {
    this.historySearch = '';
    this.historyCategory = 'all';
    
    let overlay = document.getElementById('finance-history-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'finance-history-overlay';
      overlay.className = 'fin-history-overlay';
      document.body.appendChild(overlay);
    }

    const monthStr = this.currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const categoriesHtml = `<div class="fin-filter-pill ${this.historyCategory === 'all' ? 'active' : ''}" onclick="Finance.setHistoryFilter('all')">All</div>` + 
      this.categories.map(c => `<div class="fin-filter-pill ${this.historyCategory === c.id ? 'active' : ''}" onclick="Finance.setHistoryFilter('${c.id}')">${c.name}</div>`).join('');

    overlay.innerHTML = `
      <div class="fin-history-panel">
        <div class="fin-history-header">
          <div class="fin-history-title">History</div>
          <button class="fin-history-close" onclick="Finance.closeHistory()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="padding: 0 24px 8px; font-size: 13px; color: var(--color-text-muted); font-weight: 700;">${monthStr} Statement</div>
        
        <div class="fin-history-search-wrap">
          <div class="fin-history-search-box">
            <div class="fin-history-search-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input type="text" class="fin-history-search-input" placeholder="Search transactions..." oninput="Finance.handleHistorySearch(this.value)">
          </div>
        </div>

        <div class="fin-history-filters">${categoriesHtml}</div>
        
        <div class="fin-history-content" id="fin-history-list">
        </div>
      </div>
    `;

    overlay.classList.add('show');
    overlay.onclick = (e) => { if (e.target === overlay) this.closeHistory(); };
    this.renderHistoryItems();
  },

  closeHistory() {
    const o = document.getElementById('finance-history-overlay');
    if (o) o.classList.remove('show');
  },

  handleHistorySearch(val) {
    this.historySearch = val.toLowerCase();
    this.renderHistoryItems();
  },

  setHistoryFilter(cat) {
    this.historyCategory = cat;
    document.querySelectorAll('.fin-filter-pill').forEach(p => {
      p.classList.toggle('active', p.innerText.toLowerCase() === cat || (cat === 'all' && p.innerText === 'All'));
    });
    this.renderHistoryItems();
    
    const filters = document.querySelector('.fin-history-filters');
    if (filters) {
      const pills = filters.querySelectorAll('.fin-filter-pill');
      pills.forEach(p => p.classList.remove('active'));
      const activePill = Array.from(pills).find(p => 
        (cat === 'all' && p.innerText === 'All') || 
        (this.categories.find(c => c.id === cat)?.name === p.innerText)
      );
      if (activePill) activePill.classList.add('active');
    }
  },

  renderHistoryItems() {
    const container = document.getElementById('fin-history-list');
    if (!container) return;

    const m = this.currentViewDate.getMonth(), y = this.currentViewDate.getFullYear();
    const exps = this.data.expenses.filter(e => {
      const d = new Date(e.date);
      const matchesMonth = d.getMonth() === m && d.getFullYear() === y;
      const matchesSearch = e.description.toLowerCase().includes(this.historySearch);
      const matchesCat = this.historyCategory === 'all' || e.category === this.historyCategory;
      return matchesMonth && matchesSearch && matchesCat;
    }).map(e => ({...e, type: 'expense'}));

    const incs = this.data.income.filter(e => {
      const d = new Date(e.date);
      const matchesMonth = d.getMonth() === m && d.getFullYear() === y;
      const matchesSearch = e.description.toLowerCase().includes(this.historySearch);
      const matchesCat = this.historyCategory === 'all';
      return matchesMonth && matchesSearch && matchesCat;
    }).map(i => ({...i, type: 'income'}));

    let filtered = [...exps, ...incs].sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      if (b.id && a.id) return b.id.localeCompare(a.id);
      return 0;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:60px 20px; opacity:0.3; font-size:14px;">No transactions found</div>`;
      return;
    }

    const groups = {};
    filtered.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
    let html = "";
    let itemIdx = 0;

    for (const date of sortedDates) {
      const dObj = new Date(date);
      const label = dObj.toLocaleDateString('default', { day: 'numeric', month: 'short', weekday: 'short' });
      
      let itemsHtml = "";
      for (const e of groups[date]) {
        itemsHtml += this.renderActivityItem(e, itemIdx++);
      }

      html += `
        <div class="transaction-group" style="margin-bottom: 24px;">
          <div class="transaction-date-label" style="margin-bottom: 12px; font-size: 11px; opacity: 0.5;">${label}</div>
          <div class="transaction-list">${itemsHtml}</div>
        </div>
      `;
    }

    container.innerHTML = html;
  },

  showVaultsOverlay() {
    this.vaultSearch = '';
    let overlay = document.getElementById('finance-vault-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'finance-vault-overlay';
      overlay.className = 'fin-vault-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="fin-vault-panel">
        <div class="fin-vault-header">
          <div class="fin-vault-title">Vaults</div>
          <button class="fin-vault-close" onclick="Finance.closeVaults()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="padding: 0 24px 16px;">
          <button class="fin-save-btn" style="width:100%; height:48px; border-radius:14px; font-size:14px; font-weight:800;" onclick="Finance.showSavingsModal()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Create New Vault
          </button>
        </div>
        <div class="fin-vault-search-wrap">
          <div class="fin-vault-search-box">
            <div class="fin-vault-search-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input type="text" class="fin-vault-search-input" placeholder="Search vaults..." oninput="Finance.handleVaultSearch(this.value)">
          </div>
        </div>
        <div class="fin-vault-content" id="fin-vault-overlay-list">
        </div>
      </div>
    `;

    overlay.classList.add('show');
    overlay.onclick = (e) => { if (e.target === overlay) this.closeVaults(); };
    this.renderVaultOverlayItems();
  },

  closeVaults() {
    const o = document.getElementById('finance-vault-overlay');
    if (o) o.classList.remove('show');
  },

  handleVaultSearch(val) {
    this.vaultSearch = val.toLowerCase();
    this.renderVaultOverlayItems();
  },

  renderVaultOverlayItems() {
    const container = document.getElementById('fin-vault-overlay-list');
    if (!container) return;

    const filtered = [...this.data.savings].reverse().filter(v => v.name.toLowerCase().includes(this.vaultSearch));
    
    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:60px 20px; opacity:0.3; font-size:14px;">No vaults found</div>`;
      return;
    }

    container.innerHTML = `<div class="vault-overlay-grid">${filtered.map(v => this.renderSavingsItem(v)).join('')}</div>`;
  },
  showToolsModal() {
    const exchangeRateText = this.exchangeRate ? `1 USD = ${this.exchangeRate.toFixed(2)} BDT` : 'Loading rates...';
    
    const html = `
      <div class="finance-modal-content" style="max-width:400px;">
        <div class="fin-modal-header">
          <div class="fin-modal-title">Finance Settings</div>
          <button class="fin-modal-close" onclick="Finance.closeModal()">✕</button>
        </div>
        
        <div style="padding: 12px 0 20px;">
          <div class="fin-exchange-card">
            <div class="fin-live-badge">
              <span class="fin-pulse-dot"></span>
              Live Market Rate
            </div>
            <div style="font-size:20px; font-weight:800; color:var(--color-text-primary);">${exchangeRateText}</div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">
            <div style="font-size:11px; font-weight:800; color:var(--fin-red); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; opacity:0.6;">Danger Zone</div>

            <button class="fin-tool-btn" onclick="Finance.resetCurrentMonth()">
              <div class="fin-tool-icon" style="background:rgba(255,149,0,0.1); color:#FF9500;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
              </div>
              <div style="text-align:left;">
                <div style="font-weight:700; font-size:14px;">Clear Current Month</div>
                <div style="font-size:12px; opacity:0.6;">Delete all records for this month only</div>
              </div>
            </button>

            <button class="fin-tool-btn" onclick="Finance.resetAllData()">
              <div class="fin-tool-icon" style="background:rgba(255,59,48,0.1); color:var(--fin-red);">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M5 12h14"/></svg>
              </div>
              <div style="text-align:left;">
                <div style="font-weight:700; font-size:14px; color:var(--fin-red);">Factory Reset (Full Wipe)</div>
                <div style="font-size:12px; opacity:0.6;">Erase all history and all vaults</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;
    this.showModal(html);
  },

  resetCurrentMonth() {
    const m = this.currentViewDate.getMonth(), y = this.currentViewDate.getFullYear();
    const monthName = this.currentViewDate.toLocaleString('default', { month: 'long' });
    
    Utils.confirm('Reset Month', `Delete all transactions and records for ${monthName} ${y}?`, () => {
      this.data.expenses = this.data.expenses.filter(e => { const d = new Date(e.date); return !(d.getMonth() === m && d.getFullYear() === y); });
      this.data.income = this.data.income.filter(i => { const d = new Date(i.date); return !(d.getMonth() === m && d.getFullYear() === y); });
      this.saveData();
      this.closeModal();
      this.render();
      Utils.toast(`${monthName} data cleared`, 'info');
    }, 'warning');
  },

  resetAllData() {
    Utils.confirm('WIPE ALL DATA', 'This will delete ALL transactions, income, and vaults forever across all years. This action is irreversible. Proceed?', () => {
      this.data = { expenses: [], savings: [], income: [] };
      this.saveData();
      this.closeModal();
      this.render();
      Utils.toast('All finance history wiped', 'info');
    }, 'danger');
  },

  exportPDF() {
    const v = this.currentViewDate, sym = this.getSymbol();
    const mStr = v.toLocaleString('default', { month: 'long', year: 'numeric' });
    const exps = this.data.expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === v.getMonth() && d.getFullYear() === v.getFullYear(); });
    const incs = this.data.income.filter(i => { const d = new Date(i.date); return d.getMonth() === v.getMonth() && d.getFullYear() === v.getFullYear(); });
    const total = exps.reduce((s, e) => s + e.amount, 0);
    const stats = this.getStats(v);

    // Merge both income and expenses into a unified list, sorted chronologically (newest first)
    const txs = [
      ...exps.map(e => ({ ...e, type: 'expense' })),
      ...incs.map(i => ({ ...i, type: 'income' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>LAMIM - Digital Statement</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
            
            @page { margin: 0; }
            body { 
              font-family: 'Outfit', sans-serif; 
              padding: 0; margin: 0; 
              background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #f5f3ff 100%);
              color: #0f172a; 
              min-height: 100vh;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .container { 
              width: 800px; margin: 0 auto; padding: 60px; position: relative; 
              background: rgba(255, 255, 255, 0.7);
              backdrop-filter: blur(10px);
              min-height: 100vh;
              box-sizing: border-box;
            }

            .cyber-seal {
              position: absolute; top: 40px; right: 60px;
              width: 85px; height: 85px;
              border: 2px dashed #6366f1; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              font-size: 10px; font-weight: 900; color: #6366f1;
              text-align: center; transform: rotate(15deg);
              opacity: 0.4;
            }

            .hero { margin-bottom: 50px; }
            .brand-row { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
            .brand-logo { width: 32px; height: 32px; background: linear-gradient(45deg, #4f46e5, #06b6d4); border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
            .brand-name { font-size: 20px; font-weight: 900; color: #4f46e5; letter-spacing: -1px; }
            
            .report-title { font-size: 52px; font-weight: 900; letter-spacing: -3px; margin: 0; color: #1e1b4b; line-height: 1; }
            .report-date { font-size: 16px; font-weight: 600; color: #6366f1; margin-top: 10px; opacity: 0.8; }

            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 50px; }
            .stat-card { 
              background: white; padding: 24px; border-radius: 28px; 
              box-shadow: 0 10px 25px rgba(0,0,0,0.03);
              border: 1px solid rgba(255,255,255,0.8);
            }
            .stat-card.dark { background: #1e1b4b; color: white; border: none; box-shadow: 0 20px 40px rgba(30, 27, 75, 0.2); }
            .label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 10px; display: block; }
            .val { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
            
            .ledger-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; padding: 0 10px; }
            .ledger-title { font-size: 20px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px; }
            
            table { width: 100%; border-collapse: separate; border-spacing: 0 12px; margin-top: -12px; }
            th { text-align: left; padding: 10px 20px; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
            td { 
              padding: 18px 20px; background: white; 
              border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
            }
            td:first-child { border-left: 1px solid #f1f5f9; border-radius: 20px 0 0 20px; }
            td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 20px 20px 0; }

            .amount { font-weight: 900; font-size: 17px; text-align: right; letter-spacing: -0.5px; }
            .neg { color: #f43f5e; }
            .pos { color: #10b981; }

            .cat-tag { 
              padding: 6px 12px; border-radius: 10px; font-size: 10px; font-weight: 800; 
              background: #f8fafc; color: #64748b; border: 1px solid #f1f5f9; text-transform: uppercase;
            }

            .footer { 
              margin-top: 80px; text-align: center; padding: 50px 0; 
              border-top: 1px solid rgba(0,0,0,0.05);
            }
            .footer-text { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; }
            
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .container { width: 100%; box-shadow: none; background: transparent; padding: 40px; }
              .stat-card { border: 1px solid #f1f5f9; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="cyber-seal">CERTIFIED<br>LAMIM<br>LEDGER</div>
            
            <div class="hero">
              <div class="brand-row">
                <div class="brand-logo"></div>
                <div class="brand-name">LAMIM FINTECH</div>
              </div>
              <h1 class="report-title">${mStr}</h1>
              <div class="report-date">Automated Financial Asset Report • ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <span class="label">Opening Balance</span>
                <div class="val" style="color: #64748b;">${sym}${this.formatVal(stats.openingBalance)}</div>
              </div>
              <div class="stat-card">
                <span class="label">Total Income</span>
                <div class="val pos">+${sym}${this.formatVal(stats.income)}</div>
              </div>
              <div class="stat-card">
                <span class="label">Monthly Spend</span>
                <div class="val neg">-${sym}${this.formatVal(total)}</div>
              </div>
              <div class="stat-card dark">
                <span class="label" style="color:rgba(255,255,255,0.4)">Closing Balance</span>
                <div class="val">${sym}${this.formatVal(stats.closingBalance)}</div>
              </div>
            </div>

            <div class="ledger-header">
              <div class="ledger-title">Transaction Ledger</div>
              <div style="font-size:11px; color:#94a3b8; font-weight:800;">DATA SYNCED: ${new Date().toLocaleTimeString()}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Timeframe</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style="text-align:right;">Impact</th>
                </tr>
              </thead>
              <tbody>
                ${txs.map(t => {
                  const isInc = t.type === 'income';
                  const sign = isInc ? '+' : '-';
                  const classColor = isInc ? 'pos' : 'neg';
                  const catText = isInc ? 'INCOME' : t.category;
                  const catBg = isInc ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc';
                  const catColor = isInc ? '#10b981' : '#64748b';
                  const catBorder = isInc ? 'rgba(16, 185, 129, 0.15)' : '#f1f5f9';

                  return `
                    <tr>
                      <td style="color:#6366f1; font-weight:800; font-size:13px;">${new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                      <td style="font-weight:700; color:#1e1b4b; font-size:15px;">${t.description}</td>
                      <td><span class="cat-tag" style="background:${catBg}; color:${catColor}; border:1px solid ${catBorder};">${catText}</span></td>
                      <td class="amount ${classColor}">${sign}${sym}${this.formatVal(t.amount)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="footer">
              <div class="footer-text">LAMIM ECOSYSTEM — SECURE FINANCE</div>
              <div style="font-size:10px; color:#cbd5e1; margin-top:12px; font-weight:600;">© 2026 LAMIM. All Financial Data Encrypted Locally.</div>
            </div>
          </div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 800); }</script>
        </body>
      </html>
    `);
    win.document.close();
  },

  initChart(stats) {
    const canvas = document.getElementById('finance-main-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (this.mainChart) this.mainChart.destroy();

    let labels = [];
    let data = [];
    const v = this.currentViewDate;
    const m = v.getMonth(), y = v.getFullYear();

    if (this.chartView === 'daily') {
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      data = new Array(daysInMonth).fill(0);
      this.data.expenses.forEach(e => {
        const d = new Date(e.date);
        if (d.getMonth() === m && d.getFullYear() === y) {
          data[d.getDate() - 1] += e.amount;
        }
      });
      labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = new Array(12).fill(0);
      this.data.expenses.filter(e => new Date(e.date).getFullYear() === y).forEach(e => {
        data[new Date(e.date).getMonth()] += e.amount;
      });
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const sym = this.getSymbol();
    const currencyMult = DB.getSettings().currency === 'BDT' ? this.exchangeRate : 1;
    const displayData = data.map(v => v * currencyMult);
    const isDaily = this.chartView === 'daily';

    // Premium Color System
    const accentColor = isDaily ? '#3b82f6' : '#a855f7'; // Vibrant Blue for Daily, Purple for Monthly
    const fillGradient = ctx.createLinearGradient(0, 0, 0, 240);
    
    if (isDaily) {
      fillGradient.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
      fillGradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.08)');
      fillGradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    } else {
      fillGradient.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
      fillGradient.addColorStop(0.6, 'rgba(168, 85, 247, 0.08)');
      fillGradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
    }

    // Dynamic contrast color resolution using CSS variables
    const getStyleVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const tickColor = isDark ? '#cbd5e1' : '#334155'; // High contrast Slate-300 in dark mode, Slate-700 in light mode
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(99, 102, 241, 0.08)';

    this.mainChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: isDaily ? 'Daily Spend' : 'Monthly Spend',
          data: displayData,
          borderColor: accentColor,
          borderWidth: 3.5,
          tension: 0.35,
          fill: true,
          backgroundColor: fillGradient,
          // Only show circular points on days with actual expenses to avoid baseline clutter
          pointRadius: displayData.map(v => v > 0 ? 7 : 0), // Larger radius to show the hollow center
          pointHoverRadius: displayData.map(v => v > 0 ? 9 : 0),
          pointHitRadius: 12,
          pointBackgroundColor: isDark ? '#0a0f1c' : '#ffffff', // Matches primary background for hollow effect
          pointBorderColor: accentColor,
          pointBorderWidth: 2.5, // Thinner border to leave a clear center hole
          clip: false, // Prevents points at the top/sides from being cut off
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 14, // Extra top breathing room for point markers
            bottom: 4,
            left: 8,
            right: 8
          }
        },
        animation: {
          y: { type: 'number', easing: 'easeOutQuart', duration: 800, from: (c) => c.chart.scales.y.getPixelForValue(0) }
        },
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? 'rgba(20,20,25,0.96)' : 'rgba(255,255,255,0.98)',
            titleColor: isDark ? '#ffffff' : '#0f172a',
            bodyColor: isDark ? '#ffffff' : '#0f172a',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 10,
            displayColors: false,
            callbacks: {
              title: (items) => isDaily ? `Day ${items[0].label}` : items[0].label,
              label: (item) => `Spent: ${sym}${this.formatVal(item.raw / currencyMult)}`
            }
          }
        },
        scales: {
          x: { 
            grid: { display: false }, 
            ticks: { 
              color: tickColor, // Optimized contrast Slate color
              font: { size: 10, weight: '700' }, 
              autoSkip: true, 
              maxTicksLimit: 12 
            } 
          },
          y: { 
            position: 'right', 
            beginAtZero: true, 
            grace: '15%', // Adds 15% buffer at the top of the scale so peaks don't touch the edge
            grid: { 
              color: gridColor, // Subtle theme-aware grid lines
              drawBorder: false 
            }, 
            ticks: { 
              color: tickColor, // Optimized contrast Slate color
              font: { size: 10, weight: '700' }, 
              callback: (v) => {
                if (v <= 0) return '';
                const baseVal = v / currencyMult;
                const converted = DB.getSettings().currency === 'BDT' ? baseVal * this.exchangeRate : baseVal;
                return sym + Math.round(converted).toLocaleString();
              }
            } 
          }
        }
      }
    });
  },

  getStats(v) {
    const m = v.getMonth(), y = v.getFullYear();
    const endOfViewMonth = new Date(y, m + 1, 0, 23, 59, 59); // Last second of the viewed month

    // Monthly View Stats (Specific to this month)
    const monthlyIncome = this.data.income.filter(o => { const d = new Date(o.date); return d.getMonth() === m && d.getFullYear() === y; }).reduce((s, o) => s + o.amount, 0);
    const monthlyExpenses = this.data.expenses.filter(o => { const d = new Date(o.date); return d.getMonth() === m && d.getFullYear() === y; }).reduce((s, o) => s + o.amount, 0);
    
    // Absolute Current Balance (Total money currently on hand across all time)
    const totalIncome = this.data.income.reduce((s, o) => s + o.amount, 0);
    const totalExpenses = this.data.expenses.reduce((s, o) => s + o.amount, 0);

    // Closing Balance of the viewed month (Cumulative up to the end of the viewed month)
    const closingIncome = this.data.income.filter(o => new Date(o.date) <= endOfViewMonth).reduce((s, o) => s + o.amount, 0);
    const closingExpenses = this.data.expenses.filter(o => new Date(o.date) <= endOfViewMonth).reduce((s, o) => s + o.amount, 0);
    
    // Opening Balance of the viewed month (Cumulative up to the start of the viewed month)
    const startOfViewMonth = new Date(y, m, 1, 0, 0, 0);
    const openingIncome = this.data.income.filter(o => new Date(o.date) < startOfViewMonth).reduce((s, o) => s + o.amount, 0);
    const openingExpenses = this.data.expenses.filter(o => new Date(o.date) < startOfViewMonth).reduce((s, o) => s + o.amount, 0);
    const openingBalance = openingIncome - openingExpenses;
    
    return { 
      income: monthlyIncome, 
      expenses: monthlyExpenses, 
      balance: monthlyIncome - monthlyExpenses,
      totalAllTime: totalIncome - totalExpenses,
      closingBalance: closingIncome - closingExpenses,
      openingBalance: openingBalance
    };
  }
};
