import { useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

/* ── Validation helpers ────────────────────── */
const step1RequiredFields = ['organiserName', 'organiserRole', 'campusOrganisation', 'foodAvailable', 'foodDescription']
const step2RequiredFields = ['collectionLocation', 'pickupPoint', 'collectionCloses', 'estimatedServes']

function validateField(name, value) {
  switch (name) {
    case 'organiserName':
      return value.trim() ? '' : 'Organiser name is required'
    case 'organiserRole':
      return value ? '' : 'Please select your role'
    case 'campusOrganisation':
      return value ? '' : 'Please select an organisation'
    case 'foodAvailable':
      return value.trim() ? '' : 'Please describe what is available'
    case 'foodDescription':
      return value.trim() ? '' : 'Food description is required'
    case 'collectionLocation':
      return value.trim() ? '' : 'Collection location is required'
    case 'pickupPoint':
      return value.trim() ? '' : 'Pickup point is required'
    case 'collectionCloses':
      return value ? '' : 'Please set when collection closes'
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
    const error = validateField(name, data[name])
    if (error) newErrors[name] = error
  })
  return newErrors
}

/* ── Initial form state ────────────────────── */
const initialFormData = {
  organiserName: '',
  organiserRole: '',
  campusOrganisation: '',
  foodAvailable: '',
  foodDescription: '',
  dietaryInformation: '',
  foodPhoto: null,
  collectionLocation: '',
  pickupPoint: '',
  collectionCloses: '',
  estimatedServes: '',
  collectionNotes: '',
}

/* ── Custom Hook ───────────────────────────── */
export default function usePostFoodForm(onStepChange) {
  const { addFoodPost } = useAppContext()

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
    const error = validateField(name, formData[name])
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
    if (onStepChange) onStepChange(2)
  }

  /* ── Step 2 → Step 3 (Publish) ───────────── */
  async function handlePublish(event) {
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
      await addFoodPost({
        organiserName: formData.organiserName,
        organiserRole: formData.organiserRole,
        campusOrganisation: formData.campusOrganisation,
        foodAvailable: formData.foodAvailable,
        foodDescription: formData.foodDescription,
        dietaryInformation: formData.dietaryInformation,
        collectionLocation: formData.collectionLocation,
        pickupPoint: formData.pickupPoint,
        collectionCloses: formData.collectionCloses,
        estimatedServes: Number(formData.estimatedServes),
        collectionNotes: formData.collectionNotes,
      })
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (onStepChange) onStepChange(3)
    } catch (err) {
      console.error('Failed to publish food post:', err)
    }
  }

  function handleBackToStep1() {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (onStepChange) onStepChange(1)
  }

  return {
    currentStep,
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handlePhotoChange,
    handlePhotoRemove,
    handleContinue,
    handlePublish,
    handleBackToStep1,
  }
}
