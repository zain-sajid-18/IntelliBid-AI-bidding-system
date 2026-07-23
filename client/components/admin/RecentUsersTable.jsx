import { motion } from "framer-motion";
import { UserCheck, UserX, Shield, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function RecentUsersTable({ users }) {
  if (!users || users.length === 0) {
    return (
      <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-8 text-center shadow-[4px_4px_0_0_var(--ink)]">
        <h3 className="font-display text-xl font-black uppercase tracking-tight mb-2">No Users Found</h3>
        <p className="font-medium opacity-70 mb-6">No users have registered yet.</p>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="bg-[var(--ink)] text-white px-2 py-1 rounded text-xs font-black uppercase">Admin</span>;
      case 'seller': return <span className="bg-[var(--sunset)] text-white px-2 py-1 rounded text-xs font-black uppercase">Seller</span>;
      default: return <span className="bg-[var(--background)] text-[var(--ink)] px-2 py-1 rounded border-[2px] border-[var(--ink)] text-xs font-black uppercase">Buyer</span>;
    }
  };

  return (
    <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)]">
      <div className="p-5 border-b-[3px] border-[var(--ink)] bg-[var(--background)] flex justify-between items-center">
        <h2 className="font-display text-xl font-black uppercase tracking-tighter">Recent Registrations</h2>
        <Link href="/admin/users" className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-[var(--electric)] transition-colors">
          View All Users
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-[3px] border-[var(--ink)] bg-gray-50">
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500">User</th>
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500">Email</th>
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500">Role</th>
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <motion.tr 
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-b-[3px] border-[var(--ink)] last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[var(--electric)] text-white border-[2px] border-[var(--ink)] rounded-full flex items-center justify-center font-display font-black shadow-[2px_2px_0_0_var(--ink)]">
                      {user.name[0]}
                    </div>
                    <span className="font-bold">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 font-medium opacity-80">{user.email}</td>
                <td className="p-4">{getRoleBadge(user.role)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase">
                    {user.isVerified ? (
                      <><UserCheck size={16} className="text-[var(--acid)]" /> Verified</>
                    ) : (
                      <><UserX size={16} className="text-gray-400" /> Unverified</>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors border-[2px] border-transparent hover:border-[var(--ink)]">
                        <MoreVertical size={18} />
                    </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
