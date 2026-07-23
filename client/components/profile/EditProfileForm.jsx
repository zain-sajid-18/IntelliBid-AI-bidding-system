"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Check, Loader2, User, Phone, MapPin, Globe, 
    Briefcase, FileText, Tag, ChevronDown, 
    AlertCircle, Info, Building2, ExternalLink 
} from "lucide-react";

const FALLBACK_COUNTRIES = [
    { name: "Pakistan", flag: "https://flagcdn.com/pk.svg", code: "+92" },
    { name: "United States", flag: "https://flagcdn.com/us.svg", code: "+1" },
    { name: "United Kingdom", flag: "https://flagcdn.com/gb.svg", code: "+44" },
    { name: "Canada", flag: "https://flagcdn.com/ca.svg", code: "+1" },
    { name: "Australia", flag: "https://flagcdn.com/au.svg", code: "+61" },
    { name: "United Arab Emirates", flag: "https://flagcdn.com/ae.svg", code: "+971" },
    { name: "Saudi Arabia", flag: "https://flagcdn.com/sa.svg", code: "+966" },
    { name: "Germany", flag: "https://flagcdn.com/de.svg", code: "+49" },
    { name: "France", flag: "https://flagcdn.com/fr.svg", code: "+33" },
    { name: "India", flag: "https://flagcdn.com/in.svg", code: "+91" },
    { name: "China", flag: "https://flagcdn.com/cn.svg", code: "+86" },
    { name: "Japan", flag: "https://flagcdn.com/jp.svg", code: "+81" },
    { name: "Turkey", flag: "https://flagcdn.com/tr.svg", code: "+90" },
    { name: "Singapore", flag: "https://flagcdn.com/sg.svg", code: "+65" },
    { name: "Malaysia", flag: "https://flagcdn.com/my.svg", code: "+60" },
    { name: "Bangladesh", flag: "https://flagcdn.com/bd.svg", code: "+880" },
    { name: "Sri Lanka", flag: "https://flagcdn.com/lk.svg", code: "+94" },
    { name: "Nepal", flag: "https://flagcdn.com/np.svg", code: "+977" },
    { name: "South Africa", flag: "https://flagcdn.com/za.svg", code: "+27" },
    { name: "Italy", flag: "https://flagcdn.com/it.svg", code: "+39" },
    { name: "Spain", flag: "https://flagcdn.com/es.svg", code: "+34" },
    { name: "Brazil", flag: "https://flagcdn.com/br.svg", code: "+55" },
    { name: "Russian Federation", flag: "https://flagcdn.com/ru.svg", code: "+7" },
];

export default function EditProfileForm({ user, onSaved }) {
    const setUser = useAuthStore((s) => s.setUser);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    
    // UI States
    const [activeSection, setActiveSection] = useState("personal"); // personal, business, contact

    const [form, setForm] = useState(() => {
        let phone = user.phone || "";
        let countryCode = "+92";
        
        // Better phone parsing
        const match = phone.match(/^(\+\d{1,4})(\d+)$/);
        if (match) {
            countryCode = match[1];
            phone = match[2];
        }

        let location = user.location || "";
        let city = "";
        if (location.includes(", ")) {
            const parts = location.split(", ");
            city = parts[0];
            location = parts[1];
        }

        const shippingAddress = user.shippingAddress || {};

        return {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            bio: user.bio || "",
            phone: phone,
            countryCode: countryCode,
            location: location,
            city: city,
            website: user.website || "",
            businessName: user.businessName || "",
            businessCategory: user.businessCategory || "",
            shippingStreet: shippingAddress.street || "",
            shippingCity: shippingAddress.city || "",
            shippingState: shippingAddress.state || "",
            shippingZip: shippingAddress.zip || "",
            shippingCountry: shippingAddress.country || "",
        };
    });

    const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
    const [cities, setCities] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Fetch professional country data (Name, Flag, Calling Code)
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,idd");
                const data = await res.json();
                const formatted = data.map(c => ({
                    name: c.name.common,
                    flag: c.flags.svg || c.flags.png,
                    code: c.idd.root + (c.idd.suffixes?.[0] || "")
                })).sort((a, b) => a.name.localeCompare(b.name));
                setCountries(formatted);
            } catch (err) {
                console.warn("Failed to fetch countries, falling back to static list:", err);
                setCountries(FALLBACK_COUNTRIES);
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch cities using CountriesNow API (more reliable for cities)
    useEffect(() => {
        const fetchCities = async () => {
            if (!form.location) {
                setCities([]);
                return;
            }
            setLoadingCities(true);
            try {
                const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ country: form.location }),
                });
                const data = await res.json();
                if (!data.error) {
                    setCities(data.data.sort());
                } else {
                    setCities([]);
                }
            } catch (err) {
                console.error("Failed to fetch cities", err);
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        };
        fetchCities();
    }, [form.location]);

    const validateName = (name) => {
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        return nameRegex.test(name) && name.length <= 50;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if ((name === "firstName" || name === "lastName") && value !== "" && !validateName(value)) return;
        if (name === "businessName" && value.length > 100) return;
        if (name === "bio" && value.length > 500) return;
        if (name === "phone" && !/^\d*$/.test(value)) return;

        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateName(form.firstName) || !validateName(form.lastName)) {
            setError("Please enter a valid name (letters only, max 50 chars)");
            return;
        }

        setLoading(true);
        setSuccess(false);
        setError("");

        const submissionData = {
            ...form,
            phone: form.phone ? `${form.countryCode}${form.phone}` : "",
            location: form.city && form.location ? `${form.city}, ${form.location}` : (form.location || ""),
            shippingAddress: {
                street: form.shippingStreet,
                city: form.shippingCity,
                state: form.shippingState,
                zip: form.shippingZip,
                country: form.shippingCountry
            }
        };

        try {
            const data = await api("/api/profile/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData),
            });
            if (data.user) {
                setUser(data.user);
                if (onSaved) onSaved(data.user);
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const nameProgress = useMemo(() => ({
        first: (form.firstName.length / 50) * 100,
        last: (form.lastName.length / 50) * 100
    }), [form.firstName, form.lastName]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with Navigation */}
            <div className="bg-white border-[3px] border-[var(--ink)] rounded-3xl shadow-[8px_8px_0_0_var(--ink)] p-2">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: "personal", label: "Personal Info", icon: User, color: "var(--acid)" },
                        { id: "contact", label: "Contact & Location", icon: Phone, color: "var(--electric)" },
                        ...(user.role === 'seller' ? [{ id: "business", label: "Business Details", icon: Building2, color: "var(--hotpink)" }] : [])
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-display text-sm font-black uppercase tracking-tight transition-all
                                ${activeSection === tab.id 
                                    ? `bg-[${tab.color}] text-[var(--ink)] border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] -translate-y-1` 
                                    : "hover:bg-[var(--background)] opacity-60 hover:opacity-100"}`}
                            style={{ backgroundColor: activeSection === tab.id ? tab.color : 'transparent' }}
                        >
                            <tab.icon size={18} strokeWidth={3} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border-[3px] border-[var(--ink)] rounded-[2.5rem] shadow-[12px_12px_0_0_var(--ink)] overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        {activeSection === "personal" && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">First Name</label>
                                            <span className={`text-[10px] font-bold ${form.firstName.length > 40 ? 'text-[var(--hotpink)]' : 'text-[var(--ink)]/40'}`}>{form.firstName.length}/50</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                maxLength={50}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold text-lg outline-none focus:border-[var(--electric)] focus:shadow-[4px_4px_0_0_var(--electric)] transition-all"
                                                placeholder="Enter first name"
                                            />
                                            <div className="absolute bottom-0 left-0 h-1 bg-[var(--electric)] transition-all duration-300" style={{ width: `${nameProgress.first}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">Last Name</label>
                                            <span className={`text-[10px] font-bold ${form.lastName.length > 40 ? 'text-[var(--hotpink)]' : 'text-[var(--ink)]/40'}`}>{form.lastName.length}/50</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                maxLength={50}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold text-lg outline-none focus:border-[var(--electric)] focus:shadow-[4px_4px_0_0_var(--electric)] transition-all"
                                                placeholder="Enter last name"
                                            />
                                            <div className="absolute bottom-0 left-0 h-1 bg-[var(--electric)] transition-all duration-300" style={{ width: `${nameProgress.last}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">Short Bio</label>
                                        <span className={`text-[10px] font-bold ${form.bio.length > 450 ? 'text-[var(--hotpink)]' : 'text-[var(--ink)]/40'}`}>{form.bio.length}/500</span>
                                    </div>
                                    <textarea
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        rows={5}
                                        maxLength={500}
                                        className="w-full bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-3xl p-6 font-medium text-lg outline-none focus:border-[var(--acid)] focus:shadow-[4px_4px_0_0_var(--acid)] transition-all resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeSection === "contact" && (
                            <motion.div
                                key="contact"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">Phone Connection</label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="relative w-full sm:w-64">
                                            <select
                                                name="countryCode"
                                                value={form.countryCode}
                                                onChange={handleChange}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-12 font-bold appearance-none outline-none focus:border-[var(--electric)] transition-all"
                                            >
                                                {countries.map((c, i) => (
                                                    <option key={`${c.code}-${i}`} value={c.code}>{c.code} ({c.name})</option>
                                                ))}
                                            </select>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                {countries.find(c => c.code === form.countryCode)?.flag ? (
                                                    <img src={countries.find(c => c.code === form.countryCode).flag} className="w-6 h-4 rounded-sm object-cover" alt="" />
                                                ) : <Phone size={16} />}
                                            </div>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="flex-1 h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold text-lg outline-none focus:border-[var(--electric)] focus:shadow-[4px_4px_0_0_var(--electric)] transition-all"
                                            placeholder="300 1234567"
                                        />
                                    </div>
                                    <p className="flex items-center gap-2 text-[10px] font-bold text-[var(--ink)]/40 uppercase tracking-tighter">
                                        <Info size={12} /> Verification: {form.phone.length >= 7 && form.phone.length <= 15 ? '✅ Length Valid' : '❌ Needs 7-15 digits'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">Location Details</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <select
                                                name="location"
                                                value={form.location}
                                                onChange={handleChange}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold appearance-none outline-none focus:border-[var(--electric)] transition-all"
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map((c, i) => (
                                                    <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={18} />
                                        </div>
                                        <div className="relative">
                                            <select
                                                name="city"
                                                value={form.city}
                                                onChange={handleChange}
                                                disabled={!form.location || loadingCities}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold appearance-none outline-none focus:border-[var(--electric)] transition-all disabled:opacity-30"
                                            >
                                                <option value="">{loadingCities ? "Fetching cities..." : "Select City"}</option>
                                                {cities.map((city, i) => (
                                                    <option key={`${city}-${i}`} value={city}>{city}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">Shipping Address</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--ink)]/40">
                                            <MapPin size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            name="shippingStreet"
                                            value={form.shippingStreet}
                                            onChange={handleChange}
                                            className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl pl-16 pr-6 font-bold outline-none focus:border-[var(--electric)] transition-all"
                                            placeholder="Street Address (e.g., 123 Main St)"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="shippingCity"
                                                value={form.shippingCity}
                                                onChange={handleChange}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold outline-none focus:border-[var(--electric)] transition-all"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="shippingState"
                                                value={form.shippingState}
                                                onChange={handleChange}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold outline-none focus:border-[var(--electric)] transition-all"
                                                placeholder="State/Province"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="shippingZip"
                                                value={form.shippingZip}
                                                onChange={handleChange}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold outline-none focus:border-[var(--electric)] transition-all"
                                                placeholder="ZIP/Postal Code"
                                            />
                                        </div>
                                        <div className="relative">
                                            <select
                                                name="shippingCountry"
                                                value={form.shippingCountry}
                                                onChange={handleChange}
                                                className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl px-6 font-bold appearance-none outline-none focus:border-[var(--electric)] transition-all"
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map((c, i) => (
                                                    <option key={`shipping-${c.name}-${i}`} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">Digital Presence</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--ink)]/40">
                                            <Globe size={20} />
                                        </div>
                                        <input
                                            type="url"
                                            name="website"
                                            value={form.website}
                                            onChange={handleChange}
                                            className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl pl-16 pr-6 font-bold outline-none focus:border-[var(--electric)] transition-all"
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === "business" && (
                            <motion.div
                                key="business"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">Business Name</label>
                                        <span className={`text-[10px] font-bold ${form.businessName.length > 90 ? 'text-[var(--hotpink)]' : 'text-[var(--ink)]/40'}`}>{form.businessName.length}/100</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--ink)]/40">
                                            <Briefcase size={20} />
                                        </div>
                                        <input
                                            name="businessName"
                                            value={form.businessName}
                                            onChange={handleChange}
                                            className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl pl-16 pr-6 font-bold text-lg outline-none focus:border-[var(--hotpink)] focus:shadow-[4px_4px_0_0_var(--hotpink)] transition-all"
                                            placeholder="Legal entity or brand name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/60">Primary Category</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--ink)]/40">
                                            <Tag size={20} />
                                        </div>
                                        <select
                                            name="businessCategory"
                                            value={form.businessCategory}
                                            onChange={handleChange}
                                            className="w-full h-16 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-2xl pl-16 pr-12 font-bold appearance-none outline-none focus:border-[var(--hotpink)] transition-all"
                                        >
                                            <option value="">Choose Industry</option>
                                            {["Electronics", "Fine Art", "Antiques", "Luxury Watches", "Fashion", "Collectibles", "Real Estate", "Automotive", "Other"].map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer Actions */}
                    <div className="mt-12 pt-8 border-t-[3px] border-dashed border-[var(--ink)]/10 flex flex-col sm:flex-row items-center gap-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[var(--ink)] text-white px-10 py-5 rounded-2xl font-display text-base font-black uppercase tracking-widest shadow-[6px_6px_0_0_var(--acid)] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--acid)] active:translate-y-0 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Save Profile <Check size={20} strokeWidth={3} />
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-center gap-3 text-[var(--hotpink)] font-black uppercase text-xs animate-shake">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 text-[var(--ink)] font-black uppercase text-xs bg-[var(--acid)] px-4 py-2 rounded-full border-[2px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)]"
                                >
                                    <Check size={16} strokeWidth={4} /> Profile Synchronized!
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </form>
            </div>
        </div>
    );
}
