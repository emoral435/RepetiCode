import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

interface Props {
  children: React.ReactNode
}

function Protected({ children }: Props) {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children;
}
export default Protected