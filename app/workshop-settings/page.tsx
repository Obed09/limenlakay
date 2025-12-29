"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Link as LinkIcon, Mail, Save, Plus } from "lucide-react";

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

export default function WorkshopSettingsPage() {
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: "",
    body: "",
  });
  const [sessions, setSessions] = useState<WorkshopSession[]>([]);
  const [newSession, setNewSession] = useState({
    date: "",
    time: "",
    meetingLink: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmailTemplate();
    fetchSessions();
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
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Workshop Settings</h1>

      {/* Email Template Editor */}
      <Card className="mb-8">
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

      {/* Workshop Sessions Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Workshop Sessions
          </CardTitle>
          <CardDescription>
            Manage workshop dates, times, and meeting links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Session */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold">Add New Session</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="session-date">Date</Label>
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
                <Label htmlFor="session-time">Time</Label>
                <Input
                  id="session-time"
                  type="time"
                  value={newSession.time}
                  onChange={(e) =>
                    setNewSession({ ...newSession, time: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="meeting-link">Meeting Link</Label>
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
            </div>
            <Button onClick={addSession}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </div>

          {/* Existing Sessions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Scheduled Sessions</h3>
            {sessions.length === 0 ? (
              <p className="text-gray-500">No sessions scheduled yet</p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">
                        {new Date(session.session_date).toLocaleDateString()} at{" "}
                        {session.session_time}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <LinkIcon className="h-3 w-3" />
                        {session.meeting_link}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {session.current_participants}/{session.max_participants}{" "}
                        participants
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {session.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
