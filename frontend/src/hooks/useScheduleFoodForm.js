import { useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

/* ── Validation helpers ────────────────────── */
const step1RequiredFields = ['organiserName', 'organiserRole', 'campusOrganisation', 'eventName', 'foodDescription']
const step2RequiredFields = ['scheduledDate', 'collectionStarts', 'collectionCloses', 'collectionLocation', 'pickupPoint', 'estimatedServes']

function getTodayString() {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function validateField(name, value, formData) {
  switch (name) {
    case 'organiserName':
      return value.trim() ? '' : 'Organiser name is required'
    case 'organiserRole':
      return value ? '' : 'Please select your role'
    case 'campusOrganisation':
      return value ? '' : 'Please select an organisation'
    case 'eventName':
      return value.trim() ? '' : 'Please enter an event name'
    case 'foodDescription':
      return value.trim() ? '' : 'Food description is required'
    case 'scheduledDate':
      if (!value) return 'Please select a date'
      if (value < getTodayString()) return 'Date cannot be in the past'
      return ''
    case 'collectionStarts':
      return value ? '' : 'Please set when collection starts'
    case 'collectionCloses':
      if (!value) return 'Please set when collection closes'
      if (formData && formData.collectionStarts && value <= formData.collectionStarts) {
        return 'Closing time must be after start time'
      }
      return ''
    case 'collectionLocation':
      return value.trim() ? '' : 'Collection location is required'
    case 'pickupPoint':
      return value.trim() ? '' : 'Pickup point is required'
    case 'estimatedServes':
      if (!value) return 'Estimated serves is required'
      if (Number(value) <= 0) return 'Must be greater than 0'
      return ''
    default:
      return ''
  }
}

function validateAllFields(fields, data) {
  const newErrors = {}
  fields.forEach(name => {
    const error = validateField(name, data[name], data)
    if (error) newErrors[name] = error
  })
  return newErrors
}

/* ── Initial form state ────────────────────── */
const initialFormData = {
  organiserName: '',
  organiserRole: '',
  campusOrganisation: '',
  eventName: '',
  foodDescription: '',
  dietaryInformation: '',
  foodPhoto: null,
  scheduledDate: '',
  collectionStarts: '',
  collectionCloses: '',
  collectionLocation: '',
  pickupPoint: '',
  estimatedServes: '',
  collectionNotes: '',
}

/* ── Custom Hook ───────────────────────────── */
export default function useScheduleFoodForm() {
  const { scheduleFood } = useAppContext()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  /* ── Controlled input handler ─────────────── */
  function handleChange(event) {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  /* ── Touched-on-blur handler ──────────────── */
  function handleBlur(event) {
    const { name } = event.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name], formData)
    setErrors(prev => {
      const next = { ...prev }
      if (error) { next[name] = error } else { delete next[name] }
      return next
    })
  }

  function handlePhotoChange(file) {
    setFormData(prev => ({ ...prev, foodPhoto: file }))
  }

  function handlePhotoRemove() {
    setFormData(prev => ({ ...prev, foodPhoto: null }))
  }

  /* ── Step 1 → Step 2 ─────────────────────── */
  function handleContinue(event) {
    event.preventDefault()
    const stepErrors = validateAllFields(step1RequiredFields, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...stepErrors }))
      const allTouched = {}
      step1RequiredFields.forEach(f => { allTouched[f] = true })
      setTouched(prev => ({ ...prev, ...allTouched }))
      return
    }
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Step 2 → Step 3 (Schedule) ──────────── */
  async function handleSchedule(event) {
    event.preventDefault()
    const allRequired = [...step1RequiredFields, ...step2RequiredFields]
    const stepErrors = validateAllFields(allRequired, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...stepErrors }))
      const allTouched = {}
      allRequired.forEach(f => { allTouched[f] = true })
      setTouched(prev => ({ ...prev, ...allTouched }))
      return
    }
    try {
      await scheduleFood({
        organiserName: formData.organiserName,
        organiserRole: formData.organiserRole,
        campusOrganisation: formData.campusOrganisation,
        eventName: formData.eventName,
        foodDescription: formData.foodDescription,
        dietaryInformation: formData.dietaryInformation,
        scheduledDate: formData.scheduledDate,
        collectionStarts: formData.collectionStarts,
        collectionCloses: formData.collectionCloses,
        collectionLocation: formData.collectionLocation,
        pickupPoint: formData.pickupPoint,
        estimatedServes: Number(formData.estimatedServes),
        collectionNotes: formData.collectionNotes,
      })
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Failed to schedule food post:', err)
    }
  }

  function handleBackToStep1() {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    currentStep,
    formData,
    errors,
    handleChange,
    handleBlur,
    handlePhotoChange,
    handlePhotoRemove,
    handleContinue,
    handleSchedule,
    handleBackToStep1,
  }
}