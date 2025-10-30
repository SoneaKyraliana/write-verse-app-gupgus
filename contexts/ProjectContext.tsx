
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  content: string;
  updatedAt: number;
}

export interface CustomCategory {
  id: string;
  name: string;
  notes: Note[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  worldbuilding: {
    religion: Note[];
    culture: Note[];
    dailyLife: Note[];
    socialStructure: Note[];
    politicalStructure: Note[];
    mythology: Note[];
    history: Note[];
    geography: Note[];
    environment: Note[];
  };
  characters: CustomCategory[];
  settings: CustomCategory[];
  miscellaneous: CustomCategory[];
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  addProject: (name: string) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  updateWorldbuildingNote: (category: keyof Project['worldbuilding'], noteId: string, content: string) => void;
  addWorldbuildingNote: (category: keyof Project['worldbuilding']) => string;
  deleteWorldbuildingNote: (category: keyof Project['worldbuilding'], noteId: string) => void;
  addCustomCategory: (section: 'characters' | 'settings' | 'miscellaneous', name: string) => void;
  deleteCustomCategory: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string) => void;
  updateCustomNote: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, noteId: string, content: string) => void;
  addCustomNote: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string) => string;
  deleteCustomNote: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, noteId: string) => void;
  searchNotes: (query: string) => SearchResult[];
}

export interface SearchResult {
  projectId: string;
  projectName: string;
  section: string;
  category: string;
  noteId: string;
  content: string;
  preview: string;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    saveProjects();
  }, [projects]);

  const loadProjects = async () => {
    try {
      const data = await AsyncStorage.getItem('projects');
      if (data) {
        const loadedProjects = JSON.parse(data);
        setProjects(loadedProjects);
        console.log('Loaded projects:', loadedProjects.length);
      }
    } catch (error) {
      console.log('Error loading projects:', error);
    }
  };

  const saveProjects = async () => {
    try {
      await AsyncStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.log('Error saving projects:', error);
    }
  };

  const addProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      worldbuilding: {
        religion: [],
        culture: [],
        dailyLife: [],
        socialStructure: [],
        politicalStructure: [],
        mythology: [],
        history: [],
        geography: [],
        environment: [],
      },
      characters: [],
      settings: [],
      miscellaneous: [],
    };
    setProjects([...projects, newProject]);
    console.log('Added project:', name);
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
    console.log('Deleted project:', id);
  };

  const selectProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    setCurrentProject(project || null);
    console.log('Selected project:', project?.name);
  };

  const updateWorldbuildingNote = (category: keyof Project['worldbuilding'], noteId: string, content: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const notes = p.worldbuilding[category].map(n =>
          n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
        );
        return {
          ...p,
          worldbuilding: {
            ...p.worldbuilding,
            [category]: notes,
          },
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const addWorldbuildingNote = (category: keyof Project['worldbuilding']): string => {
    if (!currentProject) return '';

    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      updatedAt: Date.now(),
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          worldbuilding: {
            ...p.worldbuilding,
            [category]: [...p.worldbuilding[category], newNote],
          },
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    return newNote.id;
  };

  const deleteWorldbuildingNote = (category: keyof Project['worldbuilding'], noteId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          worldbuilding: {
            ...p.worldbuilding,
            [category]: p.worldbuilding[category].filter(n => n.id !== noteId),
          },
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const addCustomCategory = (section: 'characters' | 'settings' | 'miscellaneous', name: string) => {
    if (!currentProject) return;

    const newCategory: CustomCategory = {
      id: Date.now().toString(),
      name,
      notes: [],
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          [section]: [...p[section], newCategory],
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const deleteCustomCategory = (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          [section]: p[section].filter((c: CustomCategory) => c.id !== categoryId),
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const updateCustomNote = (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, noteId: string, content: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const categories = p[section].map((cat: CustomCategory) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              notes: cat.notes.map(n =>
                n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
              ),
            };
          }
          return cat;
        });
        return {
          ...p,
          [section]: categories,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const addCustomNote = (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string): string => {
    if (!currentProject) return '';

    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      updatedAt: Date.now(),
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const categories = p[section].map((cat: CustomCategory) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              notes: [...cat.notes, newNote],
            };
          }
          return cat;
        });
        return {
          ...p,
          [section]: categories,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    return newNote.id;
  };

  const deleteCustomNote = (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, noteId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const categories = p[section].map((cat: CustomCategory) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              notes: cat.notes.filter(n => n.id !== noteId),
            };
          }
          return cat;
        });
        return {
          ...p,
          [section]: categories,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const searchNotes = (query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    projects.forEach(project => {
      // Search worldbuilding notes
      Object.entries(project.worldbuilding).forEach(([category, notes]) => {
        notes.forEach(note => {
          if (note.content.toLowerCase().includes(lowerQuery)) {
            results.push({
              projectId: project.id,
              projectName: project.name,
              section: 'Worldbuilding',
              category: category.replace(/([A-Z])/g, ' $1').trim(),
              noteId: note.id,
              content: note.content,
              preview: getPreview(note.content, lowerQuery),
            });
          }
        });
      });

      // Search custom categories
      ['characters', 'settings', 'miscellaneous'].forEach(section => {
        const categories = project[section as keyof Pick<Project, 'characters' | 'settings' | 'miscellaneous'>] as CustomCategory[];
        categories.forEach(cat => {
          cat.notes.forEach(note => {
            if (note.content.toLowerCase().includes(lowerQuery)) {
              results.push({
                projectId: project.id,
                projectName: project.name,
                section: section.charAt(0).toUpperCase() + section.slice(1),
                category: cat.name,
                noteId: note.id,
                content: note.content,
                preview: getPreview(note.content, lowerQuery),
              });
            }
          });
        });
      });
    });

    return results;
  };

  const getPreview = (content: string, query: string): string => {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.substring(0, 100);

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    let preview = content.substring(start, end);

    if (start > 0) preview = '...' + preview;
    if (end < content.length) preview = preview + '...';

    return preview;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        addProject,
        deleteProject,
        selectProject,
        updateWorldbuildingNote,
        addWorldbuildingNote,
        deleteWorldbuildingNote,
        addCustomCategory,
        deleteCustomCategory,
        updateCustomNote,
        addCustomNote,
        deleteCustomNote,
        searchNotes,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
