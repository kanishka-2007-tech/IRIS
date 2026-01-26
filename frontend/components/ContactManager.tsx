
import React, { useState } from 'react';
import { Contact } from '../types';
import { UserPlus, Trash2, Phone, ShieldCheck } from 'lucide-react';

interface Props {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

const ContactManager: React.FC<Props> = ({ contacts, setContacts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Mother' });

  const handleAdd = () => {
    if (!newContact.name || !newContact.phone) return;
    const contact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: newContact.name,
      phone: newContact.phone,
      relation: newContact.relation,
      priority: contacts.length + 1,
      isVerified: true
    };
    setContacts([...contacts, contact]);
    setIsAdding(false);
    setNewContact({ name: '', phone: '', relation: 'Mother' });
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Family Contacts</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-rose-100 text-rose-600 p-2 rounded-xl"
        >
          <UserPlus size={24} />
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 bg-white p-6 rounded-2xl shadow-xl border border-rose-100 space-y-4">
          <h3 className="font-bold text-slate-700">Add New Contact</h3>
          <input 
            type="text" 
            placeholder="Name" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-black"
            value={newContact.name}
            onChange={(e) => setNewContact({...newContact, name: e.target.value})}
          />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-bold text-sm">+91</span>
            <input 
              type="tel" 
              placeholder="9876543210" 
              className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-black font-medium"
              value={newContact.phone}
              onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
            />
          </div>
          <select 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-black"
            value={newContact.relation}
            onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
          >
            <option>Mother</option>
            <option>Father</option>
            <option>Brother</option>
            <option>Sister</option>
            <option>Friend</option>
            <option>Other</option>
          </select>
          <div className="flex space-x-3">
            <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold">Save Contact</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {contacts.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-lg">
                {c.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 flex items-center">
                  {c.name} 
                  {c.isVerified && <ShieldCheck size={14} className="ml-1 text-emerald-500" />}
                </h4>
                <p className="text-black font-semibold text-xs flex items-center">
                  <Phone size={10} className="mr-1 text-slate-400" /> +91 {c.phone}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full">
                  {c.relation}
                </span>
              </div>
            </div>
            <button onClick={() => removeContact(c.id)} className="text-slate-300 hover:text-rose-500 p-2">
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        {contacts.length === 0 && !isAdding && (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <UserPlus size={40} />
            </div>
            <p className="text-slate-400">Add trusted family contacts <br/> to your emergency list.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
