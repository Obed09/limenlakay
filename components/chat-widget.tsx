'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { submitFeedback, trackOrder, getOrderStatusHistory } from "@/lib/chat-widget-utils";

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatTab = 'chat' | 'feedback' | 'tracking';

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  const [message, setMessage] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    name: '',
    email: ''
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: 'Hello! Welcome to Limen Lakay. How can we help you today? 🕯️',
      time: new Date().toLocaleTimeString()
    }
  ]);

  // Generate a session ID for this chat
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: message,
        time: new Date().toLocaleTimeString()
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Auto-reply after 2 seconds
      setTimeout(() => {
        const replies = [
          'Thank you for your message! Our artisan team will get back to you within 24 hours.',
          'We appreciate you reaching out! Someone from our candle crafting team will respond soon.',
          'Your message is important to us! We will respond within one business day.',
          'Thanks for contacting Limen Lakay! Our team will be in touch shortly.'
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const reply = {
          id: messages.length + 2,
          sender: 'support',
          text: randomReply,
          time: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  };

  const handleTrackingSubmit = async () => {
    if (trackingNumber.trim()) {
      setIsTracking(true);
      try {
        const result = await trackOrder(trackingNumber);
        if (result.success) {
          setTrackingResult(result.data);
          
          // Get status history
          const historyResult = await getOrderStatusHistory(trackingNumber);
          if (historyResult.success) {
            setTrackingResult((prev: any) => ({
              ...prev,
              statusHistory: historyResult.data
            }));
          }
        } else {
          setTrackingResult({ error: 'Order not found. Please check your tracking number.' });
        }
      } catch (error) {
        setTrackingResult({ error: 'Unable to track order at this time. Please try again later.' });
      }
      setIsTracking(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedback.rating > 0 && feedback.comment) {
      setIsSubmittingFeedback(true);
      try {
        const result = await submitFeedback({
          customer_name: feedback.name || undefined,
          customer_email: feedback.email || undefined,
          rating: feedback.rating,
          comment: feedback.comment
        });

        if (result.success) {
          setFeedbackMessage('Thank you for your feedback! We truly appreciate your input and will use it to improve our candles and service.');
          setFeedback({
            rating: 0,
            comment: '',
            name: '',
            email: ''
          });
        } else {
          setFeedbackMessage('There was an issue submitting your feedback. Please try again or contact us directly.');
        }
      } catch (error) {
        setFeedbackMessage('Unable to submit feedback at this time. Please try again later.');
      }
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_production': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'quality_check': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-amber-200 dark:border-amber-800">
        <CardHeader className="bg-amber-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Limen Lakay Support</CardTitle>
              <CardDescription className="text-amber-100">
                We're here to help! 🕯️
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-amber-700"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'chat'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50 dark:bg-amber-950'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'tracking'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50 dark:bg-amber-950'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            📦 Track Order
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'feedback'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50 dark:bg-amber-950'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            ⭐ Feedback
          </button>
        </div>

        <CardContent className="p-4 h-80 overflow-hidden flex flex-col">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-amber-600 hover:bg-amber-700">
                  Send
                </Button>
              </div>
            </div>
          )}

          {/* Order Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Track Your Order
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter your tracking number to see your order status
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., LL-2024-001"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleTrackingSubmit}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={isTracking}
                >
                  {isTracking ? 'Tracking...' : 'Track Order'}
                </Button>
              </div>

              {trackingResult && (
                <div className="mt-4">
                  {trackingResult.error ? (
                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {trackingResult.error}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Order {trackingResult.tracking_number}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                          <Badge className={getStatusColor(trackingResult.order_status)}>
                            {formatStatus(trackingResult.order_status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Customer:</span>
                          <span className="text-sm font-medium">{trackingResult.customer_name}</span>
                        </div>
                        {trackingResult.estimated_completion && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Est. Completion:</span>
                            <span className="text-sm font-medium">
                              {new Date(trackingResult.estimated_completion).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {trackingResult.status_message && (
                          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              {trackingResult.status_message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!trackingResult && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Need help finding your tracking number?
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Check your order confirmation email or contact us using the chat feature.
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Try: LL-2024-001, LL-2024-002, or LL-2024-003 for demo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Share Your Feedback
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  We would love to hear about your Limen Lakay experience
                </p>
              </div>

              {feedbackMessage && (
                <div className={`p-3 rounded-lg ${
                  feedbackMessage.includes('Thank you') 
                    ? 'bg-green-50 dark:bg-green-950/20' 
                    : 'bg-red-50 dark:bg-red-950/20'
                }`}>
                  <p className={`text-sm ${
                    feedbackMessage.includes('Thank you')
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {feedbackMessage}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label>How would you rate your experience?</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedback({...feedback, rating: star})}
                        className={`text-2xl transition-colors ${
                          star <= feedback.rating
                            ? 'text-amber-500'
                            : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment">Your Comments</Label>
                  <textarea
                    id="comment"
                    value={feedback.comment}
                    onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                    placeholder="Tell us about your experience with our candles..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 mt-1 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="feedbackName">Name (optional)</Label>
                    <Input
                      id="feedbackName"
                      value={feedback.name}
                      onChange={(e) => setFeedback({...feedback, name: e.target.value})}
                      placeholder="Your name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedbackEmail">Email (optional)</Label>
                    <Input
                      id="feedbackEmail"
                      type="email"
                      value={feedback.email}
                      onChange={(e) => setFeedback({...feedback, email: e.target.value})}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleFeedbackSubmit}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={feedback.rating === 0 || !feedback.comment || isSubmittingFeedback}
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}