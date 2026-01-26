
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, Phone, User as UserIcon, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', city: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      setError("Enter valid 10-digit number");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setError('');
      setStep(2);
    }, 1000);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234') { // Simulated fixed OTP for demo
      setError("Invalid OTP. Hint: Use 1234");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setError('');
      setStep(3);
    }, 800);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) {
      setError("Please fill in all details");
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onLogin({
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          isRegistered: true
        });
      }, 1200);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 border border-rose-100">
        <div className="flex justify-center mb-10">
          <div className="bg-rose-600 p-6 rounded-[2rem] text-white shadow-xl shadow-rose-200">
            <ShieldCheck size={48} strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Tech Ventures</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Smart Protection Platform</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl text-[11px] font-black flex items-center mb-8 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="mr-3 shrink-0" /> {error}
          </div>
        )}

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-emerald-100 p-6 rounded-full text-emerald-600">
              <CheckCircle2 size={56} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 tracking-tight">Welcome, {formData.name}</p>
              <p className="text-slate-500 text-sm font-bold mt-1">Identity Verified Successfully</p>
            </div>
          </div>
        ) : (
          <>
            {step === 1 && (
              <form onSubmit={handlePhoneSubmit} className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration Mobile</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-black font-black text-xl tracking-tight">+91</span>
                    <input 
                      type="tel" 
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full pl-20 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-rose-500 focus:bg-white outline-none transition-all text-black font-black text-xl placeholder:text-slate-200"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-rose-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-[0_20px_40px_-10px_rgba(225,29,72,0.4)] hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <span>Verify Number</span>}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOtpVerify} className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Code</label>
                  <input 
                    type="text" 
                    required
                    maxLength={4}
                    placeholder="Enter 1234"
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-rose-500 text-center tracking-[1em] text-black font-black text-3xl placeholder:text-slate-200"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-center text-[10px] font-bold text-slate-400">Sending SMS to +91 {formData.phone}</p>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl active:scale-[0.98] transition-all"
                >
                  {isLoading ? "Verifying..." : "Validate OTP"}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Back</button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleCompleteRegistration} className="space-y-8 animate-in zoom-in duration-500">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Anjali Sharma"
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-rose-500 text-black font-black"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current City</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Mumbai"
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-rose-500 text-black font-black"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-rose-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl active:scale-[0.98] transition-all"
                >
                  {isLoading ? "Synchronizing..." : "Complete Setup"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
      <p className="mt-12 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] text-center max-w-xs leading-relaxed">
        SECURE BIOMETRIC & PHONE ENCRYPTION ENABLED FOR YOUR PROTECTION
      </p>
    </div>
  );
};

export default Login;
