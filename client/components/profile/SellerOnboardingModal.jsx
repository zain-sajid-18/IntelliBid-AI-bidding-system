import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Landmark, Store, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function SellerOnboardingModal({ isOpen, onClose }) {
    const setUser = useAuthStore(s => s.setUser);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        businessName: "",
        businessCategory: "Electronics",
        website: "",
        bankAccountHolder: "",
        bankName: "",
        iban: "",
        swiftCode: "",
        termsAccepted: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (!form.termsAccepted) return setError("Please accept terms of service.");
        setLoading(true);
        setError("");
        try {
            const data = await api("/api/seller/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            setUser(data.user);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to activate seller account");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white border-[4px] border-[var(--ink)] rounded-3xl w-full max-w-xl overflow-hidden shadow-[8px_8px_0_0_var(--ink)]"
                >
                    {/* Header */}
                    <div className="bg-[var(--acid)] p-6 border-b-[4px] border-[var(--ink)] flex justify-between items-center">
                        <div>
                            <h2 className="font-display text-2xl font-black uppercase tracking-tight leading-none">Become a Seller</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">Step {step} of 3</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border-[3px] border-red-500 rounded-xl text-red-700 font-bold text-sm">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                <div className="flex items-center gap-3 text-[var(--ink)] mb-2">
                                    <Store className="text-[var(--hotpink)]" />
                                    <h3 className="font-black uppercase tracking-widest text-sm">Business Identity</h3>
                                </div>
                                <Field label="Business/Display Name" name="businessName" value={form.businessName} onChange={handleChange} placeholder="e.g. Vintage Vault" />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Category</label>
                                    <select name="businessCategory" value={form.businessCategory} onChange={handleChange} className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] outline-none">
                                        <option>Electronics</option>
                                        <option>Fashion</option>
                                        <option>Collectibles</option>
                                        <option>Real Estate</option>
                                        <option>Art</option>
                                    </select>
                                </div>
                                <Field label="Website (Optional)" name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" />
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                <div className="flex items-center gap-3 text-[var(--ink)] mb-2">
                                    <Landmark className="text-[var(--acid)]" />
                                    <h3 className="font-black uppercase tracking-widest text-sm">Payout Settings</h3>
                                </div>
                                <Field label="Account Holder Name" name="bankAccountHolder" value={form.bankAccountHolder} onChange={handleChange} placeholder="Your full name" />
                                <Field label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. JPMorgan Chase" />
                                <Field label="IBAN / Account Number" name="iban" value={form.iban} onChange={handleChange} placeholder="International Banking Number" />
                                <Field label="SWIFT / BIC Code" name="swiftCode" value={form.swiftCode} onChange={handleChange} placeholder="8 or 11 character code" />
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                <div className="flex items-center gap-3 text-[var(--ink)] mb-2">
                                    <ShieldCheck className="text-green-500" />
                                    <h3 className="font-black uppercase tracking-widest text-sm">Final Verification</h3>
                                </div>
                                <div className="p-5 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl text-xs font-medium space-y-3 leading-relaxed">
                                    <p>By proceeding, you agree to IntelliBid's Seller Terms of Service. A platform fee of 5% will be deducted from each successful auction.</p>
                                    <p>Your bank details are encrypted at rest and only used for payouts.</p>
                                </div>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={handleChange} className="mt-1 w-5 h-5 border-[3px] border-[var(--ink)] rounded cursor-pointer accent-[var(--acid)]" />
                                    <span className="text-xs font-bold leading-tight select-none">I agree to the Seller Terms of Service and Payout Policies</span>
                                </label>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t-[4px] border-[var(--ink)] bg-gray-50 flex justify-between gap-4">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs border-[3px] border-[var(--ink)] hover:bg-white transition-all shadow-[4px_4px_0_0_var(--ink)] active:translate-y-1 active:shadow-none">
                                Back
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button onClick={nextStep} className="bg-[var(--ink)] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--acid)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--acid)] transition-all">
                                Continue
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading || !form.termsAccepted} className="bg-[var(--ink)] text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_var(--acid)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--acid)] transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={16} /> : "Finalize Activation"}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function Field({ label, name, value, onChange, placeholder }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium focus:shadow-[4px_4px_0_0_var(--ink)] transition-all outline-none"
            />
        </div>
    );
}
