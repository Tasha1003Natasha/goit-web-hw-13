const API_BASE = 'http://localhost:8000/api'
const CONTACTS_URL = `${API_BASE}/contacts/`
const AUTH_URL = `${API_BASE}/auth`

function emptyContact() {
  return {
    name: '',
    surname: '',
    email: '',
    phone: '',
    birthday: '',
    info: '',
    completed: false,
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const detail = data && data.detail ? data.detail : `HTTP error! status: ${response.status}`
    throw new Error(Array.isArray(detail) ? detail.map((item) => item.msg).join(', ') : detail)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function cleanContact(contact) {
  return {
    name: contact.name,
    surname: contact.surname,
    email: contact.email,
    phone: contact.phone,
    birthday: contact.birthday,
    info: contact.info || null,
    completed: Boolean(contact.completed),
  }
}

function contactsApp() {
  return {
    activeTab: 'login',
    contacts: [],
    query: '',
    contactId: '',
    token: localStorage.getItem('access_token') || '',
    refreshToken: localStorage.getItem('refresh_token') || '',
    currentEmail: localStorage.getItem('current_email') || '',
    newContact: emptyContact(),
    loginForm: {
      email: '',
      password: '',
    },
    signupForm: {
      username: '',
      email: '',
      password: '',
    },
    emailRequest: {
      email: '',
    },
    passwordRequest: {
      email: '',
    },
    resetForm: {
      token: '',
      password: '',
    },
    confirmToken: '',
    error: null,
    message: null,

    get isAuthenticated() {
      return Boolean(this.token)
    },

    async init() {
      if (this.isAuthenticated) {
        await this.getContacts()
      }
    },

    authHeaders(extraHeaders = {}) {
      return {
        ...extraHeaders,
        Authorization: `Bearer ${this.token}`,
      }
    },

    setNotice(message) {
      this.error = null
      this.message = message
    },

    setError(err) {
      this.message = null
      this.error = err.message
    },

    async signup() {
      try {
        this.error = null
        await requestJson(`${AUTH_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.signupForm),
        })
        this.emailRequest.email = this.signupForm.email
        this.passwordRequest.email = this.signupForm.email
        this.signupForm = { username: '', email: '', password: '' }
        this.activeTab = 'verify'
        this.setNotice('Account created. Check your email for confirmation.')
      } catch (err) {
        this.setError(err)
      }
    },

    async login() {
      try {
        this.error = null
        const form = new URLSearchParams()
        form.set('username', this.loginForm.email)
        form.set('password', this.loginForm.password)

        const data = await requestJson(`${AUTH_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        })

        this.token = data.access_token
        this.refreshToken = data.refresh_token
        this.currentEmail = this.loginForm.email
        localStorage.setItem('access_token', this.token)
        localStorage.setItem('refresh_token', this.refreshToken)
        localStorage.setItem('current_email', this.currentEmail)
        this.loginForm.password = ''
        this.setNotice('Login successful.')
        await this.getContacts()
      } catch (err) {
        this.setError(err)
      }
    },

    logout() {
      this.token = ''
      this.refreshToken = ''
      this.currentEmail = ''
      this.contacts = []
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('current_email')
      this.setNotice('Logged out.')
    },

    async refreshSession() {
      try {
        const data = await requestJson(`${AUTH_URL}/refresh_token`, {
          headers: { Authorization: `Bearer ${this.refreshToken}` },
        })

        this.token = data.access_token
        this.refreshToken = data.refresh_token
        localStorage.setItem('access_token', this.token)
        localStorage.setItem('refresh_token', this.refreshToken)
        this.setNotice('Session refreshed.')
        await this.getContacts()
      } catch (err) {
        this.logout()
        this.setError(err)
      }
    },

    async requestEmail() {
      try {
        await requestJson(`${AUTH_URL}/request_email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.emailRequest),
        })
        this.setNotice('Verification email was requested.')
      } catch (err) {
        this.setError(err)
      }
    },

    async confirmEmail() {
      try {
        await requestJson(`${AUTH_URL}/confirmed_email/${this.confirmToken.trim()}`)
        this.confirmToken = ''
        this.activeTab = 'login'
        this.setNotice('Email confirmed. You can login now.')
      } catch (err) {
        this.setError(err)
      }
    },

    async requestPasswordReset() {
      try {
        await requestJson(`${AUTH_URL}/request_password_reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.passwordRequest),
        })
        this.setNotice('If this email exists, password reset instructions were sent.')
      } catch (err) {
        this.setError(err)
      }
    },

    async resetPassword() {
      try {
        await requestJson(`${AUTH_URL}/reset_password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.resetForm),
        })
        this.resetForm = { token: '', password: '' }
        this.activeTab = 'login'
        this.setNotice('Password changed. Login with the new password.')
      } catch (err) {
        this.setError(err)
      }
    },

    async getContacts() {
      try {
        this.error = null
        const params = new URLSearchParams({ limit: '100', offset: '0' })

        if (this.query.trim()) {
          params.set('query', this.query.trim())
        }

        const contacts = await requestJson(`${CONTACTS_URL}?${params.toString()}`, {
          headers: this.authHeaders(),
        })
        this.contacts = contacts.map((contact) => ({ ...contact, editing: false }))
      } catch (err) {
        this.setError(err)
      }
    },

    async getBirthdays() {
      try {
        this.error = null
        const contacts = await requestJson(`${CONTACTS_URL}birthdays`, {
          headers: this.authHeaders(),
        })
        this.contacts = contacts.map((contact) => ({ ...contact, editing: false }))
      } catch (err) {
        this.setError(err)
      }
    },

    async getContactById() {
      try {
        this.error = null
        const contact = await requestJson(`${CONTACTS_URL}${this.contactId}`, {
          headers: this.authHeaders(),
        })
        this.contacts = [{ ...contact, editing: false }]
        this.setNotice('Contact loaded.')
      } catch (err) {
        this.setError(err)
      }
    },

    async createContact() {
      try {
        this.error = null
        await requestJson(CONTACTS_URL, {
          method: 'POST',
          headers: this.authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(cleanContact(this.newContact)),
        })
        this.newContact = emptyContact()
        this.setNotice('Contact created.')
        await this.getContacts()
      } catch (err) {
        this.setError(err)
      }
    },

    async updateContact(contact) {
      try {
        this.error = null
        await requestJson(`${CONTACTS_URL}${contact.id}`, {
          method: 'PUT',
          headers: this.authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(cleanContact(contact)),
        })
        contact.editing = false
        this.setNotice('Contact updated.')
        await this.getContacts()
      } catch (err) {
        this.setError(err)
      }
    },

    async deleteContact(id) {
      try {
        this.error = null
        await requestJson(`${CONTACTS_URL}${id}`, {
          method: 'DELETE',
          headers: this.authHeaders(),
        })
        this.contacts = this.contacts.filter((contact) => contact.id !== id)
        this.setNotice('Contact deleted.')
      } catch (err) {
        this.setError(err)
      }
    },
  }
}
