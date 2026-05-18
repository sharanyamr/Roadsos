import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  Trash2, 
  Phone, 
  User, 
  ChevronRight, 
  ShieldCheck, 
  Star,
  Plus,
  X
} from 'lucide-react';
import { useContacts, Contact } from '@/src/contexts/ContactsContext';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

export default function ContactsManager() {
  const { contacts, addContact, removeContact, setPrimary } = useContacts();
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    priority: 'secondary' as 'primary' | 'secondary'
  });

  const handleAdd = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and phone are required");
      return;
    }
    addContact({
      ...newContact,
      priority: contacts.length === 0 ? 'primary' : 'secondary'
    });
    setIsAdding(false);
    setNewContact({ name: '', phone: '', relationship: '', priority: 'secondary' });
    toast.success("Contact added successfully");
  };

  return (
    <div className="glass p-8 rounded-[40px] border border-white/10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-3">
            <HeartPulse className="text-red-500" /> Emergency Contacts
          </h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Direct alerts in critical situations</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center hover:bg-hover active:scale-95 transition-all shadow-lg shadow-red-600/20"
        >
          <Plus className="text-white" />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "group glass p-5 rounded-[32px] border transition-all flex items-center justify-between",
                contact.priority === 'primary' ? "border-red-500/30 bg-red-600/5 shadow-xl shadow-red-600/5" : "border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center relative",
                  contact.priority === 'primary' ? "bg-red-600 text-white" : "bg-white/5 text-slate-400"
                )}>
                  <User size={20} />
                  {contact.priority === 'primary' && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-slate-950">
                      <Star size={10} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{contact.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{contact.relationship}</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400">{contact.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {contact.priority !== 'primary' && (
                  <button 
                    onClick={() => setPrimary(contact.id)}
                    className="p-3 glass rounded-xl hover:bg-white/10 text-slate-400 hover:text-yellow-500 transition-all"
                    title="Set as Primary"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button 
                  onClick={() => {
                    removeContact(contact.id);
                    toast.info("Contact removed");
                  }}
                  className="p-3 glass rounded-xl hover:bg-white/10 text-slate-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {contacts.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[32px]">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
               <UserPlus className="text-slate-600" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No emergency contacts yet</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass w-full max-w-md p-8 rounded-[40px] border border-white/10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Add Contact</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Phone Number</label>
                <input 
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="e.g. +1 234 567 890"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Relationship</label>
                <input 
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="e.g. Spouse, Parent, Doctor"
                />
              </div>
              
              <button 
                onClick={handleAdd}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold mt-4 hover:bg-hover active:scale-95 transition-all shadow-lg shadow-red-600/20"
              >
                SAVE CONTACT
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function HeartPulse(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}
