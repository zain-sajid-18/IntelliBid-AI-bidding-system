"use client";

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { AlertTriangle, Trophy, Clock, ArrowRight } from 'lucide-react';

export default function MessageBubble({ message, isSystem }) {
    const { user } = useAuthStore();
    const isMe = message.senderId?._id === user?.id;

    if (isSystem || message.messageType === 'system_alert') {
        const payload = message.payload || {};
        const alertConfig = {
            outbid: { bg: 'bg-[var(--hotpink)]', text: 'text-white', icon: <AlertTriangle size={24} /> },
            won: { bg: 'bg-[var(--sunset)]', text: 'text-white', icon: <Trophy size={24} /> },
            ending_soon: { bg: 'bg-[var(--acid)]', text: 'text-[var(--ink)]', icon: <Clock size={24} /> }
        }[payload.alertType] || { bg: 'bg-white', text: 'text-[var(--ink)]', icon: <Info size={24} /> };

        return (
            <div className="flex justify-center w-full my-4">
                <div className={`w-full max-w-md ${alertConfig.bg} ${alertConfig.text} border-[3px] border-[var(--ink)] rounded-2xl p-4 shadow-[4px_4px_0_0_var(--ink)]`}>
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-1">{alertConfig.icon}</div>
                        <div className="flex-1">
                            <h4 className="font-display font-black text-lg uppercase tracking-tight">{message.content}</h4>
                            <p className="font-medium text-sm mt-1 opacity-90">{payload.body}</p>
                            
                            {payload.ctaHref && (
                                <Link 
                                    href={payload.ctaHref}
                                    className="inline-flex items-center gap-2 mt-3 bg-white text-[var(--ink)] px-4 py-2 rounded-xl border-[2px] border-[var(--ink)] font-black uppercase tracking-widest text-[10px] hover:-translate-y-1 hover:shadow-[2px_2px_0_0_var(--ink)] transition-all"
                                >
                                    {payload.ctaLabel} <ArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 border-[3px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] ${
                    isMe 
                        ? 'bg-[var(--acid)] rounded-2xl rounded-tr-sm' 
                        : 'bg-white rounded-2xl rounded-tl-sm'
                }`}>
                    <p className="font-medium text-[var(--ink)] whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-[10px] font-bold opacity-50 px-1">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
