/* =============================================
   LAMIM — OFFLINE AUTH/SETUP MODULE
   ============================================= */
const Auth = {
  init() {
    this.selectedGender = null;
    this.bindSetup();
  },

  setGender(gender) {
    this.selectedGender = gender;
    const maleCard = document.getElementById('setup-gender-male');
    const femaleCard = document.getElementById('setup-gender-female');
    if (gender === 'male') {
      maleCard?.classList.add('active');
      femaleCard?.classList.remove('active');
    } else {
      femaleCard?.classList.add('active');
      maleCard?.classList.remove('active');
    }
  },

  setLang(lang) {
    const hiddenInput = document.getElementById('setup-lang');
    if (hiddenInput) hiddenInput.value = lang;
    const cardEn = document.getElementById('pref-lang-en');
    const cardBn = document.getElementById('pref-lang-bn');
    if (lang === 'en') {
      cardEn?.classList.add('active');
      cardBn?.classList.remove('active');
    } else {
      cardBn?.classList.add('active');
      cardEn?.classList.remove('active');
    }
  },

  setCurrency(curr) {
    const hiddenInput = document.getElementById('setup-currency');
    if (hiddenInput) hiddenInput.value = curr;
    const currencies = ['USD', 'BDT', 'SAR', 'EUR', 'GBP'];
    currencies.forEach(c => {
      const card = document.getElementById(`curr-${c}`);
      if (c === curr) {
        card?.classList.add('active');
      } else {
        card?.classList.remove('active');
      }
    });
  },

  nextStep(currentStep) {
    if (currentStep === 1) {
      const nameInput = document.getElementById('setup-name');
      const err = document.getElementById('setup-name-err');
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.classList.add('input-error');
        if (err) { err.textContent = 'Name is required'; err.classList.add('show'); }
        nameInput.focus();
        return;
      }
      nameInput.classList.remove('input-error');
      if (err) err.classList.remove('show');
    }
    
    if (currentStep === 2) {
      if (!this.selectedGender) {
        Utils.toast('Please select a gender to continue', 'warning');
        return; // Prevent skipping
      }
    }

    // Step 3 (DOB) always has a valid value via drum picker, so we can proceed safely
    this.goToStep(currentStep + 1);
  },

  prevStep(currentStep) {
    this.goToStep(currentStep - 1);
  },

  goToStep(stepNum) {
    const wrapper = document.getElementById('setup-steps-wrapper');
    if (!wrapper) return;

    // 4 steps — each is 25% wide
    const translatePct = -((stepNum - 1) * 25);
    wrapper.style.transform = `translateX(${translatePct}%)`;

    // Update progress dots
    const dots = document.querySelectorAll('.setup-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === (stepNum - 1));
    });

    // Re-trigger anim-target animations on the new step
    const newStep = document.querySelector(`.setup-step[data-step="${stepNum}"]`);
    if (newStep) {
      newStep.querySelectorAll('.anim-target').forEach((el, i) => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = '';
        el.style.animationDelay = (i * 0.08) + 's';
      });
    }

    // Initialise DOB drum picker when arriving at step 3
    if (stepNum === 3) this.initDOBPicker();
  },

  initDOBPicker() {
    if (this._dobReady) return;
    this._dobReady = true;

    const ITEM_H = 44;
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let selD = 0, selM = 0, selY = 60;

    const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();

    const fill = (colId, labels, defaultIdx) => {
      const col = document.getElementById(colId);
      if (!col) return;
      let h = '<div class="dob-drum-pad"></div>';
      labels.forEach(l => { h += `<div class="dob-drum-item">${l}</div>`; });
      h += '<div class="dob-drum-pad"></div>';
      col.innerHTML = h;
      requestAnimationFrame(() => { col.scrollTop = defaultIdx * ITEM_H; });
      let t;
      col.addEventListener('scroll', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const idx = Math.round(col.scrollTop / ITEM_H);
          col.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
        }, 80);
      }, { passive: true });
      return col;
    };

    const rebuildDays = () => {
      const max = daysInMonth(selM, 1930 + selY);
      const labels = Array.from({length: max}, (_,i) => String(i+1).padStart(2,'0'));
      return fill('dob-col-d', labels, Math.min(selD, max - 1));
    };

    const years = Array.from({length:86}, (_,i) => String(1930+i));

    let colD = fill('dob-col-d', Array.from({length:31}, (_,i) => String(i+1).padStart(2,'0')), selD);
    const colM = fill('dob-col-m', MONTHS, selM);
    const colY = fill('dob-col-y', years, selY);

    const sync = () => {
      const prevM = selM, prevY = selY;
      if (colD) selD = Math.min(Math.round(colD.scrollTop / ITEM_H), daysInMonth(selM, 1930 + selY) - 1);
      if (colM) selM = Math.round(colM.scrollTop / ITEM_H);
      if (colY) selY = Math.round(colY.scrollTop / ITEM_H);
      if (selM !== prevM || selY !== prevY) {
        colD = rebuildDays();
      }
      const inp = document.getElementById('setup-dob');
      if (inp) inp.value = `${1930+selY}-${String(selM+1).padStart(2,'0')}-${String(selD+1).padStart(2,'0')}`;
    };

    [colD, colM, colY].forEach(col => {
      if (!col) return;
      col.addEventListener('scroll', () => { clearTimeout(col._st); col._st = setTimeout(sync, 120); }, {passive:true});
    });

    sync();
  },

  async detectLocation(e) {
    if (this._isSyncingLocation) return;
    this._isSyncingLocation = true;

    const statusText = document.getElementById('setup-location-status');
    const icon = document.getElementById('setup-detect-icon');
    const latInput = document.getElementById('setup-lat');
    const lngInput = document.getElementById('setup-lng');
    const err = document.getElementById('setup-loc-err');

    if (statusText) statusText.textContent = 'Detecting your coordinates...';
    if (icon) icon.classList.add('rotating');
    if (err) err.classList.remove('show');

    const updateFields = async (lat, lng, isIP = false) => {
      if (latInput) latInput.value = lat.toFixed(6);
      if (lngInput) lngInput.value = lng.toFixed(6);

      let locationName = '';
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await res.json();
        const city = data.city || data.locality || '';
        const country = data.countryName || '';
        locationName = city && country ? `${city}, ${country}` : (city || country || 'Detected Location');
      } catch (geocodeErr) {
        locationName = isIP ? 'Detected via IP' : (lat.toFixed(2) + ', ' + lng.toFixed(2));
      }

      if (statusText) statusText.textContent = `Detected: ${locationName}`;
      Utils.toast(`Location detected: ${locationName}`, 'success');
      if (icon) icon.classList.remove('rotating');
      this._isSyncingLocation = false;
    };

    if (!navigator.geolocation) {
      this.ipLocationFallback(updateFields, icon, statusText);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => updateFields(pos.coords.latitude, pos.coords.longitude),
      (geoErr) => {
        console.warn("Setup geolocation failed, trying IP fallback...", geoErr);
        this.ipLocationFallback(updateFields, icon, statusText);
      },
      { timeout: 6000 }
    );
  },

  async ipLocationFallback(updateFields, icon, statusText) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        updateFields(data.latitude, data.longitude, true);
      } else {
        throw new Error("IP Geolocation failed");
      }
    } catch (ipErr) {
      Utils.toast('Could not detect location. Please input coordinates manually.', 'warning');
      if (statusText) statusText.textContent = 'Auto-detection failed. Enter manually.';
      if (icon) icon.classList.remove('rotating');
      this._isSyncingLocation = false;
    }
  },

  submitSetup() {
    try {
      const nameInput = document.getElementById('setup-name');
      const name = (nameInput ? nameInput.value.trim() : '');

      if (!name) {
        this.goToStep(1);
        if (nameInput) nameInput.classList.add('input-error');
        const err = document.getElementById('setup-name-err');
        if (err) { err.textContent = 'Name is required'; err.classList.add('show'); }
        return;
      }

      const langSelect = document.getElementById('setup-lang');
      const currencySelect = document.getElementById('setup-currency');
      const latInput = document.getElementById('setup-lat');
      const lngInput = document.getElementById('setup-lng');
      const dobInput = document.getElementById('setup-dob');
      const bioInput = document.getElementById('setup-bio');

      if (!latInput || !latInput.value || isNaN(parseFloat(latInput.value)) || !lngInput || !lngInput.value || isNaN(parseFloat(lngInput.value))) {
        Utils.toast('Please detect your location or enter coordinates manually', 'warning');
        const err = document.getElementById('setup-loc-err');
        if (err) { err.textContent = 'Location is required'; err.classList.add('show'); }
        return; // Prevent form submission without location
      }

      const language = langSelect ? langSelect.value : 'en';
      const currency = currencySelect ? currencySelect.value : 'USD';
      const lat = parseFloat(latInput.value);
      const lng = parseFloat(lngInput.value);
      const gender = this.selectedGender || 'male';
      const dob = dobInput ? dobInput.value : '';
      const bio = bioInput ? bioInput.value.trim() : '';

      const user = {
        id: 'local_' + Date.now(),
        name: name,
        email: 'local@lamim.offline',
        role: 'user',
        gender: gender,
        dob: dob,
        bio: bio,
        avatar: null,
        location: '',
        createdAt: new Date().toISOString()
      };

      const settings = DB.getSettings();
      settings.language = language;
      settings.currency = currency;
      settings.lat = lat;
      settings.lng = lng;

      const statusText = document.getElementById('setup-location-status');
      if (statusText && statusText.textContent.startsWith('Detected: ')) {
        settings.locationName = statusText.textContent.replace('Detected: ', '');
      } else {
        settings.locationName = lat.toFixed(2) + ', ' + lng.toFixed(2);
      }

      DB.setUser(user);
      DB.setSettings(settings);

      Utils.toast('Welcome, ' + name + '!', 'success');

      setTimeout(() => {
        App.showDashboard();
      }, 400);
    } catch (err) {
      console.error('[Auth] submitSetup error:', err);
      Utils.toast('Something went wrong. Please try again.', 'error');
    }
  },

  bindSetup() {
    if (this._setupBound) return;
    this._setupBound = true;
    const form = document.getElementById('setup-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('setup-name');
      const err = document.getElementById('setup-name-err');
      const name = nameInput.value.trim();
      
      if (!name) {
        this.goToStep(1);
        nameInput.classList.add('input-error');
        if (err) { err.textContent = 'Name is required'; err.classList.add('show'); }
        return;
      }

      const langSelect = document.getElementById('setup-lang');
      const currencySelect = document.getElementById('setup-currency');
      const latInput = document.getElementById('setup-lat');
      const lngInput = document.getElementById('setup-lng');

      const language = langSelect ? langSelect.value : 'en';
      const currency = currencySelect ? currencySelect.value : 'USD';
      const lat = latInput ? parseFloat(latInput.value) : 23.8103;
      const lng = lngInput ? parseFloat(lngInput.value) : 90.4125;

      const user = { 
        id: 'local_' + Date.now(), 
        name: name, 
        email: 'local@lamim.offline',
        role: 'user',
        gender: '',
        age: '',
        avatar: null, 
        location: '', 
        createdAt: new Date().toISOString()
      };
      
      const settings = DB.getSettings();
      settings.language = language;
      settings.currency = currency;
      settings.lat = lat;
      settings.lng = lng;
      
      const statusText = document.getElementById('setup-location-status');
      if (statusText && statusText.textContent.startsWith('Detected: ')) {
        settings.locationName = statusText.textContent.replace('Detected: ', '');
      } else {
        settings.locationName = lat.toFixed(2) + ', ' + lng.toFixed(2);
      }

      DB.setUser(user);
      DB.setSettings(settings);

      if (typeof Home !== 'undefined') Home.render();
      if (typeof Salah !== 'undefined') Salah.init();
      if (typeof Profile !== 'undefined') {
        Profile.renderSettings();
        Profile.render();
      }

      Utils.toast('Welcome, ' + name + '!', 'success');
      
      setTimeout(() => {
        App.showDashboard();
      }, 500);
    });
  },

  logout() {
    Utils.confirm(
      'Reset Data',
      'Are you sure you want to delete your profile? This will log you out but keep your local data.',
      () => {
        DB.remove('lamim_user');
        Utils.toast('Logged out successfully', 'info');
        setTimeout(() => App.showPage('setup'), 500);
      }
    );
  }
};
