import { format, parse } from 'date-fns';
import { useDashboardStore } from '../../store/useDashboardStore';

export default function AppointmentsTab({ appointments, isLoading, onUpdateStatus }) {
  const { selectedAppointment, setSelectedAppointment } = useDashboardStore();

  const formatAppointmentDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return 'Not Scheduled';
    try {
      const cleanDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : new Date(dateStr).toISOString().split('T')[0];
      const parsed = parse(`${cleanDate} ${timeStr}`, 'yyyy-MM-dd hh:mm a', new Date());
      if (isNaN(parsed.getTime())) return 'Invalid Date';
      return format(parsed, 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (appointments.length === 0) {
    return <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">No appointments found.</div>;
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-6">Client</th>
                <th className="p-6">Service</th>
                <th className="p-6">Scheduled Time</th>
                <th className="p-6">Assigned Therapist</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-gray-900">{app.clientName}</div>
                    <div className="text-xs text-gray-500">{app.clientEmail}</div>
                  </td>
                  <td className="p-6 font-semibold text-primary">{app.service?.name || 'General Consultation'}</td>
                  <td className="p-6 text-gray-600">{formatAppointmentDateTime(app.appointmentDate, app.startTime)}</td>
                  <td className="p-6 text-gray-600 text-xs font-medium">{app.user?.name || app.therapist?.name || 'Unassigned'}</td>
                  <td className="p-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <button 
                      onClick={() => setSelectedAppointment(app)} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      View
                    </button>
                    {app.status !== 'APPROVED' && (
                      <button 
                        onClick={() => onUpdateStatus({ id: app.id, status: 'APPROVED' })} 
                        className="bg-green-50 hover:bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                  Consultation Details
                </span>
                <h3 className="text-2xl font-black text-primary mt-2">{selectedAppointment.clientName}</h3>
              </div>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600 border-t border-b border-gray-100 py-6 my-4">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Service:</span>
                <span className="font-bold text-gray-900">{selectedAppointment.service?.name || 'General Consultation'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Email:</span>
                <span className="font-medium text-gray-900">{selectedAppointment.clientEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Phone:</span>
                <span className="font-medium text-gray-900">{selectedAppointment.clientPhone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Scheduled Time:</span>
                <span className="font-medium text-gray-900">
                  {formatAppointmentDateTime(selectedAppointment.appointmentDate, selectedAppointment.startTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Format:</span>
                <span className="font-bold uppercase text-primary">{selectedAppointment.sessionFormat || 'Online'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Status:</span>
                <span className={`font-bold uppercase ${selectedAppointment.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Client Notes / Context</h4>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-700 italic text-sm min-h-[80px]">
                {selectedAppointment.notes ? `"${selectedAppointment.notes}"` : 'No notes provided by the client for this session.'}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {selectedAppointment.status !== 'APPROVED' && (
                <button
                  onClick={() => {
                    onUpdateStatus({ id: selectedAppointment.id, status: 'APPROVED' });
                    setSelectedAppointment(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
                >
                  Approve Appointment
                </button>
              )}
              <button
                onClick={() => {
                  onUpdateStatus({ id: selectedAppointment.id, status: 'REJECTED' });
                  setSelectedAppointment(null);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                Cancel Session
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}