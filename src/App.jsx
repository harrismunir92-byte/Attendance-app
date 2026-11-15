import React, { useState, useEffect } from 'react';
import { Users, UserPlus, DollarSign, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Download, Trash2, Printer } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Employees State with Initial Data
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('hr_employees');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Ali Khan', designation: 'Software Engineer', baseSalary: 80000, phone: '0300-1234567' },
      { id: 2, name: 'Ahmed Raza', designation: 'Accountant', baseSalary: 60000, phone: '0321-7654321' },
      { id: 3, name: 'Fatima Noor', designation: 'HR Manager', baseSalary: 75000, phone: '0333-9876543' }
    ];
  });

  // Attendance Records State (with Check-in/Out times)
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('hr_attendance');
    const today = new Date().toISOString().split('T')[0];
    return saved ? JSON.parse(saved) : {
      [today]: {
        1: { status: 'Present', checkIn: '09:00', checkOut: '17:00', overtime: 0 },
        2: { status: 'Present', checkIn: '09:15', checkOut: '17:00', overtime: 0 },
        3: { status: 'Absent', checkIn: '', checkOut: '', overtime: 0 }
      }
    };
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // New Employee Form State
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    localStorage.setItem('hr_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hr_attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Handle Attendance Change
  const updateAttendance = (empId, field, value) => {
    setAttendance(prev => {
      const dayData = prev[selectedDate] || {};
      const empData = dayData[empId] || { status: 'Present', checkIn: '09:00', checkOut: '17:00', overtime: 0 };
      
      return {
        ...prev,
        [selectedDate]: {
          ...dayData,
          [empId]: { ...empData, [field]: value }
        }
      };
    });
  };

  // Add Employee Handler
  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newName || !newSalary) return;
    const newEmp = {
      id: Date.now(),
      name: newName,
      designation: newDesignation || 'Staff',
      baseSalary: parseFloat(newSalary),
      phone: newPhone || 'N/A'
    };
    setEmployees([...employees, newEmp]);
    setNewName('');
    setNewDesignation('');
    setNewSalary('');
    setNewPhone('');
    alert('Employee successfully added!');
  };

  // Delete Employee
  const deleteEmployee = (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  // Salary Calculation Logic per Employee
  const calculatePayroll = (emp) => {
    const totalDaysInMonth = 30;
    const perDaySalary = emp.baseSalary / totalDaysInMonth;
    
    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let totalOvertimeHours = 0;

    Object.keys(attendance).forEach(date => {
      const record = attendance[date]?.[emp.id];
      if (record) {
        if (record.status === 'Present') presentCount++;
        if (record.status === 'Absent') absentCount++;
        if (record.status === 'Half-Day') halfDayCount++;
        totalOvertimeHours += Number(record.overtime || 0);
      }
    });

    // Deductions & Additions
    const absentDeduction = absentCount * perDaySalary;
    const halfDayDeduction = halfDayCount * (perDaySalary / 2);
    const overtimePay = totalOvertimeHours * (perDaySalary / 8 * 1.5); // 1.5x hourly rate

    const netSalary = Math.max(0, emp.baseSalary - absentDeduction - halfDayDeduction + overtimePay);

    return {
      presentCount,
      absentCount,
      halfDayCount,
      totalOvertimeHours,
      deductions: Math.round(absentDeduction + halfDayDeduction),
      netSalary: Math.round(netSalary)
    };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
            <Clock className="w-7 h-7" /> AttendPro HR & Payroll
          </h1>
          <p className="text-xs text-slate-400">Professional Attendance & Salary Automation System</p>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Daily Attendance</button>
          <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'employees' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Employees</button>
          <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'payroll' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Payroll & Salary</button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="p-6 max-w-7xl mx-auto">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Employees</p>
                  <h3 className="text-3xl font-bold mt-1 text-indigo-400">{employees.length}</h3>
                </div>
                <Users className="w-10 h-10 text-indigo-500 bg-indigo-500/10 p-2 rounded-xl" />
              </div>
              <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Today's Date</p>
                  <h3 className="text-lg font-bold mt-1 text-emerald-400">{selectedDate}</h3>
                </div>
                <Calendar className="w-10 h-10 text-emerald-500 bg-emerald-500/10 p-2 rounded-xl" />
              </div>
              <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Payroll Budget</p>
                  <h3 className="text-3xl font-bold mt-1 text-cyan-400">Rs. {employees.reduce((acc, curr) => acc + curr.baseSalary, 0).toLocaleString()}</h3>
                </div>
                <DollarSign className="w-10 h-10 text-cyan-500 bg-cyan-500/10 p-2 rounded-xl" />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Quick Shortcuts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setActiveTab('attendance')} className="p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-xl hover:bg-indigo-600/30 text-left transition">
                  <h4 className="font-bold text-indigo-300">Mark Today's Attendance & Time Out</h4>
                  <p className="text-xs text-slate-400 mt-1">Record check-in, check-out and overtime hours for staff.</p>
                </button>
                <button onClick={() => setActiveTab('payroll')} className="p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/30 text-left transition">
                  <h4 className="font-bold text-emerald-300">Calculate Salaries & Print Payslip</h4>
                  <p className="text-xs text-slate-400 mt-1">Automatic deductions based on leaves and generated salary slips.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY ATTENDANCE WITH TIME IN/OUT */}
        {activeTab === 'attendance' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold">Daily Attendance & Time Tracking</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-400">Select Date:</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm">
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Overtime (Hrs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {employees.map(emp => {
                    const record = attendance[selectedDate]?.[emp.id] || { status: 'Present', checkIn: '09:00', checkOut: '17:00', overtime: 0 };
                    return (
                      <tr key={emp.id} className="hover:bg-slate-700/50">
                        <td className="py-4 px-4 font-medium">{emp.name}</td>
                        <td className="py-4 px-4 text-slate-400 text-sm">{emp.designation}</td>
                        <td className="py-4 px-4">
                          <select 
                            value={record.status} 
                            onChange={(e) => updateAttendance(emp.id, 'status', e.target.value)}
                            className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Half-Day">Half-Day</option>
                            <option value="Leave">On Leave</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <input 
                            type="time" 
                            value={record.checkIn} 
                            onChange={(e) => updateAttendance(emp.id, 'checkIn', e.target.value)}
                            className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input 
                            type="time" 
                            value={record.checkOut} 
                            onChange={(e) => updateAttendance(emp.id, 'checkOut', e.target.value)}
                            className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <input 
                            type="number" 
                            min="0" 
                            max="10" 
                            value={record.overtime} 
                            onChange={(e) => updateAttendance(emp.id, 'overtime', e.target.value)}
                            className="bg-slate-900 border border-slate-700 w-16 px-2 py-1 rounded-lg text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EMPLOYEES MANAGEMENT */}
        {activeTab === 'employees' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 lg:col-span-1 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-400" /> Add New Employee</h2>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400">Full Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Usman Ali" required className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Designation</label>
                  <input type="text" value={newDesignation} onChange={e => setNewDesignation(e.target.value)} placeholder="e.g. Sales Executive" className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Base Salary (Rs)</label>
                  <input type="number" value={newSalary} onChange={e => setNewSalary(e.target.value)} placeholder="e.g. 50000" required className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Phone Number</label>
                  <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="0300-0000000" className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-sm mt-1" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition">Save Employee</button>
              </form>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold">Employee Directory ({employees.length})</h2>
              <div className="space-y-3">
                {employees.map(emp => (
                  <div key={emp.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-base">{emp.name}</h4>
                      <p className="text-xs text-slate-400">{emp.designation} | Phone: {emp.phone}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-emerald-400 text-sm">Rs. {emp.baseSalary.toLocaleString()}</span>
                      <button onClick={() => deleteEmployee(emp.id)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PAYROLL & SALARY */}
        {activeTab === 'payroll' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold">Automated Salary & Payroll Calculation</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Base Salary</th>
                    <th className="py-3 px-4">Present / Absent / Half</th>
                    <th className="py-3 px-4">OT Hours</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4 font-bold text-white">Net Payable</th>
                    <th className="py-3 px-4 text-center">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {employees.map(emp => {
                    const payroll = calculatePayroll(emp);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-700/50">
                        <td className="py-4 px-4 font-medium">
                          {emp.name}
                          <div className="text-xs text-slate-400">{emp.designation}</div>
                        </td>
                        <td className="py-4 px-4">Rs. {emp.baseSalary.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm">
                          <span className="text-emerald-400 font-bold">{payroll.presentCount}</span> / 
                          <span className="text-rose-400 font-bold mx-1">{payroll.absentCount}</span> / 
                          <span className="text-amber-400 font-bold">{payroll.halfDayCount}</span>
                        </td>
                        <td className="py-4 px-4 text-indigo-400 font-semibold">{payroll.totalOvertimeHours} hrs</td>
                        <td className="py-4 px-4 text-rose-400">- Rs. {payroll.deductions.toLocaleString()}</td>
                        <td className="py-4 px-4 font-bold text-emerald-400 text-base">Rs. {payroll.netSalary.toLocaleString()}</td>
                        <td className="py-4 px-4 text-center">
                          <button onClick={() => {
                            const slipWindow = window.open('', '_blank');
                            slipWindow.document.write(`
                              <html>
                              <head><title>Payslip - ${emp.name}</title></head>
                              <body style="font-family: Arial; padding: 40px; color: #333;">
                                <h2>AttendPro HR - Salary Payslip</h2>
                                <hr/>
                                <p><strong>Employee Name:</strong> ${emp.name}</p>
                                <p><strong>Designation:</strong> ${emp.designation}</p>
                                <p><strong>Base Salary:</strong> Rs. ${emp.baseSalary.toLocaleString()}</p>
                                <p><strong>Total Present Days:</strong> ${payroll.presentCount}</p>
                                <p><strong>Total Absent Days:</strong> ${payroll.absentCount}</p>
                                <p><strong>Leave/Half-Day Deductions:</strong> Rs. ${payroll.deductions.toLocaleString()}</p>
                                <p><strong>Overtime Hours:</strong> ${payroll.totalOvertimeHours} hrs</p>
                                <hr/>
                                <h3>Net Payable Salary: Rs. ${payroll.netSalary.toLocaleString()}</h3>
                                <br/><br/>
                                <p>Authorized Signature: ______________________</p>
                              </body>
                              </html>
                            `);
                            slipWindow.print();
                          }} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl text-xs inline-flex items-center gap-1">
                            <Printer className="w-4 h-4" /> Print Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
