import React, { useState, useEffect } from 'react';
import { X, Send, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TelegramAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramAlertModal: React.FC<TelegramAlertModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setChatId(user.telegram_chat_id || '');
      setEnabled(user.telegram_alerts_enabled ?? true);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await api.put('/auth/telegram-settings', {
        telegram_chat_id: chatId.trim(),
        telegram_alerts_enabled: enabled
      });
      setStatusMessage({ type: 'success', text: 'Telegram alert settings updated!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestAlert = async () => {
    setIsTesting(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/notifications/trigger-telegram-test');
      if (res.data.delivered) {
        setStatusMessage({
          type: 'success',
          text: `Test Alert Sent! Expired: ${res.data.expired_count}, Expiring: ${res.data.expiring_count}`
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Dev Mode Logged: Alert preview generated in backend console.`
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to dispatch test notification.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-base font-bold">Telegram Expiry Alerts</h2>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Instructions Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>⚡ Setup Instructions (1 Minute)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Open Telegram and search for <strong>@userinfobot</strong> or <strong>@BotFather</strong></li>
              <li>Copy your numeric <strong>Chat ID</strong> (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">123456789</code>)</li>
              <li>Paste your Chat ID below and click <strong>Test Telegram Alert</strong>!</li>
            </ol>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 font-medium ${
              statusMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Chat ID</label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. 987654321"
                className="w-full px-3.5 py-2.5 rounded-md app-input text-sm font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-800">Enable Daily Expiry Alerts</span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>

              <button
                type="button"
                onClick={handleSendTestAlert}
                disabled={isTesting}
                className="flex-1 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Sending...' : 'Send Test Alert'}</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
