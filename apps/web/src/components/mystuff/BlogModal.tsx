'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './BlogModal.module.css';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void;
}

const BlogModal: React.FC<BlogModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.');
      return;
    }
    onSubmit({
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    });
    // Reset state after submission
    setTitle('');
    setContent('');
    setTags('');
  };

  if (!isOpen) {
    return null;
  }

  // Use createPortal only on client side
  if (typeof document === 'undefined') {
    return null;
  }

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Create New Blog Post</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.formInput}
              placeholder="Your post title"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.formTextarea}
              placeholder="Write your blog post here..."
              rows={10}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={styles.formInput}
              placeholder="e.g., anime, review, one piece"
            />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

export default BlogModal;
