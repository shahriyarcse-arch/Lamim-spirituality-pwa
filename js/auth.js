/* =============================================
   LAMIM — AUTH MODULE
   ============================================= */
const Auth = {
  init() {
    this.bindLogin();
    this.bindSignup();
    this.bindForgot();
  },

  bindLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!this.validateLogin()) return;
      const email = document.getElementById('login-email').value.trim();
      const pass  = document.getElementById('login-pass').value;
      const user  = DB.getUser();
      if (user && user.email === email && user.password === btoa(pass)) {
        Utils.toast('Welcome back, ' + user.name + '!', 'success');
        setTimeout(() => App.showDashboard(), 600);
      } else {
        this.showError('login-email', 'Invalid email or password');
        Utils.toast('Invalid credentials', 'error');
      }
    });
    document.getElementById('show-password-login')?.addEventListener('click', () => this.togglePass('login-pass', 'show-password-login'));
  },

  bindSignup() {
    const form = document.getElementById('signup-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!this.validateSignup()) return;
      const name  = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const pass  = document.getElementById('signup-pass').value;
      const gender = document.getElementById('signup-gender').value;
      const age = document.getElementById('signup-age').value;
      
      const user  = { id: Utils.uid(), name, email, password: btoa(pass), gender, age, avatar: null, location: '', madhab: 'Hanafi', createdAt: new Date().toISOString() };
      DB.setUser(user);
      Utils.toast('Account created! Welcome, ' + name, 'success');
      setTimeout(() => App.showDashboard(), 700);
    });
  },

  bindForgot() {
    const form = document.getElementById('forgot-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      if (!email) { this.showError('forgot-email', 'Enter your email'); return; }
      // Simulate OTP
      document.getElementById('forgot-step1').classList.add('hidden');
      document.getElementById('forgot-step2').classList.remove('hidden');
      Utils.toast('OTP sent to ' + email, 'info');
    });
    document.getElementById('forgot-verify-btn')?.addEventListener('click', () => {
      const otp = document.getElementById('forgot-otp').value;
      if (otp === '1234') {
        document.getElementById('forgot-step2').classList.add('hidden');
        document.getElementById('forgot-step3').classList.remove('hidden');
      } else {
        Utils.toast('Incorrect OTP (hint: 1234)', 'error');
      }
    });
    document.getElementById('forgot-reset-btn')?.addEventListener('click', () => {
      const pass = document.getElementById('new-pass').value;
      if (pass.length < 6) { Utils.toast('Password too short', 'error'); return; }
      const user = DB.getUser();
      if (user) { user.password = btoa(pass); DB.setUser(user); }
      Utils.toast('Password reset! Please login.', 'success');
      setTimeout(() => App.showPage('login'), 800);
    });
  },

  validateLogin() {
    let ok = true;
    const email = document.getElementById('login-email');
    const pass  = document.getElementById('login-pass');
    this.clearError('login-email'); this.clearError('login-pass');
    if (!email.value.trim() || !email.value.includes('@')) { this.showError('login-email', 'Valid email required'); ok = false; }
    if (!pass.value || pass.value.length < 1) { this.showError('login-pass', 'Password required'); ok = false; }
    return ok;
  },

  validateSignup() {
    let ok = true;
    ['signup-name','signup-email','signup-pass','signup-confirm-pass'].forEach(id => this.clearError(id));
    const name  = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass  = document.getElementById('signup-pass').value;
    const confirm = document.getElementById('signup-confirm-pass')?.value;
    const terms = document.getElementById('signup-terms');

    if (!name) { this.showError('signup-name', 'Name is required'); ok = false; }
    if (!email.includes('@')) { this.showError('signup-email', 'Valid email required'); ok = false; }
    if (pass.length < 6) { this.showError('signup-pass', 'Min 6 characters'); ok = false; }
    if (pass !== confirm) { this.showError('signup-confirm-pass', 'Passwords do not match'); ok = false; }
    if (terms && !terms.checked) { Utils.toast('Please agree to terms', 'error'); ok = false; }
    return ok;
  },

  showError(inputId, msg) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(inputId + '-err');
    if (input) input.classList.add('input-error');
    if (err)   { err.textContent = msg; err.classList.add('show'); }
  },

  clearError(inputId) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(inputId + '-err');
    if (input) input.classList.remove('input-error');
    if (err)   err.classList.remove('show');
  },

  togglePass(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn   = document.getElementById(btnId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    if (btn) btn.textContent = isPass ? '🙈' : '👁️';
  },

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      Utils.toast('Logged out successfully', 'info');
      setTimeout(() => App.showPage('login'), 500);
    }
  }
};
