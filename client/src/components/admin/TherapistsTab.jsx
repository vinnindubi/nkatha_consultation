export default function TherapistsTab({ therapists, form, setForm, onSubmit, onDelete }) {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4 h-fit">
        <h3 className="font-bold text-lg text-gray-900">Onboard New Therapist</h3>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:bg-white focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
          <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:bg-white focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Temporary Password</label>
          <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:bg-white focus:border-primary" />
        </div>
        <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl text-xs">Create Account</button>
      </form>

      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Active Team Members ({therapists.length})</h3>
        <div className="space-y-3">
          {therapists.map(t => (
            <div key={t.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                <p className="text-xs text-gray-500">{t.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{t._count?.therapistAppts || 0} bookings</span>
                <button onClick={() => confirm('Remove therapist?') && onDelete(t.id)} className="text-red-600 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}