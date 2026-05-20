/* =============================================
   LAMIM — AUTH MODULE
   ============================================= */
const Auth = {
  init() {
    this.bindLogin();
    this.bindSignup();
    this.bindForgot();

    // Official Supabase way to handle Password Recovery
    if (window.supabaseClient) {
      window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery event detected!");
          setTimeout(() => {
            App.showPage('forgot');
            const s1 = document.getElementById('forgot-step1');
            const s2 = document.getElementById('forgot-step2');
            const s3 = document.getElementById('forgot-step3');
            if (s1) s1.classList.add('hidden');
            if (s2) s2.classList.add('hidden');
            if (s3) s3.classList.remove('hidden');
            Utils.toast('Recovery session active. Please set your new password.', 'info');
          }, 500);
        }
      });
    }
  },

  emailConfirmationEnabledDate: new Date('2025-06-01'),

  isEmailConfirmed(user) {
    return Boolean(user?.email_confirmed_at || user?.confirmed_at);
  },

  isOldAccount(user) {
    if (!user?.created_at) return false;
    const accountCreatedDate = new Date(user.created_at);
    if (Number.isNaN(accountCreatedDate.valueOf())) return false;
    return accountCreatedDate < this.emailConfirmationEnabledDate;
  },

  requiresEmailVerification(user) {
    const emailConfirmed = this.isEmailConfirmed(user);
    return !emailConfirmed || this.isOldAccount(user);
  },

  bindLogin() {
    if (this._loginBound) return;
    this._loginBound = true;
    const form = document.getElementById('login-form');
    if (!form) return;
    const googleBtn = form.querySelector('.google-btn-xoss');
    const resendBlock = document.getElementById('resend-verification-block');
    const resendText = document.getElementById('resend-verification-text');
    const resendBtn = document.getElementById('resend-verification-btn');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.handleGoogleSignIn());
    }
    if (resendBtn) {
      resendBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        if (!this.isValidEmail(email)) {
          Utils.toast('Enter a valid email first', 'error');
          return;
        }
        await this.resendVerificationEmail(email);
      });
    }
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!this.validateLogin()) return;
      if (resendBlock) resendBlock.style.display = 'none';
      
      const email = document.getElementById('login-email').value.trim();
      const pass  = document.getElementById('login-pass').value;
      const btn   = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.textContent : '';
      
      if (btn) btn.textContent = 'Authenticating...';

      try {
        if (!window.supabaseClient) throw new Error("Database connection not initialized yet. Please refresh the page.");

        // 1. Supabase Cloud Login
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email: email,
          password: pass,
        });

        if (btn) btn.textContent = originalText;

        if (error) {
          this.showError('login-email', error.message);
          Utils.toast(error.message, 'error');
        } else if (data.user) {
          const emailConfirmed = this.isEmailConfirmed(data.user);
          const isOldAccount = this.isOldAccount(data.user);
          const requiresReverification = isOldAccount && emailConfirmed;

          if (!emailConfirmed || requiresReverification) {
            await window.supabaseClient.auth.signOut();

            if (requiresReverification) {
              Utils.toast('Please re-verify your email to continue.', 'warning');
              if (resendBlock && resendText) {
                resendText.textContent = 'Your account was created before email confirmation was enabled. Click below to receive a new verification email.';
                resendBlock.style.display = 'block';
                const emailInput = document.getElementById('login-email');
                if (emailInput) emailInput.value = email;
              }
            } else {
              Utils.toast('Please verify your email before logging in.', 'warning');
              if (resendBlock && resendText) {
                resendText.textContent = 'Your email is not verified yet. Click below to resend the verification email.';
                resendBlock.style.display = 'block';
                const emailInput = document.getElementById('login-email');
                if (emailInput) emailInput.value = email;
              }
            }
            return;
          }

          if (resendBlock) resendBlock.style.display = 'none';

          let { data: prof, error: pErr } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          // HEALING LOGIC: If profile is missing in public.profiles, create it now
          if (!prof || pErr) {
            // console.log("Profile missing, creating recovery record...");
            const name = data.user.user_metadata?.name || email.split('@')[0];
            const { data: newProf, error: iErr } = await window.supabaseClient
              .from('profiles')
              .insert([{
                id: data.user.id,
                name: name,
                email: email,
                role: 'user'
              }])
              .select()
              .single();
            
            if (!iErr) prof = newProf;
          }

          const name = prof?.name || data.user.user_metadata?.name || email.split('@')[0];
          const user = { 
            id: data.user.id, 
            name: name, 
            email: data.user.email,
            role: prof?.role || 'user',
            gender: prof?.gender || data.user.user_metadata?.gender || '',
            age: prof?.age || data.user.user_metadata?.age || '',
            avatar: prof?.avatar || null, 
            location: prof?.location || '', 
            createdAt: data.user.created_at
          };
          
          DB.setUser(user);
          Utils.toast('Welcome back, ' + name + '!', 'success');
          setTimeout(() => {
            App.checkAdminUI();
            if (user.role === 'admin') {
              App.showDashboard('admin');
            } else {
              App.showDashboard();
            }
            if (window.Sync) window.Sync.pullAll();
          }, 600);
        }
      } catch (err) {
        if (btn) btn.textContent = originalText;
        Utils.toast(err.message || 'Authentication failed', 'error');
        console.error("Login Error:", err);
      }
    });
    document.getElementById('show-password-login')?.addEventListener('click', () => this.togglePass('login-pass', 'show-password-login'));
  },

  async handleGoogleSignIn() {
    if (!window.supabaseClient) {
      Utils.toast('Database connection not initialized yet. Please refresh the page.', 'error');
      return;
    }

    try {
      const { error } = await window.supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        Utils.toast(error.message, 'error');
      } else {
        Utils.toast('Redirecting to Google...', 'info');
      }
    } catch (err) {
      Utils.toast(err.message || 'Google sign-in failed', 'error');
      console.error('Google sign-in error:', err);
    }
  },

  async resendVerificationEmail(email) {
    if (!window.supabaseClient) {
      Utils.toast('Database connection not initialized yet. Please refresh the page.', 'error');
      return;
    }

    if (!this.isValidEmail(email)) {
      Utils.toast('Enter a valid email to resend verification.', 'error');
      return;
    }

    if (!window.supabaseClient.auth.resend) {
      Utils.toast('Resend verification is not supported by this version. Use Forgot Password instead.', 'warning');
      return;
    }

    try {
      const { error } = await window.supabaseClient.auth.resend({
        email,
        type: 'signup'
      });

      if (error) {
        Utils.toast(error.message, 'error');
      } else {
        Utils.toast('Verification email resent. Please check your inbox.', 'success');
      }
    } catch (err) {
      Utils.toast(err.message || 'Failed to resend verification email', 'error');
      console.error('Resend verification error:', err);
    }
  },

  bindSignup() {
    if (this._signupBound) return;
    this._signupBound = true;
    const form = document.getElementById('signup-form');
    if (!form) return;
    const googleBtn = form.querySelector('.google-btn-xoss');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.handleGoogleSignIn());
    }
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!this.validateSignup()) return;
      
      const name   = document.getElementById('signup-name').value.trim();
      const email  = document.getElementById('signup-email').value.trim();
      const pass   = document.getElementById('signup-pass').value;
      const gender = document.getElementById('signup-gender').value;
      const age    = document.getElementById('signup-age').value;
      
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.textContent : '';
      if (btn) btn.textContent = 'Creating account...';

      try {
        if (!window.supabaseClient) throw new Error("Database connection not initialized yet. Please refresh the page.");

        // 1. Supabase Cloud Signup
        const { data, error } = await window.supabaseClient.auth.signUp({
          email: email,
          password: pass,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              name: name,
              gender: gender,
              age: age
            }
          }
        });

        if (btn) btn.textContent = originalText;

        if (error) {
          this.showError('signup-email', error.message);
          Utils.toast(error.message, 'error');
        } else if (data.user) {
          // Attempt to create profile immediately (even if email confirmation is pending)
          // Note: This might fail if RLS is strict, but we try anyway.
          try {
            const profilePayload = {
              id: data.user.id,
              name: name || email.split('@')[0],
              email: email,
              role: 'user'
            };
            
            const { error: insertErr } = await window.supabaseClient.from('profiles').insert([profilePayload]);
            if (insertErr && insertErr.code !== '23505') {
              console.warn("Initial profile creation failed (likely RLS or pending verification):", insertErr);
            }
          } catch (e) {
            console.warn("Profile creation attempt error:", e);
          }

          const emailConfirmed = Boolean(data.user.email_confirmed_at || data.user.confirmed_at);

          if (emailConfirmed) {
            const user = { 
              id: data.user.id, 
              name: name, 
              email: email, 
              gender: gender, 
              age: age, 
              avatar: null, 
              location: '', 
              createdAt: data.user.created_at || new Date().toISOString() 
            };
            DB.setUser(user);
            Utils.toast('Account created! Welcome, ' + name, 'success');
            setTimeout(() => App.showDashboard(), 700);
          } else {
            if (data.session) {
              await window.supabaseClient.auth.signOut();
            }
            Utils.toast('Signup successful! Please verify your email before logging in.', 'warning');
            setTimeout(() => App.showPage('login'), 3000);
          }
        }
      } catch (err) {
        if (btn) btn.textContent = originalText;
        Utils.toast(err.message || 'Signup failed', 'error');
        console.error("Signup Error:", err);
      }
    });
  },

  bindForgot() {
    if (this._forgotBound) return;
    this._forgotBound = true;
    const form = document.getElementById('forgot-form');
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      if (!this.isValidEmail(email)) { this.showError('forgot-email', 'Enter a valid email'); return; }
      
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Sending link...';

      try {
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (btn) btn.textContent = 'Send OTP';
        if (error) throw error;
        
        Utils.toast('Password reset link sent to your email!', 'success');
        // Optional: Hide forgot steps and go back to login
        setTimeout(() => App.showPage('login'), 3000);
      } catch (err) {
        if (btn) btn.textContent = 'Send OTP';
        Utils.toast(err.message, 'error');
      }
    });

    // Handle New Password Submission
    document.getElementById('forgot-reset-btn')?.addEventListener('click', async () => {
      const pass = document.getElementById('new-pass').value;
      if (pass.length < 6) { Utils.toast('Password must be at least 6 characters', 'error'); return; }
      
      const btn = document.getElementById('forgot-reset-btn');
      if (btn) btn.textContent = 'Updating...';

      try {
        const { error } = await window.supabaseClient.auth.updateUser({ password: pass });
        if (error) throw error;
        
        Utils.toast('Password updated successfully! Please login.', 'success');
        setTimeout(() => App.showPage('login'), 1500);
      } catch (err) {
        if (btn) btn.textContent = 'Update Password';
        Utils.toast(err.message, 'error');
      }
    });
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  validateLogin() {
    let ok = true;
    const email = document.getElementById('login-email');
    const pass  = document.getElementById('login-pass');
    this.clearError('login-email'); this.clearError('login-pass');
    if (!this.isValidEmail(email.value.trim())) { this.showError('login-email', 'Valid email required'); ok = false; }
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
    if (!this.isValidEmail(email)) { this.showError('signup-email', 'Valid email required'); ok = false; }
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
    Utils.confirm(
      'Logout',
      'Are you sure you want to logout of your account?',
      async () => {
        // Sign out of Supabase (no await, so it doesn't hang if offline)
        if (navigator.onLine) {
          window.supabaseClient.auth.signOut().catch(e => console.warn('Supabase signout failed', e));
        } else {
          try { window.supabaseClient.auth.signOut(); } catch(e){}
        }
        
        // Clean up presence channel & subscription state
        if (window.Sync) {
          if (window.Sync.presenceChannel) {
            try {
              window.Sync.presenceChannel.unsubscribe();
            } catch (e) {}
            window.Sync.presenceChannel = null;
          }
          window.Sync.isSubscribed = false;
        }

        // Clear local storage DB user
        DB.clearAllUserData();
        DB.remove('lamim_user');
        
        Utils.toast('Logged out successfully', 'info');
        setTimeout(() => App.showPage('login'), 500);
      }
    );
  }
};
