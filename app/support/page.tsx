'use client';

import { useState } from 'react';
import { Mail, Phone, MessageCircle, X, ChevronRight, Headphones, Clock, CheckCircle } from 'lucide-react';
import ChatSupport from '@/components/ChatSupport';

export default function SupportPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const supportOptions = [
    {
      id: 'email',
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      value: 'support@madsha.com',
      description: 'Get response within 24 hours',
      action: () => window.location.href = 'mailto:support@madsha.com'
    },
    {
      id: 'phone',
      icon: <Phone className="w-6 h-6" />,
      title: 'Customer Care',
      value: '+91 98765 43210',
      description: 'Available 24/7 for urgent help',
      action: () => window.location.href = 'tel:+919876543210'
    },
    {
      id: 'chat',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      value: 'Chat with Tom',
      description: 'Instant response • AI-powered',
      action: () => setShowChat(true)
    }
  ];

  const getDetailsContent = (optionId: string) => {
    switch(optionId) {
      case 'email':
        return {
          title: '📧 Email Support',
          message: 'Our email support team is here to help you with any queries. Please expect a response within 24 hours. For faster assistance, we recommend using our chat support first.',
          tips: [
            'Include your order ID for faster resolution',
            'Describe your issue in detail',
            'Attach relevant screenshots if any'
          ]
        };
      case 'phone':
        return {
          title: '📞 Customer Care',
          message: 'This number is dedicated to your support. However, we strongly recommend using our chat support first for faster resolution. Our AI assistant Tom can help you instantly with common issues.',
          tips: [
            'Chat support is available 24/7',
            'Most issues resolved within minutes',
            'Save time by trying chat first'
          ]
        };
      case 'chat':
        return {
          title: '💬 Live Chat Support',
          message: 'Connect with Tom, our AI support assistant. He can help you with password reset, account issues, and general queries instantly. For complex issues, our human team is just a transfer away.',
          tips: [
            'Instant response • No waiting',
            'Available 24/7 • Always online',
            'Can handle multiple languages including Hinglish'
          ]
        };
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center gap-3 mb-4">
              <Headphones className="w-10 h-10" />
              <h1 className="text-4xl font-bold">24/7 Support Center</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl">
              We're here to help you anytime, anywhere. Choose your preferred support option below.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Options */}
            <div className="lg:w-1/3 space-y-4">
              <h2 className="text-2xl font-semibold mb-6">How can we help?</h2>
              
              {supportOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedOption(option.id);
                    if (option.id === 'chat') {
                      setShowChat(true);
                    }
                  }}
                  className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-102 hover:shadow-xl ${
                    selectedOption === option.id 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative bg-white p-6 group-hover:text-white transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        selectedOption === option.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-white/20 group-hover:text-white'
                      }`}>
                        {option.icon}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-lg mb-1">{option.title}</h3>
                        <p className={`text-sm mb-2 ${
                          selectedOption === option.id
                            ? 'text-blue-600'
                            : 'text-gray-500 group-hover:text-white/80'
                        }`}>
                          {option.value}
                        </p>
                        <p className={`text-xs ${
                          selectedOption === option.id
                            ? 'text-gray-500'
                            : 'text-gray-400 group-hover:text-white/60'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                      
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                        selectedOption === option.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Side - Details Panel */}
            <div className="lg:w-2/3">
              {selectedOption ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
                  {(() => {
                    const details = getDetailsContent(selectedOption);
                    if (!details) return null;
                    
                    return (
                      <>
                        <div className="flex items-start justify-between mb-6">
                          <h2 className="text-2xl font-bold text-gray-800">{details.title}</h2>
                          <button
                            onClick={() => setSelectedOption(null)}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        <div className="prose max-w-none">
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <p className="text-gray-700 leading-relaxed">
                              {details.message}
                            </p>
                          </div>

                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Quick Tips:
                          </h3>
                          
                          <ul className="space-y-2 mb-6">
                            {details.tips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-2 text-gray-600">
                                <span className="text-blue-500 font-bold">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>

                          <div className="flex gap-4 mt-8">
                            {selectedOption === 'email' && (
                              <button
                                onClick={() => window.location.href = 'mailto:support@madsha.com'}
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
                              >
                                Send Email Now
                              </button>
                            )}
                            
                            {selectedOption === 'phone' && (
                              <button
                                onClick={() => window.location.href = 'tel:+919876543210'}
                                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition transform hover:scale-105"
                              >
                                Call Now
                              </button>
                            )}
                            
                            {selectedOption === 'chat' && (
                              <button
                                onClick={() => setShowChat(true)}
                                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition transform hover:scale-105"
                              >
                                Start Chat with Tom
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Headphones className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    Select an Option
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Click on any support option on the left to see detailed information and get immediate assistance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Support Component */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-50">
          <ChatSupport onClose={() => setShowChat(false)} />
        </div>
      )}
    </>
  );
}