import { useNavigate } from 'react-router-dom';
import { ensureAbsolutePath } from '@/components/Routes';

/**
 * Safe navigate wrapper that enforces absolute paths
 * Automatically normalizes relative paths to absolute
 */
export default function useAppNavigate() {
  const navigate = useNavigate();
  
  return (to, options) => {
    const absolutePath = ensureAbsolutePath(to);
    return navigate(absolutePath, options);
  };
}