import { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../services/api.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [stats, setStats] = useState({
    activeEvents: 0,
    foodItemsShared: 0,
    studentsReached: 0,
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [goingToPosts, setGoingToPosts] = useState([])
  const [remindedPosts, setRemindedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(() => api.getSession()?.user || null)
  const [authLoading, setAuthLoading] = useState(() => !!api.getSession())

  /* ── Restore the Supabase session on mount ───── */
  useEffect(() => {
    let cancelled = false
    async function restoreSession() {
      const session = api.getSession()
      if (!session) {
        setAuthLoading(false)
        return
      }
      try {
        const data = await api.fetchMe()
        if (!cancelled) setUser(data.user)
      } catch (err) {
        console.error('Session restore failed:', err)
        api.clearSession()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setAuthLoading(false)
      }
    }
    restoreSession()
    return () => { cancelled = true }
  }, [])

  /* ── Fetch data from API once authenticated ──── */
  useEffect(() => {
    if (!user) {
      setRecentPosts([])
      setGoingToPosts([])
      setRemindedPosts([])
      setLoading(false)
      return undefined
    }
    let cancelled = false
    async function loadData() {
      setLoading(true)
      try {
        const [posts, statsData] = await Promise.all([
          api.fetchFoodPosts(),
          api.fetchStats(),
        ])
        if (!cancelled) {
          setRecentPosts(posts)
          setStats(statsData)
        }
      } catch (err) {
        console.error('Failed to load data from API:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [user])

  /* ── Authentication (Supabase) ───────────────── */
  async function login(email, password) {
    const data = await api.signIn(email, password)
    setUser(data.user)
    return data.user
  }

  async function signup({ fullName, email, password, role }) {
    return api.signUp({ fullName, email, password, role })
  }

  async function logout() {
    try {
      await api.signOut()
    } finally {
      setUser(null)
    }
  }

  /* ── Helper to refresh stats silently ────────── */
  async function refreshStats() {
    try {
      const s = await api.fetchStats()
      setStats(s)
    } catch (err) {
      console.error('Failed to refresh stats:', err)
    }
  }

  /* ── Organiser: create immediate food post ──── */
  async function addFoodPost(post) {
    const newPost = await api.createFoodPost({ ...post, postType: 'immediate' })
    setRecentPosts(prev => [newPost, ...prev])
    refreshStats()
    return newPost
  }

  /* ── Organiser: create scheduled food post ──── */
  async function scheduleFood(post) {
    const newPost = await api.createFoodPost({ ...post, postType: 'scheduled' })
    setRecentPosts(prev => [newPost, ...prev])
    refreshStats()
    return newPost
  }

  /* ── Organiser: update a post ───────────────── */
  async function updatePost(postId, updates) {
    const updated = await api.updateFoodPost(postId, updates)
    setRecentPosts(prev => prev.map(p => (p.id === postId ? updated : p)))
    return updated
  }

  /* ── Organiser: mark all gone ───────────────── */
  async function markAllGone(postId) {
    const updated = await api.updatePostStatus(postId, 'All Gone')
    setRecentPosts(prev => prev.map(p => (p.id === postId ? updated : p)))
    refreshStats()
    return updated
  }

  /* ── Student: "I'm Going" ───────────────────── */
  async function markGoing(postId) {
    await api.claimFoodPost(postId)
    setGoingToPosts(prev => (prev.includes(postId) ? prev : [...prev, postId]))
  }

  function removeGoing(postId) {
    setGoingToPosts(prev => prev.filter(id => id !== postId))
    api.removeClaim(postId).catch(err => console.error('Failed to remove claim:', err))
  }

  /* ── Student: reminder ──────────────────────── */
  async function setReminder(postId) {
    await api.setReminder(postId)
    setRemindedPosts(prev => (prev.includes(postId) ? prev : [...prev, postId]))
  }

  function removeReminder(postId) {
    setRemindedPosts(prev => prev.filter(id => id !== postId))
    api.removeReminder(postId).catch(err => console.error('Failed to remove reminder:', err))
  }

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        login,
        signup,
        logout,
        stats,
        setStats,
        recentPosts,
        setRecentPosts,
        loading,
        addFoodPost,
        scheduleFood,
        updatePost,
        markAllGone,
        goingToPosts,
        remindedPosts,
        markGoing,
        removeGoing,
        setReminder,
        removeReminder,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export default AppContext