import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: 'primary' | 'secondary';
}

interface ContactsContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  setPrimary: (id: string) => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('emergency_contacts');
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      // Default mock contact
      const defaultContact: Contact = {
        id: '1',
        name: 'Emergency Response Team',
        phone: '112',
        relationship: 'Official',
        priority: 'primary'
      };
      setContacts([defaultContact]);
      localStorage.setItem('emergency_contacts', JSON.stringify([defaultContact]));
    }
  }, []);

  const save = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('emergency_contacts', JSON.stringify(newContacts));
  };

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: Math.random().toString(36).substr(2, 9) };
    save([...contacts, newContact]);
  };

  const updateContact = (id: string, updated: Partial<Contact>) => {
    save(contacts.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const removeContact = (id: string) => {
    save(contacts.filter(c => c.id !== id));
  };

  const setPrimary = (id: string) => {
    save(contacts.map(c => ({
      ...c,
      priority: c.id === id ? 'primary' : 'secondary'
    })));
  };

  return (
    <ContactsContext.Provider value={{ contacts, addContact, updateContact, removeContact, setPrimary }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}
