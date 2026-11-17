import {Navigate} from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import PageSkeleton from './PageSkeleton';
export default function AdminRoleRoute({children}){const{token,user,initialized}=useAuthStore();if(!initialized)return <PageSkeleton/>;if(!token)return <Navigate to="/login" replace/>;if(!['admin','super_admin'].includes(user?.role))return <Navigate to="/admin/dashboard" replace/>;return children;}
