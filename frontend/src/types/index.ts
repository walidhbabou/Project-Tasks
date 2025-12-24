export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status?: TaskStatus;
  dueDate?: string;
  assignee?: User;
  projectId: string;
  section?: string;
  tags?: Tag[];
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'pink';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  tasks: Task[];
  createdAt: string;
  ownerId: string;
}
