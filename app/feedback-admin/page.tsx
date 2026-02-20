'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, Trash2, Download, RefreshCw, Home } from 'lucide-react';

interface ClientFeedback {
  id: number;
  name: string;
  email: string;
  rating: number;
  comments: string;
  timestamp: string;
}

export default function FeedbackAdminPage() {
  const [feedback, setFeedback] = useState<ClientFeedback[]>([]);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = () => {
    try {
      const stored = localStorage.getItem('client-feedback');
      if (stored) {
        const data = JSON.parse(stored);
        setFeedback(data.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Failed to load feedback:', error);
    }
  };

  const deleteFeedback = (id: number) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      const updated = feedback.filter(item => item.id !== id);
      setFeedback(updated);
      localStorage.setItem('client-feedback', JSON.stringify(updated.reverse()));
    }
  };

  const exportFeedback = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalFeedback: feedback.length,
      averageRating: feedback.length > 0 ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1) : 0,
      feedback: feedback
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-feedback-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllFeedback = () => {
    if (confirm('Are you sure you want to clear all feedback? This cannot be undone!')) {
      setFeedback([]);
      localStorage.removeItem('client-feedback');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = feedback.length > 0 
    ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-[#8B6F47]" />
              <span>Client Feedback Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Review feedback from clients who viewed your questionnaire
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Link href="/admin-hub">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Admin Hub
              </Button>
            </Link>
            <Button
              onClick={loadFeedback}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={exportFeedback}
              variant="outline"
              size="sm"
              disabled={feedback.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={clearAllFeedback}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              disabled={feedback.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-3xl font-bold text-[#8B6F47] mb-2">{feedback.length}</div>
            <div className="text-sm text-gray-600">Total Feedback</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-3xl font-bold text-yellow-600">{averageRating}</div>
              <div className="flex">
                {renderStars(parseFloat(averageRating))}
              </div>
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {feedback.filter(item => item.rating >= 4).length}
            </div>
            <div className="text-sm text-gray-600">Positive Reviews (4-5 ⭐)</div>
          </Card>
        </div>

        {/* Feedback List */}
        {feedback.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No feedback yet</h3>
            <p className="text-gray-500 mb-4">
              Share the client preview link to start collecting feedback
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <h4 className="font-semibold text-blue-800 mb-2">Share these links:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Local:</strong> http://localhost:3000/client-preview</div>
                <div><strong>Network:</strong> http://100.127.255.148:3000/client-preview</div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {feedback.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#8B6F47] rounded-full flex items-center justify-center text-white font-semibold">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(item.rating)}
                      <span className="text-sm text-gray-600 ml-1">({item.rating}/5)</span>
                    </div>
                    <Button
                      onClick={() => deleteFeedback(item.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{item.comments}</p>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{formatDate(item.timestamp)}</span>
                  <Badge variant={item.rating >= 4 ? "default" : item.rating >= 3 ? "secondary" : "destructive"}>
                    {item.rating >= 4 ? 'Positive' : item.rating >= 3 ? 'Neutral' : 'Negative'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}