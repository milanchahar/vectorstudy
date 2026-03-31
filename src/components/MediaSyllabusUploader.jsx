import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Image as ImageIcon, FileText } from 'lucide-react'

const STORAGE_KEY = 'vectorstudy_syllabus_media_names'

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i += 1
  }
  const val = i === 0 ? Math.round(n) : Math.round(n * 10) / 10
  return `${val} ${units[i]}`
}

function isPdf(file) {
  return file && file.type === 'application/pdf'
}

function isImage(file) {
  return file && file.type && file.type.startsWith('image/')
}

function MediaSyllabusUploader() {
  const inputRef = useRef(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [files, setFiles] = useState([])

  useEffect(() => {
    return () => {
      for (const item of files) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      }
    }
  }, [files])

  function addFiles(list) {
    const next = []
    for (const f of list) {
      if (!f) continue
      const ok = isPdf(f) || isImage(f)
      if (!ok) continue
      next.push(f)
    }

    if (!next.length) return

    const withPreviews = next.map(file => {
      if (isImage(file)) {
        return { file, previewUrl: URL.createObjectURL(file) }
      }
      return { file, previewUrl: null }
    })

    setFiles(prev => {
      const merged = [...prev, ...withPreviews]
      const names = merged.map(x => x.file.name)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
      } catch (err) {
        console.warn('Unable to persist syllabus media names:', err)
      }
      return merged
    })
  }

  function handleBrowse() {
    inputRef.current?.click()
  }

  function handleInputChange(e) {
    const list = e.target.files ? Array.from(e.target.files) : []
    addFiles(list)
    e.target.value = ''
  }

  function handleDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const list = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : []
    addFiles(list)
  }

  function removeFileAt(index) {
    setFiles(prev => {
      const target = prev[index]
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      const next = prev.filter((_, i) => i !== index)
      const names = next.map(x => x.file.name)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
      } catch (err) {
        console.warn('Unable to persist syllabus media names:', err)
      }
      return next
    })
  }

  function removeAll() {
    setFiles(prev => {
      for (const item of prev) if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
      } catch (err) {
        console.warn('Unable to clear syllabus media names:', err)
      }
      return []
    })
  }

  const accept = 'application/pdf,image/*'

  return (
    <section className="media-uploader">
      <div className="card-elevated media-uploader-card">
        <div className="onboarding-section-header">
          <h2 className="onboarding-section-title">Upload your syllabus files</h2>
          <p className="onboarding-section-subtitle">Drop PDFs or images. We’ll use this to extract structured topics later.</p>
        </div>

        <div
          className={`media-dropzone ${isDragActive ? 'media-dropzone--active' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Upload syllabus files"
          onClick={handleBrowse}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') handleBrowse()
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="media-dropzone-inner">
            <UploadCloud size={22} />
            <div className="media-dropzone-text">
              <div className="media-dropzone-title">Drag & drop files</div>
              <div className="media-dropzone-subtitle">or click to browse</div>
            </div>
          </div>

          <div className="media-accept-hint">
            Accepted: <span className="media-accept-strong">PDF, PNG, JPG</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleInputChange}
            className="media-file-input"
          />
        </div>

        {files.length > 0 && (
          <div className="media-uploader-list" aria-label="Selected files">
            <div className="media-list-header">
              <div className="media-list-title">{files.length} file(s) selected</div>
              <button type="button" className="media-clear-btn" onClick={removeAll}>
                Clear all
              </button>
            </div>

            <div className="media-file-grid">
              {files.map((item, idx) => {
                const file = item.file
                const pdf = isPdf(file)
                const img = isImage(file)

                return (
                  <div key={`${file.name}-${idx}`} className="media-file-chip">
                    <div className="media-file-main">
                      <div className="media-file-icon">
                        {img ? (
                          <img src={item.previewUrl} alt={file.name} className="media-file-thumb" />
                        ) : pdf ? (
                          <FileText size={18} />
                        ) : (
                          <ImageIcon size={18} />
                        )}
                      </div>
                      <div className="media-file-meta">
                        <div className="media-file-name" title={file.name}>{file.name}</div>
                        <div className="media-file-size">{formatBytes(file.size)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="media-remove-btn"
                      onClick={() => removeFileAt(idx)}
                      aria-label={`Remove ${file.name}`}
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default MediaSyllabusUploader
