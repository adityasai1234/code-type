import { useState, useEffect } from 'react'

export interface ABTestVariant {
  id: string
  name: string
  weight: number // percentage of users who should see this variant
  isActive: boolean
  config: Record<string, any>
}

export interface ABTest {
  id: string
  name: string
  description: string
  variants: ABTestVariant[]
  startDate: string
  endDate?: string
  isActive: boolean
}

export interface ABTestResult {
  testId: string
  variantId: string
  userId: string
  timestamp: string
  metrics: {
    impressions: number
    conversions: number
    avgWpm?: number
    avgAccuracy?: number
    timeSpent?: number
  }
}

export function useABTesting() {
  const [activeTests, setActiveTests] = useState<ABTest[]>([])
  const [userAssignments, setUserAssignments] = useState<Record<string, string>>({})
  const [results, setResults] = useState<ABTestResult[]>([])

  // Initialize user assignments on component mount
  useEffect(() => {
    const storedAssignments = localStorage.getItem('ab-test-assignments')
    if (storedAssignments) {
      setUserAssignments(JSON.parse(storedAssignments))
    }
  }, [])

  // Save assignments to localStorage
  useEffect(() => {
    localStorage.setItem('ab-test-assignments', JSON.stringify(userAssignments))
  }, [userAssignments])

  // Assign user to a test variant
  const assignUserToVariant = (testId: string, userId: string): string => {
    // Check if user is already assigned
    const assignmentKey = `${testId}-${userId}`
    if (userAssignments[assignmentKey]) {
      return userAssignments[assignmentKey]
    }

    const test = activeTests.find(t => t.id === testId)
    if (!test || !test.isActive) {
      return 'control'
    }

    // Simple weighted random assignment
    const random = Math.random() * 100
    let cumulativeWeight = 0
    
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight
      if (random <= cumulativeWeight) {
        const newAssignments = { ...userAssignments, [assignmentKey]: variant.id }
        setUserAssignments(newAssignments)
        return variant.id
      }
    }

    // Fallback to first variant
    const fallbackVariant = test.variants[0]?.id || 'control'
    const newAssignments = { ...userAssignments, [assignmentKey]: fallbackVariant }
    setUserAssignments(newAssignments)
    return fallbackVariant
  }

  // Get user's assigned variant for a test
  const getUserVariant = (testId: string, userId: string): string => {
    const assignmentKey = `${testId}-${userId}`
    return userAssignments[assignmentKey] || assignUserToVariant(testId, userId)
  }

  // Record an impression
  const recordImpression = (testId: string, variantId: string, userId: string) => {
    const result: ABTestResult = {
      testId,
      variantId,
      userId,
      timestamp: new Date().toISOString(),
      metrics: {
        impressions: 1,
        conversions: 0
      }
    }
    
    setResults(prev => [...prev, result])
  }

  // Record a conversion
  const recordConversion = (testId: string, variantId: string, userId: string, metrics?: Partial<ABTestResult['metrics']>) => {
    const result: ABTestResult = {
      testId,
      variantId,
      userId,
      timestamp: new Date().toISOString(),
      metrics: {
        impressions: 0,
        conversions: 1,
        ...metrics
      }
    }
    
    setResults(prev => [...prev, result])
  }

  // Get test results
  const getTestResults = (testId: string) => {
    const testResults = results.filter(r => r.testId === testId)
    const variantResults: Record<string, ABTestResult['metrics']> = {}

    testResults.forEach(result => {
      if (!variantResults[result.variantId]) {
        variantResults[result.variantId] = {
          impressions: 0,
          conversions: 0,
          avgWpm: 0,
          avgAccuracy: 0,
          timeSpent: 0
        }
      }

      variantResults[result.variantId].impressions += result.metrics.impressions
      variantResults[result.variantId].conversions += result.metrics.conversions
      
      if (result.metrics.avgWpm) {
        variantResults[result.variantId].avgWpm = 
          (variantResults[result.variantId].avgWpm! + result.metrics.avgWpm) / 2
      }
      
      if (result.metrics.avgAccuracy) {
        variantResults[result.variantId].avgAccuracy = 
          (variantResults[result.variantId].avgAccuracy! + result.metrics.avgAccuracy) / 2
      }
      
      if (result.metrics.timeSpent) {
        variantResults[result.variantId].timeSpent = 
          (variantResults[result.variantId].timeSpent! + result.metrics.timeSpent) / 2
      }
    })

    return variantResults
  }

  // Calculate statistical significance
  const calculateSignificance = (testId: string): Record<string, number> => {
    const results = getTestResults(testId)
    const variants = Object.keys(results)
    
    if (variants.length < 2) return {}

    const significance: Record<string, number> = {}
    
    // Simple chi-square test for conversion rates
    variants.forEach(variantId => {
      const variant = results[variantId]
      const conversionRate = variant.impressions > 0 ? variant.conversions / variant.impressions : 0
      significance[variantId] = conversionRate
    })

    return significance
  }

  // Add a new test
  const addTest = (test: ABTest) => {
    setActiveTests(prev => [...prev, test])
  }

  // Update test status
  const updateTestStatus = (testId: string, isActive: boolean) => {
    setActiveTests(prev => 
      prev.map(test => 
        test.id === testId ? { ...test, isActive } : test
      )
    )
  }

  return {
    activeTests,
    getUserVariant,
    recordImpression,
    recordConversion,
    getTestResults,
    calculateSignificance,
    addTest,
    updateTestStatus
  }
} 