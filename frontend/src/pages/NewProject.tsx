import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/contexts/ProjectContext';
import { useToast } from '@/hooks/use-toast';

const projectColors = [
  '#0EA5E9', // sky blue
  '#06B6D4', // light sky blue
  '#38BDF8', // bright sky blue
  '#7DD3FC', // lighter sky blue
  '#BAE6FD', // very light sky blue
  '#E0F2FE', // pale sky blue
  '#0284C7', // deeper sky blue
  '#00B4D8', // cyan sky blue
];

const NewProject = () => {
  const navigate = useNavigate();
  const { addProject } = useProjects();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(projectColors[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a project name',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addProject(name.trim(), description.trim() || undefined, selectedColor);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <header className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">
              Create New Project
            </h1>
          </div>
        </header>

        <div className="max-w-xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name..."
                className="h-12"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Label>Project Color</Label>
              <div className="flex gap-3 flex-wrap">
                {projectColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedColor }}
                >
                  <span className="text-white font-semibold text-lg">
                    {name.charAt(0) || 'P'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {name || 'Project Name'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {description || 'No description'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Project
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewProject;
