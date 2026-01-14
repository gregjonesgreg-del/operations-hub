import React from 'react';
import { Link } from 'react-router-dom';
import { ensureAbsolutePath } from '@/components/Routes';

/**
 * Safe Link wrapper that enforces absolute paths
 * Automatically normalizes relative paths to absolute
 */
export default function AppLink({ to, ...props }) {
  const absolutePath = ensureAbsolutePath(to);
  return <Link to={absolutePath} {...props} />;
}