// Form handling and data storage
let experienceCount = 1;
let referenceCount = 1;

// Initialize form
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
        // Determine the correct login URL based on the environment
        let loginUrl = 'login.html';
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            loginUrl = chrome.runtime.getURL('login.html');
        }
        // Redirect to login if not authenticated
        window.location.href = loginUrl;
        return;
    }

    // Load and display user info
    await loadUserInfo();
    loadSavedData();
    setupEventListeners();
});

// Check if user is authenticated
async function checkAuthentication() {
    // If not in an extension context, bypass the check for local development
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.log('Bypassing authentication check for local development.');
        return true;
    }
    try {
        const result = await chrome.storage.local.get(['isAuthenticated', 'user']);
        return result.isAuthenticated === true && !!result.user;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

// Load and display user information
async function loadUserInfo() {
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.log('Skipping user info load: not in an extension context.');
        // Set a default user name for local view
        document.getElementById('userName').textContent = 'Local User';
        return;
    }
    try {
        const result = await chrome.storage.local.get(['user']);
        if (result.user) {
            const userName = result.user.name || result.user.username || result.user.email || 'User';
            document.getElementById('userName').textContent = userName;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // If not in an extension context, just redirect
        if (typeof chrome === 'undefined' || !chrome.storage) {
            window.location.href = 'login.html';
            return;
        }
        try {
            await chrome.storage.local.remove(['isAuthenticated', 'user', 'rememberMe']);
            window.location.href = chrome.runtime.getURL('login.html');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('userInfoForm').addEventListener('submit', handleFormSubmit);

    // Save draft button
    document.getElementById('saveDraft').addEventListener('click', saveDraft);

    // Add experience button
    document.getElementById('addExperience').addEventListener('click', addExperience);

    // Add reference button
    document.getElementById('addReference').addEventListener('click', addReference);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Close success message
    document.getElementById('closeSuccess').addEventListener('click', () => {
        document.getElementById('successMessage').classList.add('hidden');
    });

    // Handle current job checkboxes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('current-job-checkbox')) {
            const endDateInput = e.target.closest('.form-row').querySelector('input[type="month"][name="expEndDate[]"]');
            if (e.target.checked) {
                endDateInput.disabled = true;
                endDateInput.value = '';
            } else {
                endDateInput.disabled = false;
            }
        }
    });
}

// Add new experience entry
function addExperience() {
    experienceCount++;
    const container = document.getElementById('experienceContainer');
    const newExperience = document.createElement('div');
    newExperience.className = 'experience-item';
    newExperience.innerHTML = `
    <div class="experience-header">
      <h3>Experience #${experienceCount}</h3>
      <button type="button" class="remove-btn" onclick="this.closest('.experience-item').remove()">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" name="expTitle[]" placeholder="Software Engineer">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" name="expCompany[]" placeholder="Company Name">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Start Date</label>
        <input type="month" name="expStartDate[]">
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="month" name="expEndDate[]">
        <label class="checkbox-label">
          <input type="checkbox" name="expCurrent[]" class="current-job-checkbox"> Current Job
        </label>
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea name="expDescription[]" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
    </div>
  `;
    container.appendChild(newExperience);
}

// Add new reference entry
function addReference() {
    referenceCount++;
    const container = document.getElementById('referenceContainer');
    const newReference = document.createElement('div');
    newReference.className = 'reference-item';
    newReference.innerHTML = `
    <div class="reference-header">
      <h3>Reference #${referenceCount}</h3>
      <button type="button" class="remove-btn" onclick="this.closest('.reference-item').remove()">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Name</label>
        <input type="text" name="refName[]" placeholder="John Doe">
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" name="refTitle[]" placeholder="Senior Manager">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Company</label>
        <input type="text" name="refCompany[]" placeholder="Company Name">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" name="refEmail[]" placeholder="john@example.com">
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="tel" name="refPhone[]" placeholder="+1 (555) 123-4567">
      </div>
    </div>
  `;
    container.appendChild(newReference);
}

// Collect form data
function collectFormData() {
    const form = document.getElementById('userInfoForm');
    const formData = new FormData(form);

    // Basic information
    const data = {
        personal: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zipCode'),
            country: formData.get('country'),
            linkedin: formData.get('linkedin'),
            portfolio: formData.get('portfolio')
        },
        professional: {
            currentTitle: formData.get('currentTitle'),
            currentCompany: formData.get('currentCompany'),
            summary: formData.get('summary'),
            skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : []
        },
        education: {
            degree: formData.get('degree'),
            fieldOfStudy: formData.get('fieldOfStudy'),
            university: formData.get('university'),
            graduationYear: formData.get('graduationYear'),
            gpa: formData.get('gpa')
        },
        experience: [],
        references: [],
        documents: {
            resumeText: formData.get('resumeText'),
            coverLetter: formData.get('coverLetter')
        },
        additional: {
            availability: formData.get('availability'),
            salaryExpectation: formData.get('salaryExpectation'),
            workAuthorization: formData.get('workAuthorization'),
            languages: formData.get('languages') ? formData.get('languages').split(',').map(l => l.trim()) : []
        },
        lastUpdated: new Date().toISOString()
    };

    // Collect experiences
    const expTitles = formData.getAll('expTitle[]');
    const expCompanies = formData.getAll('expCompany[]');
    const expStartDates = formData.getAll('expStartDate[]');
    const expEndDates = formData.getAll('expEndDate[]');
    const expCurrents = formData.getAll('expCurrent[]');
    const expDescriptions = formData.getAll('expDescription[]');

    for (let i = 0; i < expTitles.length; i++) {
        if (expTitles[i] || expCompanies[i]) {
            data.experience.push({
                title: expTitles[i],
                company: expCompanies[i],
                startDate: expStartDates[i],
                endDate: expCurrents[i] === 'on' ? 'Present' : expEndDates[i],
                current: expCurrents[i] === 'on',
                description: expDescriptions[i]
            });
        }
    }

    // Collect references
    const refNames = formData.getAll('refName[]');
    const refTitles = formData.getAll('refTitle[]');
    const refCompanies = formData.getAll('refCompany[]');
    const refEmails = formData.getAll('refEmail[]');
    const refPhones = formData.getAll('refPhone[]');

    for (let i = 0; i < refNames.length; i++) {
        if (refNames[i] || refEmails[i]) {
            data.references.push({
                name: refNames[i],
                title: refTitles[i],
                company: refCompanies[i],
                email: refEmails[i],
                phone: refPhones[i]
            });
        }
    }

    return data;
}

// Save data to Chrome storage
async function saveData(data, isDraft = false) {
    try {
        await chrome.storage.local.set({
            userProfile: data,
            isDraft: isDraft
        });
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Load saved data
async function loadSavedData() {
    try {
        const result = await chrome.storage.local.get(['userProfile']);
        if (result.userProfile) {
            populateForm(result.userProfile);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Populate form with saved data
function populateForm(data) {
    // Personal information
    if (data.personal) {
        Object.keys(data.personal).forEach(key => {
            const input = document.getElementById(key);
            if (input && data.personal[key]) {
                input.value = data.personal[key];
            }
        });
    }

    // Professional information
    if (data.professional) {
        if (data.professional.currentTitle) document.getElementById('currentTitle').value = data.professional.currentTitle;
        if (data.professional.currentCompany) document.getElementById('currentCompany').value = data.professional.currentCompany;
        if (data.professional.summary) document.getElementById('summary').value = data.professional.summary;
        if (data.professional.skills && data.professional.skills.length > 0) {
            document.getElementById('skills').value = data.professional.skills.join(', ');
        }
    }

    // Education
    if (data.education) {
        Object.keys(data.education).forEach(key => {
            const input = document.getElementById(key);
            if (input && data.education[key]) {
                input.value = data.education[key];
            }
        });
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
        // Clear existing experiences except first one
        const container = document.getElementById('experienceContainer');
        container.innerHTML = '';
        experienceCount = 0;

        data.experience.forEach((exp, index) => {
            experienceCount++;
            const expDiv = document.createElement('div');
            expDiv.className = 'experience-item';
            expDiv.innerHTML = `
        <div class="experience-header">
          <h3>Experience #${experienceCount}</h3>
          <button type="button" class="remove-btn" onclick="this.closest('.experience-item').remove()">Remove</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Job Title</label>
            <input type="text" name="expTitle[]" value="${exp.title || ''}" placeholder="Software Engineer">
          </div>
          <div class="form-group">
            <label>Company</label>
            <input type="text" name="expCompany[]" value="${exp.company || ''}" placeholder="Company Name">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Start Date</label>
            <input type="month" name="expStartDate[]" value="${exp.startDate || ''}">
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input type="month" name="expEndDate[]" value="${exp.current ? '' : (exp.endDate || '')}" ${exp.current ? 'disabled' : ''}>
            <label class="checkbox-label">
              <input type="checkbox" name="expCurrent[]" class="current-job-checkbox" ${exp.current ? 'checked' : ''}> Current Job
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="expDescription[]" rows="3" placeholder="Describe your responsibilities and achievements...">${exp.description || ''}</textarea>
        </div>
      `;
            container.appendChild(expDiv);
        });
    }

    // References
    if (data.references && data.references.length > 0) {
        const container = document.getElementById('referenceContainer');
        container.innerHTML = '';
        referenceCount = 0;

        data.references.forEach((ref, index) => {
            referenceCount++;
            const refDiv = document.createElement('div');
            refDiv.className = 'reference-item';
            refDiv.innerHTML = `
        <div class="reference-header">
          <h3>Reference #${referenceCount}</h3>
          <button type="button" class="remove-btn" onclick="this.closest('.reference-item').remove()">Remove</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Name</label>
            <input type="text" name="refName[]" value="${ref.name || ''}" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label>Title</label>
            <input type="text" name="refTitle[]" value="${ref.title || ''}" placeholder="Senior Manager">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Company</label>
            <input type="text" name="refCompany[]" value="${ref.company || ''}" placeholder="Company Name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="refEmail[]" value="${ref.email || ''}" placeholder="john@example.com">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" name="refPhone[]" value="${ref.phone || ''}" placeholder="+1 (555) 123-4567">
          </div>
        </div>
      `;
            container.appendChild(refDiv);
        });
    }

    // Documents
    if (data.documents) {
        if (data.documents.resumeText) document.getElementById('resumeText').value = data.documents.resumeText;
        if (data.documents.coverLetter) document.getElementById('coverLetter').value = data.documents.coverLetter;
    }

    // Additional information
    if (data.additional) {
        if (data.additional.availability) document.getElementById('availability').value = data.additional.availability;
        if (data.additional.salaryExpectation) document.getElementById('salaryExpectation').value = data.additional.salaryExpectation;
        if (data.additional.workAuthorization) document.getElementById('workAuthorization').value = data.additional.workAuthorization;
        if (data.additional.languages && data.additional.languages.length > 0) {
            document.getElementById('languages').value = data.additional.languages.join(', ');
        }
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = document.getElementById('userInfoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const submitButton = document.getElementById('submitForm');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Saving...</span>';

    const data = collectFormData();
    const success = await saveData(data, false);

    if (success) {
        document.getElementById('successMessage').classList.remove('hidden');
        submitButton.disabled = false;
        submitButton.innerHTML = '<span>Save & Complete</span><span class="btn-icon">✓</span>';
    } else {
        alert('Error saving data. Please try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = '<span>Save & Complete</span><span class="btn-icon">✓</span>';
    }
}

// Save draft
async function saveDraft() {
    const data = collectFormData();
    const success = await saveData(data, true);

    if (success) {
        const btn = document.getElementById('saveDraft');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Draft Saved!';
        btn.style.background = '#28a745';
        btn.style.color = 'white';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    }
}

// AI-powered field matching helper (for future use)
function getFieldValue(fieldName, userData) {
    const fieldNameLower = fieldName.toLowerCase();

    // Common field mappings
    const mappings = {
        'first name': userData.personal?.firstName,
        'firstname': userData.personal?.firstName,
        'fname': userData.personal?.firstName,
        'last name': userData.personal?.lastName,
        'lastname': userData.personal?.lastName,
        'lname': userData.personal?.lastName,
        'full name': `${userData.personal?.firstName} ${userData.personal?.lastName}`,
        'name': `${userData.personal?.firstName} ${userData.personal?.lastName}`,
        'email': userData.personal?.email,
        'e-mail': userData.personal?.email,
        'phone': userData.personal?.phone,
        'telephone': userData.personal?.phone,
        'mobile': userData.personal?.phone,
        'address': userData.personal?.address,
        'city': userData.personal?.city,
        'state': userData.personal?.state,
        'zip': userData.personal?.zipCode,
        'zipcode': userData.personal?.zipCode,
        'postal code': userData.personal?.zipCode,
        'country': userData.personal?.country,
        'linkedin': userData.personal?.linkedin,
        'linkedin profile': userData.personal?.linkedin,
        'portfolio': userData.personal?.portfolio,
        'website': userData.personal?.portfolio,
        'current title': userData.professional?.currentTitle,
        'job title': userData.professional?.currentTitle,
        'position': userData.professional?.currentTitle,
        'current company': userData.professional?.currentCompany,
        'company': userData.professional?.currentCompany,
        'employer': userData.professional?.currentCompany,
        'skills': userData.professional?.skills?.join(', '),
        'summary': userData.professional?.summary,
        'degree': userData.education?.degree,
        'field of study': userData.education?.fieldOfStudy,
        'major': userData.education?.fieldOfStudy,
        'university': userData.education?.university,
        'school': userData.education?.university,
        'college': userData.education?.university,
        'graduation year': userData.education?.graduationYear,
        'gpa': userData.education?.gpa,
        'availability': userData.additional?.availability,
        'salary': userData.additional?.salaryExpectation,
        'salary expectation': userData.additional?.salaryExpectation,
        'work authorization': userData.additional?.workAuthorization,
        'authorization': userData.additional?.workAuthorization,
        'languages': userData.additional?.languages?.join(', ')
    };

    // Try exact match first
    if (mappings[fieldNameLower]) {
        return mappings[fieldNameLower];
    }

    // Try partial match
    for (const [key, value] of Object.entries(mappings)) {
        if (fieldNameLower.includes(key) || key.includes(fieldNameLower)) {
            return value;
        }
    }

    return null;
}

// Export for use in content scripts
if (typeof chrome !== 'undefined' && chrome.storage) {
    window.getFieldValue = getFieldValue;
}

