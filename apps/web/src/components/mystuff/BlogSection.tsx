"use client";

import React, { useState, useEffect } from 'react';
import { client } from '@/utils/orpc';
import styles from './BlogSection.module.css';
import BlogModal from './BlogModal';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  likeCount: number;
  createdAt: string;
}

interface BlogSectionProps {
  blogPosts: BlogPost[];
  onUpdate: () => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({ blogPosts, onUpdate }) => {
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setPosts(blogPosts);
  }, [blogPosts]);

  const handleNewBlogPost = () => {
    setIsModalOpen(true);
  };

  const handleCreatePost = async (postData: { title: string; content: string; tags: string[] }) => {
    try {
      // Use RPC API
      await client.blogs.create(postData);

      onUpdate(); // Refresh the blog posts list
      setIsModalOpen(false); // Close the modal on success
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create blog post. Please try again.');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Use RPC API
      await client.blogs.like({ id: postId });

      if (onUpdate) {
        onUpdate(); // This will re-fetch the posts from the parent component
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={`${styles.blogSection} ${styles.glassCard}`}>
      <h3 className={styles.sectionHeading}>My Blog</h3>
      <button
        className={`${styles.newBlogButton} ${styles.btn} ${styles.btnPrimary}`}
        onClick={handleNewBlogPost}
      >
        + New Blog Post
      </button>

      {/* Render the modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      {posts.length === 0 ? (
        <div className={styles.noPosts}>No blog posts yet. Create your first one!</div>
      ) : (
        posts.map(post => (
          <div key={post._id} className={styles.blogEntry}>
            <div className={styles.blogTitle}>{post.title}</div>
            <div className={styles.blogContent}>{post.content}</div>
            <div className={styles.blogFooter}>
              <div>Posted on {formatDate(post.createdAt)}</div>
              <div className={styles.blogActions}>
                <div 
                  className={styles.blogAction}
                  onClick={() => handleLike(post._id)}
                  style={{ cursor: 'pointer' }}
                >
                  ❤️ {post.likeCount}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BlogSection;
