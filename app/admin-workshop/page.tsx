"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Mail,
  Phone,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  Link as LinkIcon,
  Users,
  Video
} from "lucide-react";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  workshop_date: string;
  package_type: string;
  package_price: number;
  status: string;
  payment_status: string;
  created_at: string;
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

interface EmailTemplate {
  subject: string;
  body: string;
}

export default function UnifiedWorkshopAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<WorkshopSession[]>([]);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  
  const [newSession, setNewSession] = useState({
    date: "",
    time: "",
    meetingLink: "",
    maxParticipants: 12,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchBookings(),
      fetchSessions(),
      fetchEmailTemplate(),
    ]);
    setLoading(false);
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/workshop-booking/admin");
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
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
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/workshop-booking/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      if (response.ok) {
        fetchBookings();
        alert(`Booking ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
      alert("Failed to update booking status");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_date: newSession.date,
          session_time: newSession.time,
          meeting_link: newSession.meetingLink,
          max_participants: newSession.maxParticipants,
        }),
      });

      if (response.ok) {
        alert("Session added successfully! It will now appear on the subscription page.");
        setNewSession({ date: "", time: "", meetingLink: "", maxParticipants: 12 });
        fetchSessions();
      } else {
        alert("Failed to add session");
      }
    } catch (error) {
      console.error("Failed to add session:", error);
      alert("Failed to add session");
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const response = await fetch(`/api/workshop-booking/sessions?id=${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Session deleted successfully!");
        fetchSessions();
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session");
    }
  };

  const saveEmailTemplate = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/workshop-booking/email-template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === "all" || booking.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      confirmed: { variant: "default" as const, label: "Confirmed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
      completed: { variant: "default" as const, label: "Completed" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    pending: bookings.filter(b => b.status === "pending").length,
    revenue: bookings
      .filter(b => b.status === "confirmed")
      .reduce((sum, b) => sum + b.package_price, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 p-8">
        <div className="container mx-auto">
          <p className="text-center text-lg">Loading workshop management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            Workshop Management Center
          </h1>
          <p className="text-muted-foreground">
            Complete control over sessions, bookings, payments, and email automation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.confirmed}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900">
                ${stats.revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">
              <Calendar className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Users className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* SESSIONS TAB */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Workshop Session</CardTitle>
                <CardDescription>
                  Create available time slots that will automatically appear on the subscription page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-date">Workshop Date *</Label>
                    <Input
                      id="session-date"
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-time">Workshop Time *</Label>
                    <Input
                      id="session-time"
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meeting-link">Zoom/Meet Link *</Label>
                    <Input
                      id="meeting-link"
                      type="url"
                      value={newSession.meetingLink}
                      onChange={(e) => setNewSession({ ...newSession, meetingLink: e.target.value })}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-participants">Max Participants</Label>
                    <Input
                      id="max-participants"
                      type="number"
                      value={newSession.maxParticipants}
                      onChange={(e) => setNewSession({ ...newSession, maxParticipants: parseInt(e.target.value) })}
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
                <Button onClick={addSession} className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Session to Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Scheduled Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Sessions ({sessions.length})</CardTitle>
                <CardDescription>
                  These dates and times will appear in the booking form dropdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No sessions scheduled yet. Add your first session above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-semibold">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            {new Date(session.session_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.session_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {session.current_participants}/{session.max_participants} enrolled
                            </span>
                            <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                            <Video className="w-3 h-3" />
                            <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {session.meeting_link}
                            </a>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BOOKINGS TAB */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Management</CardTitle>
                <CardDescription>View and manage all workshop subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["all", "pending", "confirmed", "cancelled"].map((status) => (
                        <Button
                          key={status}
                          variant={filterStatus === status ? "default" : "outline"}
                          onClick={() => setFilterStatus(status)}
                          size="sm"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bookings List */}
                  {filteredBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No bookings found</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{booking.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                ${booking.package_price} - {booking.package_type}
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <a href={`mailto:${booking.email}`} className="hover:underline">
                                {booking.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.workshop_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>Booked: {new Date(booking.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {booking.status === "pending" && (
                            <div className="flex gap-2 pt-3 border-t">
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, "cancelled")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMAIL TAB */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Email Template</CardTitle>
                <CardDescription>
                  Customize the thank you email sent automatically to subscribers.
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
                    onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                    placeholder="Your Concrete Creations Workshop Access"
                  />
                </div>

                <div>
                  <Label htmlFor="email-body">Email Body</Label>
                  <Textarea
                    id="email-body"
                    value={emailTemplate.body}
                    onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
                    rows={14}
                    placeholder="Hi {name},&#10;&#10;Thank you for subscribing..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: Use {"{name}"} for subscriber name, {"{date}"} for workshop date, {"{time}"} for session time, and {"{link}"} for Zoom/Meet link
                  </p>
                </div>

                <Button onClick={saveEmailTemplate} disabled={saving} className="w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Email Template"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENTS TAB */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Overview</CardTitle>
                <CardDescription>Track payments and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-700 mb-1">Confirmed Revenue</div>
                      <div className="text-2xl font-bold text-green-900">
                        ${bookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + b.package_price, 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <div className="text-sm text-amber-700 mb-1">Pending Revenue</div>
                      <div className="text-2xl font-bold text-amber-900">
                        ${bookings.filter(b => b.status === "pending").reduce((sum, b) => sum + b.package_price, 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700 mb-1">Average Booking</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${bookings.length > 0 ? (bookings.reduce((sum, b) => sum + b.package_price, 0) / bookings.length).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Recent Transactions</h3>
                    {bookings.slice(0, 10).map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{booking.name}</div>
                          <div className="text-sm text-muted-foreground">{booking.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${booking.package_price}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
