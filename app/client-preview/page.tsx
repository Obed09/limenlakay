'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import BulkOrderQuestionnaire from '@/components/bulk-order-questionnaire';
import { Send, MessageSquare, Star, Eye } from 'lucide-react';

export default function ClientPreviewPage() {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 0,
    comments: '',
    submitted: false
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store feedback in localStorage for admin to review
    const existingFeedback = JSON.parse(localStorage.getItem('client-feedback') || '[]');
    const newFeedback = {
      ...feedback,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    existingFeedback.push(newFeedback);
    localStorage.setItem('client-feedback', JSON.stringify(existingFeedback));
    
    setFeedback(prev => ({ ...prev, submitted: true }));
  };

  const handleStarClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  return (
    <div className="min-h-screen bg-[#f9f5f0]">
      {/* Header for Client */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="h-8 w-8 text-[#8B6F47]" />
            <div>
              <h1 className="text-2xl font-bold text-[#5D4037]">
                Client Preview - Limen Lakay Bulk Order Questionnaire
              </h1>
              <p className="text-gray-600">
                Please review this questionnaire and provide your feedback below
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions for Review:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Review the form below</strong> - this is how clients will see your questionnaire</li>
              <li>• <strong>Test the functionality</strong> - try uploading images, filling fields, etc.</li>
              <li>• <strong>Check the vessel options</strong> - make sure all container styles look correct</li>
              <li>• <strong>Provide feedback</strong> - use the feedback form at the bottom</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The Actual Questionnaire */}
      <div className="py-8">
        <BulkOrderQuestionnaire />
      </div>

      {/* Feedback Section */}
      <div className="bg-white border-t border-gray-200 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 border-[#8B6F47] shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <MessageSquare className="h-6 w-6 text-[#8B6F47]" />
              <h2 className="text-xl font-semibold text-[#5D4037]">
                📝 Client Feedback Form
              </h2>
            </div>

            {feedback.submitted ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h3>
                <p className="text-green-700">
                  Your feedback has been submitted successfully. The admin will review your comments.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name:</label>
                    <Input
                      value={feedback.name}
                      onChange={(e) => setFeedback(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email:</label>
                    <Input
                      type="email"
                      value={feedback.email}
                      onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Overall Rating:
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        className={`text-2xl ${
                          star <= feedback.rating 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({feedback.rating}/5 stars)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Comments & Suggestions:
                  </label>
                  <Textarea
                    value={feedback.comments}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Please share your thoughts on the questionnaire design, usability, missing features, etc."
                    rows={6}
                    className="resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#8B6F47] hover:bg-[#6D4C41] text-white py-3 text-lg"
                  disabled={!feedback.rating}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Submit Feedback
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#8B6F47] text-white p-6 text-center">
        <p className="text-sm">
          Limen Lakay LLC - Handmade Eco-Friendly Candles
        </p>
        <p className="text-xs opacity-75 mt-1">
          This is a preview version for client feedback
        </p>
      </div>
    </div>
  );
}