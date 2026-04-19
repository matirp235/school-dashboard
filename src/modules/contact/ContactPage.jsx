import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    setTimeout(() => {
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    }, 500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Contact Us</h1>
        <p className="text-gray-500 mt-1">Get in touch with the school administration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Information Cards */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">📍 Address</h3>
            <p className="text-gray-800 font-medium">123 Education Lane<br/>Knowledge City, State 12345</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">📞 Phone</h3>
            <p className="text-gray-800 font-medium">+91 98765 43210</p>
            <p className="text-gray-500 text-sm">Mon-Fri, 8:00 AM - 4:00 PM</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">✉️ Email</h3>
            <p className="text-blue-600 font-medium cursor-pointer hover:underline">admin@schooldashboard.com</p>
            <p className="text-gray-500 text-sm">We reply within 24 hours</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Send us a message</h2>
          
          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-bold">Message sent successfully!</p>
                <p className="text-sm">We will get back to you shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input 
                    type="text" required
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" required
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  required rows="5"
                  value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none" 
                  placeholder="How can we help you?" 
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}