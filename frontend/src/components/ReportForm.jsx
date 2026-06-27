import React, { useState, useEffect } from 'react';
import { Plus, Trash, Check, Camera, PlusCircle, Hammer, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const ReportForm = ({ siteId, initialMaterials = [], onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [workDone, setWorkDone] = useState('');
  const [remarks, setRemarks] = useState('');
  const [flaggedDelay, setFlaggedDelay] = useState(false);
  const [photos, setPhotos] = useState([]);

  // Material Tracker Fields (Initial materials seeded from site)
  const [materialsList, setMaterialsList] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: '', received: 0, used: 0 });
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  // Labour Attendance Fields
  const [labourList, setLabourList] = useState([
    { trade: 'Masons', headcount: 0, hoursWorked: 0 },
    { trade: 'Helpers', headcount: 0, hoursWorked: 0 },
    { trade: 'Carpenters', headcount: 0, hoursWorked: 0 },
  ]);
  const [customTrade, setCustomTrade] = useState({ trade: '', headcount: 0, hoursWorked: 0 });

  useEffect(() => {
    if (initialMaterials && initialMaterials.length > 0) {
      setMaterialsList(initialMaterials.map(m => ({
        id: m.id,
        name: m.name,
        unit: m.unit,
        received: 0,
        used: 0,
      })));
    }
  }, [initialMaterials]);

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const updateMaterialField = (index, field, value) => {
    setMaterialsList(prev => prev.map((item, idx) => 
      idx === index ? { ...item, [field]: parseFloat(value) || 0 } : item
    ));
  };

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.unit) {
      setMaterialsList(prev => [...prev, {
        name: newMaterial.name,
        unit: newMaterial.unit,
        received: parseFloat(newMaterial.received) || 0,
        used: parseFloat(newMaterial.used) || 0,
      }]);
      setNewMaterial({ name: '', unit: '', received: 0, used: 0 });
      setShowAddMaterial(false);
    }
  };

  const updateLabourField = (index, field, value) => {
    setLabourList(prev => prev.map((item, idx) => 
      idx === index ? { ...item, [field]: field === 'trade' ? value : parseFloat(value) || 0 } : item
    ));
  };

  const handleAddLabourTrade = () => {
    if (customTrade.trade) {
      setLabourList(prev => [...prev, {
        trade: customTrade.trade,
        headcount: parseInt(customTrade.headcount) || 0,
        hoursWorked: parseFloat(customTrade.hoursWorked) || 0,
      }]);
      setCustomTrade({ trade: '', headcount: 0, hoursWorked: 0 });
    }
  };

  const handleRemoveLabourTrade = (index) => {
    setLabourList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('siteId', siteId);
      formData.append('reportDate', reportDate);
      formData.append('completionPercentage', completionPercentage);
      formData.append('workDone', workDone);
      formData.append('remarks', remarks);
      formData.append('flaggedDelay', flaggedDelay);

      // Append materials if logged
      const activeMaterials = materialsList.filter(m => m.received > 0 || m.used > 0);
      formData.append('materials', JSON.stringify(activeMaterials));

      // Append labor if logged
      const activeLabour = labourList.filter(l => l.headcount > 0 && l.hoursWorked > 0);
      formData.append('labour', JSON.stringify(activeLabour));

      // Append photos
      photos.forEach(file => {
        formData.append('photos', file);
      });

      const res = await axios.post('/api/reports/daily', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setWorkDone('');
      setRemarks('');
      setFlaggedDelay(false);
      setPhotos([]);
      
      // Reset log values
      setMaterialsList(prev => prev.map(m => ({ ...m, received: 0, used: 0 })));
      setLabourList(prev => prev.map(l => ({ ...l, headcount: 0, hoursWorked: 0 })));

      if (onSubmitSuccess) {
        onSubmitSuccess(res.data);
      }
    } catch (err) {
      console.error('Submit report error:', err);
      setError(err.response?.data?.message || 'Failed to submit daily report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-500 dark:bg-rose-950/10 dark:border-rose-900/20">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/10 dark:border-emerald-900/20">
          <Check size={16} /> Daily log submitted and verified successfully!
        </div>
      )}

      {/* Main progress entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Report Date</label>
          <input
            type="date"
            required
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completion Progress</label>
            <span className="text-xs font-bold text-accent-600 dark:text-accent-400">{completionPercentage}%</span>
          </div>
          <div className="flex items-center gap-4 py-2">
            <input
              type="range"
              min="0"
              max="100"
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(parseInt(e.target.value))}
              className="flex-1 accent-accent-600"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Work Accomplished Today</label>
        <textarea
          required
          rows={3}
          value={workDone}
          onChange={(e) => setWorkDone(e.target.value)}
          placeholder="E.g. Completed foundations concrete pour on sector B, tied reinforcement steel beams..."
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Obstacles / Remarks</label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Specify active delays, weather bottlenecks, subcontractor complaints..."
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Delay flag */}
      <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-500/5 p-4 dark:border-rose-950/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-rose-500" size={20} />
          <div>
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Flag Active Delay</h5>
            <p className="text-[11px] text-slate-500 leading-normal">Notifies management immediately and updates site status flag</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={flaggedDelay}
          onChange={(e) => setFlaggedDelay(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
        />
      </div>

      {/* Materials log section */}
      <div className="border-t border-slate-100 pt-5 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Materials Transactions Today</h5>
          <button
            type="button"
            onClick={() => setShowAddMaterial(!showAddMaterial)}
            className="flex items-center gap-1 text-xs font-semibold text-accent-600 hover:underline dark:text-accent-400"
          >
            <PlusCircle size={14} /> Add new tracker
          </button>
        </div>

        {showAddMaterial && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
            <input
              type="text"
              placeholder="Material name"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
            <input
              type="text"
              placeholder="Unit (e.g. Bags, Tons)"
              value={newMaterial.unit}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
            <input
              type="number"
              placeholder="Qty Received"
              value={newMaterial.received || ''}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, received: parseFloat(e.target.value) || 0 }))}
              className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={handleAddMaterial}
              className="rounded-lg bg-accent-600 px-3 py-2 text-xs font-bold text-white hover:bg-accent-700"
            >
              Add Item
            </button>
          </div>
        )}

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {materialsList.length === 0 ? (
            <p className="text-xs text-slate-400">No materials currently tracked. Click "Add new tracker" to log stock levels.</p>
          ) : (
            materialsList.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-1/4">
                  {item.name} <span className="text-[10px] text-slate-400 font-normal">({item.unit})</span>
                </span>
                
                <div className="flex gap-4 items-center flex-1 justify-end">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Received:</span>
                    <input
                      type="number"
                      min="0"
                      value={item.received || ''}
                      onChange={(e) => updateMaterialField(idx, 'received', e.target.value)}
                      placeholder="0"
                      className="w-20 rounded-lg border border-slate-200 bg-white p-1.5 text-center text-xs dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Used:</span>
                    <input
                      type="number"
                      min="0"
                      value={item.used || ''}
                      onChange={(e) => updateMaterialField(idx, 'used', e.target.value)}
                      placeholder="0"
                      className="w-20 rounded-lg border border-slate-200 bg-white p-1.5 text-center text-xs dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Labor attendance section */}
      <div className="border-t border-slate-100 pt-5 dark:border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Hammer size={14} className="text-accent-500" /> Labour Shift Attendance
        </h5>

        <div className="space-y-3">
          {labourList.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-1/4">{item.trade}</span>
              
              <div className="flex gap-4 items-center flex-1 justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Headcount:</span>
                  <input
                    type="number"
                    min="0"
                    value={item.headcount || ''}
                    onChange={(e) => updateLabourField(idx, 'headcount', e.target.value)}
                    placeholder="0"
                    className="w-20 rounded-lg border border-slate-200 bg-white p-1.5 text-center text-xs dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Hrs Worked:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.hoursWorked || ''}
                    onChange={(e) => updateLabourField(idx, 'hoursWorked', e.target.value)}
                    placeholder="0"
                    className="w-20 rounded-lg border border-slate-200 bg-white p-1.5 text-center text-xs dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
                
                {idx > 2 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveLabourTrade(idx)}
                    className="text-rose-500 hover:text-rose-600 p-1"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add custom trade */}
        <div className="flex flex-col sm:flex-row gap-3 items-end p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Custom Trade</label>
            <input
              type="text"
              placeholder="E.g. Welders, Electricians"
              value={customTrade.trade}
              onChange={(e) => setCustomTrade(prev => ({ ...prev, trade: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Headcount</label>
            <input
              type="number"
              placeholder="0"
              value={customTrade.headcount || ''}
              onChange={(e) => setCustomTrade(prev => ({ ...prev, headcount: parseInt(e.target.value) || 0 }))}
              className="w-24 rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Hours</label>
            <input
              type="number"
              placeholder="0"
              value={customTrade.hoursWorked || ''}
              onChange={(e) => setCustomTrade(prev => ({ ...prev, hoursWorked: parseFloat(e.target.value) || 0 }))}
              className="w-24 rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={handleAddLabourTrade}
            className="rounded-lg border border-accent-600 text-accent-600 bg-white px-3 py-2 text-xs font-bold hover:bg-accent-50 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            Add Trade
          </button>
        </div>
      </div>

      {/* Upload photos section */}
      <div className="border-t border-slate-100 pt-5 dark:border-slate-800 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Camera size={16} /> Progress Photos (Max 5)
        </label>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 p-6">
          <div className="text-center space-y-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              id="file-upload"
              className="hidden"
            />
            <label 
              htmlFor="file-upload"
              className="inline-flex cursor-pointer rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Choose Images
            </label>
            <p className="text-[10px] text-slate-400">JPG, PNG, WEBP files up to 5MB.</p>
            {photos.length > 0 && (
              <div className="pt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {photos.length} file(s) selected: {photos.map(p => p.name).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 pt-6 dark:border-slate-800 flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent-600 px-6 py-3 text-sm font-bold text-white hover:bg-accent-700 disabled:opacity-50 hover:shadow-premium hover:shadow-accent-600/15 transition-all"
        >
          {loading ? 'Submitting Log...' : 'Submit Daily Report'}
        </button>
      </div>

    </form>
  );
};

export default ReportForm;
