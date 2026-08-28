const apiUrl = 'http://localhost:8000/api/contacts/'

function emptyContact() {
  return {
    name: '',
    surname: '',
    email: '',
    phone: '',
    birthday: '',
    info: '',
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
  }
}

function contactsApp() {
  return {
    contacts: [],
    query: '',
    newContact: emptyContact(),
    error: null,

    async init() {
      await this.getContacts()
    },

    async getContacts() {
      try {
        this.error = null
        const params = new URLSearchParams({ limit: '100', offset: '0' })

        if (this.query.trim()) {
          params.set('query', this.query.trim())
        }

        this.contacts = await requestJson(`${apiUrl}?${params.toString()}`)
      } catch (err) {
        this.error = err.message
      }
    },

    async getBirthdays() {
      try {
        this.error = null
        this.contacts = await requestJson(`${apiUrl}birthdays`)
      } catch (err) {
        this.error = err.message
      }
    },

    async createContact() {
      try {
        this.error = null
        await requestJson(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanContact(this.newContact)),
        })
        this.newContact = emptyContact()
        await this.getContacts()
      } catch (err) {
        this.error = err.message
      }
    },

    async updateContact(contact) {
      try {
        this.error = null
        await requestJson(`${apiUrl}${contact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanContact(contact)),
        })
        contact.editing = false
        await this.getContacts()
      } catch (err) {
        this.error = err.message
      }
    },

    async deleteContact(id) {
      try {
        this.error = null
        await requestJson(`${apiUrl}${id}`, {
          method: 'DELETE',
        })
        this.contacts = this.contacts.filter((contact) => contact.id !== id)
      } catch (err) {
        this.error = err.message
      }
    },
  }
}
