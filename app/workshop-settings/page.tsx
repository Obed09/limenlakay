"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Link as LinkIcon, Mail, Save, Plus, Users, DollarSign } from "lucide-react";

interface EmailTemplate {
  subject: string;
  body: string;
}

interface WorkshopSession {
  id: string;
  session_date: string;
  session_time: string;
  meeting_link: string;
  max_participants: number;
  current_participants: number;
  status: string;
}

interface WorkshopBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  workshop_date: string;
  package_type: string;
  package_price: number;
  status: string;
  created_at: string;
}

export default function WorkshopSettingsPage() {
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: "",
    body: "",
  });
  const [sessions, setSessions] = useState<WorkshopSession[]>([]);
  const [bookings, setBookings] = useState<WorkshopBooking[]>([]);
  const [newSession, setNewSession] = useState({
    date: "",
    time: "",
    meetingLink: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'bookings' | 'email' | 'payments'>('sessions');

  useEffect(() => {
    fetchEmailTemplate();
    fetchSessions();
    fetchBookings();
  }, []);

  const fetchEmailTemplate = async () => {
    try {
      const response = await fetch("/api/workshop-booking/email-template");
      const data = await response.json();
      if (data.template) {
        setEmailTemplate({
          subject: data.template.subject,
          body: data.template.body,
        });
      }
    } catch (error) {
      console.error("Failed to fetch email template:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/workshop-booking/sessions");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/workshop-booking/all-bookings");
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.package_price || 0), 0);

  const saveEmailTemplate = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/workshop-booking/email-template", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: emailTemplate.subject,
          body: emailTemplate.body,
        }),
      });

      if (response.ok) {
        alert("Email template saved successfully!");
      } else {
        alert("Failed to save email template");
      }
    } catch (error) {
      console.error("Failed to save email template:", error);
      alert("Failed to save email template");
    } finally {
      setSaving(false);
    }
  };

  const addSession = async () => {
    if (!newSession.date || !newSession.time || !newSession.meetingLink) {
      alert("Please fill in all session fields");
      return;
    }

    try {
      const response = await fetch("/api/workshop-booking/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_date: newSession.date,
          session_time: newSession.time,
          meeting_link: newSession.meetingLink,
        }),
      });

      if (response.ok) {
        alert("Session added successfully!");
        setNewSession({ date: "", time: "", meetingLink: "" });
        fetchSessions();
      } else {
        alert("Failed to add session");
      }
    } catch (error) {
      console.error("Failed to add session:", error);
      alert("Failed to add session");
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2">Workshop Management Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Complete control over sessions, bookings, payments, and email automation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">{totalBookings}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{confirmedBookings}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{pendingBookings}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl text-amber-700">${totalRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'sessions' 
              ? 'border-b-2 border-amber-600 text-amber-600' 
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          <Calendar className="inline w-5 h-5 mr-2" />
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'bookings' 
              ? 'border-b-2 border-amber-600 text-amber-600' 
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          <Users className="inline w-5 h-5 mr-2" />
          Bookings
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'email' 
              ? 'border-b-2 border-amber-600 text-amber-600' 
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          <Mail className="inline w-5 h-5 mr-2" />
          Email
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'payments' 
              ? 'border-b-2 border-amber-600 text-amber-600' 
              : 'text-gray-600 hover:text-amber-600'
          }`}
        >
          <DollarSign className="inline w-5 h-5 mr-2" />
          Payments
        </button>
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Workshop Sessions
            </CardTitle>
            <CardDescription>
              Create available time slots that will automatically appear on the subscription page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Session */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold">Add New Workshop Session</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-date">Workshop Date *</Label>
                  <Input
                    id="session-date"
                    type="date"
                    value={newSession.date}
                    onChange={(e) =>
                      setNewSession({ ...newSession, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="session-time">Workshop Time *</Label>
                  <Input
                    id="session-time"
                    type="time"
                    value={newSession.time}
                    onChange={(e) =>
                      setNewSession({ ...newSession, time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="meeting-link">Zoom/Meet Link *</Label>
                <Input
                  id="meeting-link"
                  type="url"
                  value={newSession.meetingLink}
                  onChange={(e) =>
                    setNewSession({ ...newSession, meetingLink: e.target.value })
                  }
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded text-sm">
                <strong>Max Participants:</strong> 12 (default)
              </div>
              <Button onClick={addSession} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Session to Calendar
              </Button>
            </div>

            {/* Existing Sessions */}
            <div className="space-y-4">
              <h3 className="font-semibold">Scheduled Sessions ({sessions.length})</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">These dates and times will appear in the booking form dropdown</p>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sessions scheduled yet</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-lg">
                          {new Date(session.session_date).toLocaleDateString()} at{" "}
                          {session.session_time}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <LinkIcon className="h-3 w-3" />
                          {session.meeting_link}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <Users className="inline w-3 h-3 mr-1" />
                          {session.current_participants || 0}/{session.max_participants} participants
                        </div>
                      </div>
                      <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                        session.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {session.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <Card>
          <CardHeader>
            <CardTitle>Workshop Bookings</CardTitle>
            <CardDescription>View all customer bookings and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No bookings yet</p>
                <p className="text-sm text-gray-400 mt-2">Bookings will appear here when customers sign up</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{booking.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{booking.email}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{booking.phone}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Workshop Date:</span>
                        <p className="font-medium">{new Date(booking.workshop_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Package:</span>
                        <p className="font-medium">{booking.package_type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <p className="font-medium">${booking.package_price}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Booked:</span>
                        <p className="font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Template Editor
            </CardTitle>
            <CardDescription>
              Customize the automated thank you email sent to workshop subscribers.
              <br />
              Available variables: {"{name}"}, {"{date}"}, {"{time}"}, {"{link}"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Subject Line</Label>
              <Input
                id="email-subject"
                value={emailTemplate.subject}
                onChange={(e) =>
                  setEmailTemplate({ ...emailTemplate, subject: e.target.value })
                }
                placeholder="Your Concrete Creations Workshop Access"
              />
            </div>

            <div>
              <Label htmlFor="email-body">Email Body</Label>
              <Textarea
                id="email-body"
                value={emailTemplate.body}
                onChange={(e) =>
                  setEmailTemplate({ ...emailTemplate, body: e.target.value })
                }
                rows={12}
                placeholder="Hi {name},&#10;&#10;Thank you for subscribing..."
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={saveEmailTemplate} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Email Template"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View workshop payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'confirmed').length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No payments yet</p>
                </div>
              ) : (
                bookings.filter(b => b.status === 'confirmed').map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{booking.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${booking.package_price}</p>
                        <p className="text-sm text-gray-500">{booking.package_type}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
