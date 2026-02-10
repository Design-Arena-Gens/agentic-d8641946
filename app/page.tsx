'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface Article {
  id: string
  title: string
  url: string
  notes: string
  addedAt: number
  read: boolean
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('readingList')
    if (stored) {
      setArticles(JSON.parse(stored))
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('readingList', JSON.stringify(articles))
  }, [articles])

  const addArticle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const newArticle: Article = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      notes: notes.trim(),
      addedAt: Date.now(),
      read: false,
    }

    setArticles([newArticle, ...articles])
    setTitle('')
    setUrl('')
    setNotes('')
  }

  const toggleRead = (id: string) => {
    setArticles(articles.map(article =>
      article.id === id ? { ...article, read: !article.read } : article
    ))
  }

  const deleteArticle = (id: string) => {
    setArticles(articles.filter(article => article.id !== id))
  }

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles(articles.map(article =>
      article.id === id ? { ...article, ...updates } : article
    ))
    setEditingId(null)
  }

  const filteredArticles = articles.filter(article => {
    if (filter === 'unread') return !article.read
    if (filter === 'read') return article.read
    return true
  })

  const stats = {
    total: articles.length,
    unread: articles.filter(a => !a.read).length,
    read: articles.filter(a => a.read).length,
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>📚 Reading List</h1>
          <div className={styles.status}>
            <span className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.unread}</span>
          <span className={styles.statLabel}>Unread</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.read}</span>
          <span className={styles.statLabel}>Read</span>
        </div>
      </div>

      <form className={styles.form} onSubmit={addArticle}>
        <input
          type="text"
          placeholder="Article title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="url"
          placeholder="URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={styles.input}
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={styles.textarea}
          rows={2}
        />
        <button type="submit" className={styles.addButton}>
          + Add to Reading List
        </button>
      </form>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'read' ? styles.active : ''}`}
          onClick={() => setFilter('read')}
        >
          Read
        </button>
      </div>

      <div className={styles.list}>
        {filteredArticles.length === 0 ? (
          <div className={styles.empty}>
            {filter === 'all'
              ? '📖 No articles yet. Add your first one above!'
              : `No ${filter} articles`}
          </div>
        ) : (
          filteredArticles.map(article => (
            <div key={article.id} className={`${styles.article} ${article.read ? styles.read : ''}`}>
              {editingId === article.id ? (
                <div className={styles.editForm}>
                  <input
                    type="text"
                    defaultValue={article.title}
                    className={styles.input}
                    onBlur={(e) => updateArticle(article.id, { title: e.target.value })}
                    autoFocus
                  />
                  <textarea
                    defaultValue={article.notes}
                    className={styles.textarea}
                    rows={2}
                    onBlur={(e) => updateArticle(article.id, { notes: e.target.value })}
                  />
                </div>
              ) : (
                <>
                  <div className={styles.articleHeader}>
                    <h3 className={styles.articleTitle}>
                      {article.url ? (
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {article.title}
                        </a>
                      ) : (
                        article.title
                      )}
                    </h3>
                  </div>
                  {article.notes && (
                    <p className={styles.notes}>{article.notes}</p>
                  )}
                  {article.url && (
                    <a href={article.url} className={styles.url} target="_blank" rel="noopener noreferrer">
                      {new URL(article.url).hostname}
                    </a>
                  )}
                  <div className={styles.articleFooter}>
                    <span className={styles.date}>
                      {new Date(article.addedAt).toLocaleDateString()}
                    </span>
                    <div className={styles.actions}>
                      <button
                        onClick={() => toggleRead(article.id)}
                        className={styles.actionButton}
                      >
                        {article.read ? '↩️ Unread' : '✓ Read'}
                      </button>
                      <button
                        onClick={() => setEditingId(article.id)}
                        className={styles.actionButton}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        className={`${styles.actionButton} ${styles.delete}`}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
