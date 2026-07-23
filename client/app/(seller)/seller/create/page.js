"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListingStore } from "@/store/listingStore";
import StepImages from "@/components/listing/StepImages";
import StepDetails from "@/components/listing/StepDetails";
import StepPricing from "@/components/listing/StepPricing";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, DollarSign, CheckCircle2, ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const STEPS = [
    { label: "Photos", icon: Camera },
    { label: "Details", icon: Sparkles },
    { label: "Pricing", icon: DollarSign },
];

function StepIndicator({ currentStep }) {
    return (
        <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                return (
                    <div key={step.label} className="flex items-center">
                        <div className={`flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] px-4 py-2.5 font-display text-sm font-black uppercase transition-all
                            ${isActive ? 'bg-[var(--electric)] text-white shadow-[3px_3px_0_0_var(--ink)] -translate-y-0.5' : ''}
                            ${isDone ? 'bg-[var(--acid)] text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]' : ''}
                            ${!isActive && !isDone ? 'bg-white text-[var(--ink)]/40' : ''}
                        `}>
                            {isDone ? <CheckCircle2 className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" strokeWidth={3} />}
                            <span className="hidden sm:inline">{step.label}</span>
                            <span className="inline sm:hidden">{i + 1}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-[3px] w-8 md:w-12 transition-colors ${i < currentStep ? 'bg-[var(--electric)]' : 'bg-[var(--ink)]/20'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function canProceedStep(step, store) {
    if (step === 0) return store.imagePreviews.length > 0;
    if (step === 1) return !!store.title && !!store.category && !!store.description;
    if (step === 2) {
        const startingValid = !!store.startingPrice && Number(store.startingPrice) > 0;
        if (!startingValid) return false;
        // Check reserve price validation
        const parsedStarting = Number(store.startingPrice);
        const parsedReserve = store.reservePrice ? Number(store.reservePrice) : null;
        const hasReserveError = parsedReserve !== null && parsedReserve < parsedStarting;
        if (hasReserveError) return false;
        // Live bidding validation
        if (store.type === 'live') {
            if (!store.scheduledStartTime) return false;
            if (new Date(store.scheduledStartTime) <= new Date()) return false;
            // Max duration check (2 hours = 120 mins)
            if (!store.liveDurationMinutes || store.liveDurationMinutes > 120) return false;
        }
        return true;
    }
    return false;
}

export default function CreateListingPage() {
    const router = useRouter();
    const store = useListingStore();
    const { step, nextStep, prevStep, submitListing, submitting, submitError, submitSuccess, createdListingId, reset } = store;

    useEffect(() => {
        if (submitSuccess && createdListingId) {
            setTimeout(() => {
                reset();
                router.push('/seller/products');
            }, 2000);
        }
    }, [submitSuccess, createdListingId]);

    const canProceed = canProceedStep(step, store);

    const handleNext = () => {
        if (step < 2) nextStep();
        else submitListing();
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 md:p-10">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[4px] border-[var(--ink)] pb-6">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight">
                        Create Listing
                    </h1>
                    <p className="mt-1 font-medium text-[var(--ink)]/60">
                        Go live in under 90 seconds — let AI handle the hard parts.
                    </p>
                </div>
                <StepIndicator currentStep={step} />
            </div>

            {/* Success State */}
            <AnimatePresence>
                {submitSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="brutal mx-auto max-w-lg bg-[var(--acid)] p-10 text-center"
                    >
                        <CheckCircle2 className="mx-auto h-16 w-16 mb-4" strokeWidth={2} />
                        <h2 className="font-display text-3xl font-black uppercase">Listing Live!</h2>
                        <p className="mt-2 font-medium">Your auction is now visible to buyers. Redirecting to My Products…</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Wizard Body */}
            {!submitSuccess && (
                <div className="mx-auto max-w-4xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.2 }}
                            className="brutal bg-white p-8 md:p-10"
                        >
                            {step === 0 && <StepImages />}
                            {step === 1 && <StepDetails />}
                            {step === 2 && <StepPricing />}
                        </motion.div>
                    </AnimatePresence>

                    {/* Error */}
                    {submitError && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 flex items-center gap-2 rounded-xl border-[3px] border-[var(--hotpink)] bg-[var(--hotpink)]/10 px-4 py-3 font-bold text-[var(--hotpink)]"
                        >
                            <AlertCircle className="h-5 w-5 shrink-0" /> {submitError}
                        </motion.div>
                    )}

                    {/* Navigation */}
                    <div className="mt-6 flex items-center justify-between">
                        <button
                            onClick={step === 0 ? () => router.push('/seller/dashboard') : prevStep}
                            className="flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-white px-6 py-3 font-display text-sm font-black uppercase shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--ink)]"
                        >
                            <ArrowLeft className="h-4 w-4" strokeWidth={3} />
                            {step === 0 ? 'Cancel' : 'Back'}
                        </button>

                        <div className="flex items-center gap-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className={`h-2.5 rounded-full border-[2px] border-[var(--ink)] transition-all ${i === step ? 'w-8 bg-[var(--electric)]' : i < step ? 'w-2.5 bg-[var(--acid)]' : 'w-2.5 bg-white'}`} />
                            ))}
                        </div>

                        <button
                            disabled={!canProceed || submitting}
                            onClick={handleNext}
                            className={`flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] px-6 py-3 font-display text-sm font-black uppercase shadow-[4px_4px_0_0_var(--ink)] transition-all
                                ${canProceed ? 'bg-[var(--hotpink)] text-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]' : 'bg-[var(--ink)]/20 text-[var(--ink)]/40 cursor-not-allowed'}
                                disabled:hover:translate-y-0`}
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
                            ) : step === 2 ? (
                                <>🚀 Publish Listing</>
                            ) : (
                                <>Next <ArrowRight className="h-4 w-4" strokeWidth={3} /></>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
