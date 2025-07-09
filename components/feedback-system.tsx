"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Bug, TestTube, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FeedbackData {
  type: "feedback" | "bug" | "ab-test"
  title: string
  description: string
  category?: string
  severity?: "low" | "medium" | "high" | "critical"
  userAgent?: string
  timestamp: string
  userId?: string
}

interface ABTestVariant {
  id: string
  name: string
  description: string
  isActive: boolean
  metrics: {
    impressions: number
    conversions: number
    avgWpm: number
    avgAccuracy: number
  }
}

export default function FeedbackSystem() {
  const [activeTab, setActiveTab] = useState("feedback")
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([])
  const [abTests, setAbTests] = useState<ABTestVariant[]>([
    {
      id: "variant-a",
      name: "Control (Current)",
      description: "Current interface design",
      isActive: true,
      metrics: { impressions: 150, conversions: 45, avgWpm: 65, avgAccuracy: 92 }
    },
    {
      id: "variant-b", 
      name: "New Design",
      description: "Updated interface with improved UX",
      isActive: true,
      metrics: { impressions: 142, conversions: 52, avgWpm: 68, avgAccuracy: 94 }
    }
  ])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    severity: "medium" as const
  })

  const handleSubmit = async (type: "feedback" | "bug" | "ab-test") => {
    const newEntry: FeedbackData = {
      type,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      severity: formData.severity,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: "user-" + Math.random().toString(36).substr(2, 9)
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      })

      if (response.ok) {
        setFeedbackData(prev => [newEntry, ...prev])
        setFormData({ title: "", description: "", category: "", severity: "medium" })
        
        toast({
          title: "Thank you!",
          description: type === "feedback" ? "Your feedback has been submitted." : 
                       type === "bug" ? "Bug report submitted successfully." :
                       "A/B test data recorded.",
        })
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    }
  }

  const calculateConversionRate = (variant: ABTestVariant) => {
    return variant.metrics.impressions > 0 
      ? ((variant.metrics.conversions / variant.metrics.impressions) * 100).toFixed(1)
      : "0"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "critical": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testing & Quality System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="bugs" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Bug Reports
              </TabsTrigger>
              <TabsTrigger value="ab-testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                A/B Testing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="feedback-title">Title</Label>
                  <Input
                    id="feedback-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of your feedback"
                  />
                </div>
                <div>
                  <Label htmlFor="feedback-category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ui-ux">UI/UX</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feedback-description">Description</Label>
                  <Textarea
                    id="feedback-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please provide detailed feedback..."
                    rows={4}
                  />
                </div>
                <Button onClick={() => handleSubmit("feedback")} disabled={!formData.title || !formData.description}>
                  Submit Feedback
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bugs" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="bug-title">Bug Title</Label>
                  <Input
                    id="bug-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the bug"
                  />
                </div>
                <div>
                  <Label htmlFor="bug-severity">Severity</Label>
                  <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bug-description">Bug Description</Label>
                  <Textarea
                    id="bug-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Steps to reproduce, expected vs actual behavior..."
                    rows={4}
                  />
                </div>
                <Button onClick={() => handleSubmit("bug")} disabled={!formData.title || !formData.description}>
                  Report Bug
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ab-testing" className="space-y-4">
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  A/B testing is currently active. Your interactions help us improve the user experience.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Active Tests</h3>
                {abTests.map((variant) => (
                  <Card key={variant.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{variant.name}</CardTitle>
                        <Badge variant={variant.isActive ? "default" : "secondary"}>
                          {variant.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{variant.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Impressions:</span> {variant.metrics.impressions}
                        </div>
                        <div>
                          <span className="font-medium">Conversions:</span> {variant.metrics.conversions}
                        </div>
                        <div>
                          <span className="font-medium">Conversion Rate:</span> {calculateConversionRate(variant)}%
                        </div>
                        <div>
                          <span className="font-medium">Avg WPM:</span> {variant.metrics.avgWpm}
                        </div>
                        <div>
                          <span className="font-medium">Avg Accuracy:</span> {variant.metrics.avgAccuracy}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      {feedbackData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackData.slice(0, 5).map((entry, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {entry.type === "feedback" && <MessageSquare className="h-4 w-4 text-blue-500" />}
                      {entry.type === "bug" && <Bug className="h-4 w-4 text-red-500" />}
                      {entry.type === "ab-test" && <TestTube className="h-4 w-4 text-green-500" />}
                      <span className="font-medium">{entry.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.severity && (
                        <Badge className={getSeverityColor(entry.severity)}>
                          {entry.severity}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                  {entry.category && (
                    <Badge variant="outline" className="mt-2">
                      {entry.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 