import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { sendMessage } from '../supabaseClient';

const MessageBanner = ({ recipient, onMessageSent }) => {
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setSending(true);
    setError(null);
    
    try {
      // Create a temporary message object for optimistic UI update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: message,
        recipient_id: recipient.id,
        created_at: new Date().toISOString()
      };
      
      // Call the callback with the temporary message (if provided)
      if (typeof onMessageSent === 'function') {
        onMessageSent(tempMessage);
      }
      
      // Clear the message input immediately for better UX
      setMessage('');
      
      // Send the actual message to the server
      const { data, error } = await sendMessage(recipient.id, message);
      
      if (error) throw error;
      
      // If the callback exists and we have real data, update with the real message
      if (typeof onMessageSent === 'function' && data) {
        onMessageSent(data, tempMessage.id);
      }
      
      // Show success message
      setSuccess(true);
      
      // Hide the input after successful send
      setTimeout(() => {
        setShowMessageInput(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Restore the message in the input field if there's an error
      setMessage(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4">
      {showMessageInput ? (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Send a message to {recipient.username || recipient.full_name || 'this user'}</h3>
            <button
              onClick={() => setShowMessageInput(false)}
              className="text-stone-500 hover:text-stone-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {error && (
            <div className="mb-3 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-3 bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm">
              Message sent successfully!
            </div>
          )}
          
          <form onSubmit={handleSendMessage}>
            <div className="mb-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:border-forest-700 resize-none"
                rows="3"
                required
                disabled={sending || success}
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800 flex items-center"
                disabled={!message.trim() || sending || success}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowMessageInput(true)}
          className="w-full py-2 bg-white border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 flex items-center justify-center gap-2"
        >
          <MessageSquare className="h-5 w-5" />
          Message
        </button>
      )}
    </div>
  );
};

export default MessageBanner;