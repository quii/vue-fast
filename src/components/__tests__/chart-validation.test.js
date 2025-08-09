import { describe, test, expect } from 'vitest'

/**
 * Validation helper for Chart.js annotation plugin configurations
 * This helps catch configuration errors before they hit the actual Chart.js rendering
 */
describe('Chart.js Configuration Validation', () => {
  
  /**
   * Validates that an annotation configuration object has all required properties
   * for the chartjs-plugin-annotation v3.x
   */
  function validateAnnotationConfig(annotations) {
    if (!annotations || typeof annotations !== 'object') {
      throw new Error('Annotations must be an object')
    }

    Object.entries(annotations).forEach(([key, annotation]) => {
      if (!annotation.type) {
        throw new Error(`Annotation '${key}' missing required 'type' property`)
      }

      // Validate line annotations
      if (annotation.type === 'line') {
        validateLineAnnotation(key, annotation)
      }
      
      // Validate box annotations  
      if (annotation.type === 'box') {
        validateBoxAnnotation(key, annotation)
      }
      
      // Validate label if present
      if (annotation.label) {
        validateLabelConfig(key, annotation.label)
      }
    })
  }

  function validateLineAnnotation(key, annotation) {
    // For line annotations, we need either:
    // 1. xMin/xMax/yMin/yMax (boundary format)
    // 2. scaleID + value (scale-relative format)
    
    const hasBoundaryFormat = 
      typeof annotation.xMin === 'number' && 
      typeof annotation.xMax === 'number' &&
      typeof annotation.yMin === 'number' && 
      typeof annotation.yMax === 'number'
    
    const hasScaleFormat = 
      typeof annotation.scaleID === 'string' && 
      typeof annotation.value === 'number'
    
    if (!hasBoundaryFormat && !hasScaleFormat) {
      throw new Error(
        `Line annotation '${key}' must have either (xMin/xMax/yMin/yMax) or (scaleID/value)`
      )
    }

    // Validate border properties
    if (annotation.borderColor && typeof annotation.borderColor !== 'string') {
      throw new Error(`Annotation '${key}' borderColor must be a string`)
    }
    
    if (annotation.borderWidth && typeof annotation.borderWidth !== 'number') {
      throw new Error(`Annotation '${key}' borderWidth must be a number`)
    }
    
    if (annotation.borderDash && !Array.isArray(annotation.borderDash)) {
      throw new Error(`Annotation '${key}' borderDash must be an array`)
    }
  }

  function validateBoxAnnotation(key, annotation) {
    const requiredProps = ['xMin', 'xMax', 'yMin', 'yMax']
    requiredProps.forEach(prop => {
      if (typeof annotation[prop] !== 'number') {
        throw new Error(`Box annotation '${key}' missing or invalid '${prop}' property`)
      }
    })
  }

  function validateLabelConfig(annotationKey, label) {
    if (typeof label.display !== 'boolean') {
      throw new Error(`Annotation '${annotationKey}' label.display must be boolean`)
    }
    
    if (label.content && typeof label.content !== 'string') {
      throw new Error(`Annotation '${annotationKey}' label.content must be string`)
    }
    
    if (label.position && typeof label.position !== 'string') {
      throw new Error(`Annotation '${annotationKey}' label.position must be string`)
    }
  }

  test('validates valid line annotation with boundary format', () => {
    const annotations = {
      testLine: {
        type: 'line',
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 100,
        borderColor: 'rgba(75, 192, 192, 0.6)',
        borderWidth: 2,
        borderDash: [3, 3]
      }
    }

    expect(() => validateAnnotationConfig(annotations)).not.toThrow()
  })

  test('validates valid line annotation with scale format', () => {
    const annotations = {
      testLine: {
        type: 'line',
        scaleID: 'x',
        value: 5,
        borderColor: 'rgba(75, 192, 192, 0.6)',
        borderWidth: 2
      }
    }

    expect(() => validateAnnotationConfig(annotations)).not.toThrow()
  })

  test('validates line annotation with label', () => {
    const annotations = {
      testLine: {
        type: 'line',
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 100,
        borderColor: 'rgba(75, 192, 192, 0.6)',
        borderWidth: 2,
        label: {
          display: true,
          content: '60yd',
          position: 'top',
          backgroundColor: 'rgba(75, 192, 192, 0.9)',
          color: 'white'
        }
      }
    }

    expect(() => validateAnnotationConfig(annotations)).not.toThrow()
  })

  test('rejects line annotation missing position info', () => {
    const annotations = {
      testLine: {
        type: 'line',
        borderColor: 'rgba(75, 192, 192, 0.6)'
        // Missing xMin/xMax/yMin/yMax OR scaleID/value
      }
    }

    expect(() => validateAnnotationConfig(annotations)).toThrow(
      /must have either.*xMin\/xMax\/yMin\/yMax.*or.*scaleID\/value/
    )
  })

  test('rejects annotation missing type', () => {
    const annotations = {
      testLine: {
        // Missing type
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 100
      }
    }

    expect(() => validateAnnotationConfig(annotations)).toThrow(
      /missing required 'type' property/
    )
  })

  test('rejects invalid border properties', () => {
    const annotations = {
      testLine: {
        type: 'line',
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 100,
        borderColor: 123, // Should be string
        borderWidth: 'invalid' // Should be number
      }
    }

    expect(() => validateAnnotationConfig(annotations)).toThrow()
  })

  test('rejects invalid label configuration', () => {
    const annotations = {
      testLine: {
        type: 'line',
        xMin: 0,
        xMax: 0,
        yMin: 0,
        yMax: 100,
        label: {
          display: 'true', // Should be boolean
          content: 123,    // Should be string
          position: 456    // Should be string
        }
      }
    }

    expect(() => validateAnnotationConfig(annotations)).toThrow()
  })

  test('validates empty annotations object', () => {
    expect(() => validateAnnotationConfig({})).not.toThrow()
  })

  // Export the validation function for use in component tests
  test.concurrent('validation function is available for import', () => {
    expect(validateAnnotationConfig).toBeDefined()
    expect(typeof validateAnnotationConfig).toBe('function')
  })
})

// Export for use in other tests
export function validateAnnotationConfig(annotations) {
  if (!annotations || typeof annotations !== 'object') {
    throw new Error('Annotations must be an object')
  }

  Object.entries(annotations).forEach(([key, annotation]) => {
    if (!annotation.type) {
      throw new Error(`Annotation '${key}' missing required 'type' property`)
    }

    // Validate line annotations
    if (annotation.type === 'line') {
      validateLineAnnotation(key, annotation)
    }
    
    // Validate box annotations  
    if (annotation.type === 'box') {
      validateBoxAnnotation(key, annotation)
    }
    
    // Validate label if present
    if (annotation.label) {
      validateLabelConfig(key, annotation.label)
    }
  })

  function validateLineAnnotation(key, annotation) {
    // For line annotations, we need either:
    // 1. xMin/xMax/yMin/yMax (boundary format)
    // 2. scaleID + value (scale-relative format)
    
    const hasBoundaryFormat = 
      typeof annotation.xMin === 'number' && 
      typeof annotation.xMax === 'number' &&
      typeof annotation.yMin === 'number' && 
      typeof annotation.yMax === 'number'
    
    const hasScaleFormat = 
      typeof annotation.scaleID === 'string' && 
      typeof annotation.value === 'number'
    
    if (!hasBoundaryFormat && !hasScaleFormat) {
      throw new Error(
        `Line annotation '${key}' must have either (xMin/xMax/yMin/yMax) or (scaleID/value)`
      )
    }

    // Validate border properties
    if (annotation.borderColor && typeof annotation.borderColor !== 'string') {
      throw new Error(`Annotation '${key}' borderColor must be a string`)
    }
    
    if (annotation.borderWidth && typeof annotation.borderWidth !== 'number') {
      throw new Error(`Annotation '${key}' borderWidth must be a number`)
    }
    
    if (annotation.borderDash && !Array.isArray(annotation.borderDash)) {
      throw new Error(`Annotation '${key}' borderDash must be an array`)
    }
  }

  function validateBoxAnnotation(key, annotation) {
    const requiredProps = ['xMin', 'xMax', 'yMin', 'yMax']
    requiredProps.forEach(prop => {
      if (typeof annotation[prop] !== 'number') {
        throw new Error(`Box annotation '${key}' missing or invalid '${prop}' property`)
      }
    })
  }

  function validateLabelConfig(annotationKey, label) {
    if (typeof label.display !== 'boolean') {
      throw new Error(`Annotation '${annotationKey}' label.display must be boolean`)
    }
    
    if (label.content && typeof label.content !== 'string') {
      throw new Error(`Annotation '${annotationKey}' label.content must be string`)
    }
    
    if (label.position && typeof label.position !== 'string') {
      throw new Error(`Annotation '${annotationKey}' label.position must be string`)
    }
  }
}