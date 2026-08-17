import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppBackground from './components/AppBackground'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import InternsList from './pages/InternsList'
import AddIntern from './pages/AddIntern'
import InternDetails from './pages/InternDetails'
import TasksList from './pages/TasksList'
import AssignTask from './pages/AssignTask'
import TaskDetails from './pages/TaskDetails'
import TaskLibraryList from './pages/TaskLibraryList'
import AddTaskLibraryItem from './pages/AddTaskLibraryItem'
import EditTaskLibraryItem from './pages/EditTaskLibraryItem'
import EmailTemplatesList from './pages/EmailTemplatesList'
import EditEmailTemplate from './pages/EditEmailTemplate'
import ComposeEmail from './pages/ComposeEmail'
import AdminUsers from './pages/AdminUsers'
import Assistant from './pages/Assistant'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <AppBackground />
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute page="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interns"
            element={
              <ProtectedRoute page="interns">
                <InternsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interns/new"
            element={
              <ProtectedRoute page="interns">
                <AddIntern />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interns/:id"
            element={
              <ProtectedRoute page="interns">
                <InternDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute page="tasks">
                <TasksList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <ProtectedRoute page="tasks">
                <AssignTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute page="tasks">
                <TaskDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-library"
            element={
              <ProtectedRoute page="tasks">
                <TaskLibraryList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-library/new"
            element={
              <ProtectedRoute page="tasks">
                <AddTaskLibraryItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-library/:id"
            element={
              <ProtectedRoute page="tasks">
                <EditTaskLibraryItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-templates"
            element={
              <ProtectedRoute page="email_templates">
                <EmailTemplatesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-templates/:role"
            element={
              <ProtectedRoute page="email_templates">
                <EditEmailTemplate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emails/compose/:internId"
            element={
              <ProtectedRoute page="interns">
                <ComposeEmail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute page="assistant">
                <Assistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute page="admin_users" requireSuperAdmin>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
