import { useState } from 'react';
import useSWR from 'swr';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskTable from '@/components/TaskTable';
import AddTaskModal from '@/components/AddTaskModal';
import { Plus } from 'lucide-react';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

export default function TasksPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data: tasks, error, mutate } = useSWR('/api/tasks', fetcher);

  return (
    <ProtectedRoute allowedRoles={['SuperUser', 'Admin']}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Task Management</h1>
            <p className="text-gray-600 mt-2">Manage and track project tasks</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <TaskTable tasks={tasks || []} onUpdate={mutate} />
        </div>

        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            mutate();
            setIsAddModalOpen(false);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}