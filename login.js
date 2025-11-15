// Authentication handling with dummy credentials for now
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);

    // Signup form
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);

    // Switch between login and signup
    document.getElementById('switchToSignup').addEventListener('click', (e) => {
        e.preventDefault();
        switchToSignup();
    });

    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        switchToLogin();
    });

    // Google login/signup buttons (dummy for now)
    document.getElementById('googleLogin').addEventListener('click', handleGoogleAuth);
    document.getElementById('googleSignup').addEventListener('click', handleGoogleAuth);

    // Forgot password (dummy for now)
    document.querySelector('.forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        showMessage('Password reset feature will be available soon!', 'error');
    });
}

// Check if user is already authenticated
async function checkAuthStatus() {
    // Only check auth status if running as an extension
    if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
            const result = await chrome.storage.local.get(['isAuthenticated', 'user']);
            if (result.isAuthenticated && result.user) {
                // User is already logged in, redirect to form
                redirectToForm();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }
}

// Switch to signup form
function switchToSignup() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    clearMessage();
}

// Switch to login form
function switchToLogin() {
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    clearMessage();
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    // Bypass auth if not in extension environment
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.log('Not in extension context. Bypassing login and redirecting.');
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            redirectToForm();
        }, 200);
        return;
    }

    try {
        // Dummy authentication - accept any credentials for now
        if (!email || !password) {
            showMessage('Please enter both email/username and password', 'error');
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            return;
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const user = {
            email: email,
            username: email.includes('@') ? email.split('@')[0] : email,
            loginMethod: 'email',
            loginTime: new Date().toISOString()
        };

        // Save authentication state
        await saveAuthState(user, rememberMe);

        // Verify the save was successful
        const verify = await chrome.storage.local.get(['isAuthenticated', 'user']);
        if (!verify.isAuthenticated) {
            throw new Error('Failed to save authentication state');
        }

        showMessage('Login successful! Redirecting...', 'success');

        // Small delay to show success message, then redirect
        setTimeout(() => {
            redirectToForm();
        }, 200);
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Error during login. Please try again.', 'error');
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    // Bypass auth if not in extension environment
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.log('Not in extension context. Bypassing signup and redirecting.');
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
        showMessage('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            redirectToForm();
        }, 200);
        return;
    }


    try {
        // Validation
        if (!name || !email || !username || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            return;
        }

        if (!agreeTerms) {
            showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            return;
        }

        // Dummy signup - just save the user info
        // In production, this will create an account on a real backend
        await new Promise(resolve => setTimeout(resolve, 300));

        const user = {
            name: name,
            email: email,
            username: username,
            loginMethod: 'email',
            signupTime: new Date().toISOString(),
            loginTime: new Date().toISOString()
        };

        // Save authentication state
        await saveAuthState(user, true);

        // Verify the save was successful
        const verify = await chrome.storage.local.get(['isAuthenticated', 'user']);
        if (!verify.isAuthenticated) {
            throw new Error('Failed to save authentication state');
        }

        showMessage('Account created successfully! Redirecting...', 'success');

        // Small delay to show success message, then redirect
        setTimeout(() => {
            redirectToForm();
        }, 200);
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Error during signup. Please try again.', 'error');
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

// Handle Google authentication (dummy for now)
async function handleGoogleAuth() {
    showMessage('Google authentication will be implemented soon! For now, please use email signup/login.', 'error');

    // In production, this will:
    // 1. Open Google OAuth popup
    // 2. Handle OAuth callback
    // 3. Get user info from Google
    // 4. Save auth state
    // 5. Redirect to form
}

// Save authentication state
async function saveAuthState(user, rememberMe) {
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.log('Skipping saveAuthState: not in an extension context.');
        return Promise.resolve();
    }
    try {
        await chrome.storage.local.set({
            isAuthenticated: true,
            user: user,
            rememberMe: rememberMe
        });
    } catch (error) {
        console.error('Error saving auth state:', error);
        throw error;
    }
}

// Redirect to form page
function redirectToForm() {
    let formUrl;
    // Check if running as a Chrome extension
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        formUrl = chrome.runtime.getURL('form.html');
    } else {
        // Fallback for local development
        formUrl = 'form.html';
    }

    console.log('Attempting redirect to:', formUrl);
    console.log('Current location:', window.location.href);

    // Direct redirect
    window.location.href = formUrl;

    // Optional: A fallback for cases where direct assignment might fail, though less common now
    setTimeout(() => {
        if (!window.location.href.includes('form.html')) {
            console.warn('Primary redirect might have failed, trying replace...');
            window.location.replace(formUrl);
        }
    }, 500);
}

// Show message
function showMessage(message, type = 'error') {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
    messageEl.classList.remove('hidden');

    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 3000);
    }
}

// Clear message
function clearMessage() {
    const messageEl = document.getElementById('authMessage');
    messageEl.classList.add('hidden');
}

// Logout function (for future use)
async function logout() {
    // Check if running as an extension
    if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
            await chrome.storage.local.remove(['isAuthenticated', 'user', 'rememberMe']);
            window.location.href = chrome.runtime.getURL('login.html');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    } else {
        // Fallback for local development
        console.log('Logging out in non-extension context.');
        window.location.href = 'login.html';
    }
}

// Export logout for use in other scripts
if (typeof chrome !== 'undefined' && chrome.storage) {
    window.logout = logout;
}

