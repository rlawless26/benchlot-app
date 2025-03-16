import React, { useState } from 'react';
import { X, Send, Loader, AlertCircle, Check } from 'lucide-react';
import { sendMessage } from '../supabaseClient';

const MessageModal = ({ isOpen, onClose, recipient, toolId, toolName }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setSending(true);
    setError(null);
    
    try {
      const { error } = await sendMessage(recipient.id, message, toolId);
      
      if (error) throw error;
      
      setSuccess(true);
      setMessage('');
      
      // Close the modal after a delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            Message {recipient.username || recipient.full_name || 'Seller'}
          </h3>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {toolName && (
          <div className="px-4 py-3 bg-stone-50 border-b">
            <p className="text-sm text-stone-600">
              Regarding: <span className="font-medium text-stone-800">{toolName}</span>
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-start">
              <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Message sent successfully!</span>
            </div>
          )}
          
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-3 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700 min-h-32 resize-none"
              disabled={sending || success}
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!message.trim() || sending || success}
              className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 disabled:opacity-50 flex items-center"
            >
              {sending ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;