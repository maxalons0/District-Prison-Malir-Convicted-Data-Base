import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onRetry: (message: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading, onRetry }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 left-5 w-full max-w-sm h-[60vh] flex flex-col bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gray-900 border-b border-gray-700 rounded-t-lg flex-shrink-0">
        <h3 className="font-bold text-gray-200">AI Assistant</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          if (msg.role === 'error') {
            return (
              <div key={index} className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-red-900 bg-opacity-50 text-red-200 rounded-bl-none">
                  <p className="text-sm">{msg.text}</p>
                  {msg.originalUserMessage && (
                    <button
                      onClick={() => onRetry(msg.originalUserMessage!)}
                      className="mt-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          );
        })}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-700 text-gray-200 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 bg-gray-900 rounded-b-lg flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-grow bg-gray-700 border-gray-600 rounded-full p-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;