
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
  maps: Map[];
}

export interface DrawPath {
  id: string;
  type: string;
  path: string;
  color: string;
}

export interface MapMarker {
  id: string;
  type: string;
  x: number;
  y: number;
  name: string;
}

export interface Map {
  id: string;
  name: string;
  paths: DrawPath[];
  markers: MapMarker[];
  createdAt: number;
}

export interface WorldbuildingCategory {
  religion: Note[];
  culture: Note[];
  dailyLife: Note[];
  socialStructure: Note[];
  politicalStructure: Note[];
  mythology: Note[];
  history: Note[];
  geography: Note[];
  environment: Note[];
}

export interface WorldbuildingWithMaps {
  religion: { notes: Note[]; maps: Map[] };
  culture: { notes: Note[]; maps: Map[] };
  dailyLife: { notes: Note[]; maps: Map[] };
  socialStructure: { notes: Note[]; maps: Map[] };
  politicalStructure: { notes: Note[]; maps: Map[] };
  mythology: { notes: Note[]; maps: Map[] };
  history: { notes: Note[]; maps: Map[] };
  geography: { notes: Note[]; maps: Map[] };
  environment: { notes: Note[]; maps: Map[] };
}

export interface Chapter {
  id: string;
  name: string;
  notes: Note[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  worldbuilding: WorldbuildingWithMaps;
  characters: CustomCategory[];
  settings: CustomCategory[];
  miscellaneous: CustomCategory[];
  maps: Map[];
  story: Chapter[];
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  addProject: (name: string) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  updateWorldbuildingNote: (category: keyof WorldbuildingWithMaps, noteId: string, content: string) => void;
  addWorldbuildingNote: (category: keyof WorldbuildingWithMaps) => string;
  deleteWorldbuildingNote: (category: keyof WorldbuildingWithMaps, noteId: string) => void;
  addCustomCategory: (section: 'characters' | 'settings' | 'miscellaneous', name: string) => void;
  deleteCustomCategory: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string) => void;
  updateCustomNote: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, noteId: string, content: string) => void;
  addCustomNote: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string) => string;
  deleteCustomNote: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, noteId: string) => void;
  addChapter: (name: string) => void;
  deleteChapter: (chapterId: string) => void;
  updateScene: (chapterId: string, sceneId: string, content: string) => void;
  addScene: (chapterId: string) => string;
  deleteScene: (chapterId: string, sceneId: string) => void;
  searchNotes: (query: string) => SearchResult[];
  getMaps: () => Map[];
  getMap: (mapId: string) => Map | undefined;
  addMap: (name: string) => string;
  deleteMap: (mapId: string) => void;
  updateMapData: (mapId: string, paths: DrawPath[], markers: MapMarker[]) => void;
  addWorldbuildingMap: (category: keyof WorldbuildingWithMaps, name: string) => string;
  deleteWorldbuildingMap: (category: keyof WorldbuildingWithMaps, mapId: string) => void;
  getWorldbuildingMap: (category: keyof WorldbuildingWithMaps, mapId: string) => Map | undefined;
  updateWorldbuildingMapData: (category: keyof WorldbuildingWithMaps, mapId: string, paths: DrawPath[], markers: MapMarker[]) => void;
  addCustomCategoryMap: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, name: string) => string;
  deleteCustomCategoryMap: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, mapId: string) => void;
  getCustomCategoryMap: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, mapId: string) => Map | undefined;
  updateCustomCategoryMapData: (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, mapId: string, paths: DrawPath[], markers: MapMarker[]) => void;
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
        const migratedProjects = loadedProjects.map((p: any) => {
          // Migrate old worldbuilding structure to new structure with maps
          const worldbuilding: WorldbuildingWithMaps = {} as WorldbuildingWithMaps;
          const categories = ['religion', 'culture', 'dailyLife', 'socialStructure', 'politicalStructure', 'mythology', 'history', 'geography', 'environment'];
          
          categories.forEach(cat => {
            if (p.worldbuilding && p.worldbuilding[cat]) {
              if (Array.isArray(p.worldbuilding[cat])) {
                // Old structure - just notes array
                worldbuilding[cat as keyof WorldbuildingWithMaps] = {
                  notes: p.worldbuilding[cat],
                  maps: []
                };
              } else {
                // New structure - already has notes and maps
                worldbuilding[cat as keyof WorldbuildingWithMaps] = p.worldbuilding[cat];
              }
            } else {
              worldbuilding[cat as keyof WorldbuildingWithMaps] = { notes: [], maps: [] };
            }
          });

          // Migrate custom categories to include maps
          const migrateCustomCategories = (categories: any[]) => {
            return (categories || []).map((cat: any) => ({
              ...cat,
              maps: cat.maps || []
            }));
          };

          return {
            ...p,
            worldbuilding,
            characters: migrateCustomCategories(p.characters),
            settings: migrateCustomCategories(p.settings),
            miscellaneous: migrateCustomCategories(p.miscellaneous),
            maps: p.maps || [],
            story: p.story || [],
          };
        });
        setProjects(migratedProjects);
        console.log('Loaded projects:', migratedProjects.length);
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
        religion: { notes: [], maps: [] },
        culture: { notes: [], maps: [] },
        dailyLife: { notes: [], maps: [] },
        socialStructure: { notes: [], maps: [] },
        politicalStructure: { notes: [], maps: [] },
        mythology: { notes: [], maps: [] },
        history: { notes: [], maps: [] },
        geography: { notes: [], maps: [] },
        environment: { notes: [], maps: [] },
      },
      characters: [],
      settings: [],
      miscellaneous: [],
      maps: [],
      story: [],
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

  const updateWorldbuildingNote = (category: keyof WorldbuildingWithMaps, noteId: string, content: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const notes = p.worldbuilding[category].notes.map(n =>
          n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
        );
        return {
          ...p,
          worldbuilding: {
            ...p.worldbuilding,
            [category]: {
              ...p.worldbuilding[category],
              notes
            },
          },
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const addWorldbuildingNote = (category: keyof WorldbuildingWithMaps): string => {
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
            [category]: {
              ...p.worldbuilding[category],
              notes: [...p.worldbuilding[category].notes, newNote]
            },
          },
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    return newNote.id;
  };

  const deleteWorldbuildingNote = (category: keyof WorldbuildingWithMaps, noteId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          worldbuilding: {
            ...p.worldbuilding,
            [category]: {
              ...p.worldbuilding[category],
              notes: p.worldbuilding[category].notes.filter(n => n.id !== noteId)
            },
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
      maps: [],
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

  const addChapter = (name: string) => {
    if (!currentProject) return;

    const newChapter: Chapter = {
      id: Date.now().toString(),
      name,
      notes: [],
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          story: [...(p.story || []), newChapter],
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    console.log('Added chapter:', name);
  };

  const deleteChapter = (chapterId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          story: (p.story || []).filter((c: Chapter) => c.id !== chapterId),
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    console.log('Deleted chapter:', chapterId);
  };

  const updateScene = (chapterId: string, sceneId: string, content: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const chapters = (p.story || []).map((chapter: Chapter) => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              notes: chapter.notes.map(n =>
                n.id === sceneId ? { ...n, content, updatedAt: Date.now() } : n
              ),
            };
          }
          return chapter;
        });
        return {
          ...p,
          story: chapters,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const addScene = (chapterId: string): string => {
    if (!currentProject) return '';

    const newScene: Note = {
      id: Date.now().toString(),
      content: '',
      updatedAt: Date.now(),
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const chapters = (p.story || []).map((chapter: Chapter) => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              notes: [...chapter.notes, newScene],
            };
          }
          return chapter;
        });
        return {
          ...p,
          story: chapters,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    console.log('Added scene to chapter:', chapterId);
    return newScene.id;
  };

  const deleteScene = (chapterId: string, sceneId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const chapters = (p.story || []).map((chapter: Chapter) => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              notes: chapter.notes.filter(n => n.id !== sceneId),
            };
          }
          return chapter;
        });
        return {
          ...p,
          story: chapters,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    console.log('Deleted scene:', sceneId);
  };

  const searchNotes = (query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    projects.forEach(project => {
      // Search worldbuilding notes
      Object.entries(project.worldbuilding).forEach(([category, data]) => {
        data.notes.forEach(note => {
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

      // Search story chapters
      if (project.story) {
        project.story.forEach(chapter => {
          chapter.notes.forEach(note => {
            if (note.content.toLowerCase().includes(lowerQuery)) {
              results.push({
                projectId: project.id,
                projectName: project.name,
                section: 'Story',
                category: chapter.name,
                noteId: note.id,
                content: note.content,
                preview: getPreview(note.content, lowerQuery),
              });
            }
          });
        });
      }
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

  const getMaps = (): Map[] => {
    if (!currentProject) return [];
    return currentProject.maps || [];
  };

  const getMap = (mapId: string): Map | undefined => {
    if (!currentProject) return undefined;
    return currentProject.maps?.find(m => m.id === mapId);
  };

  const addMap = (name: string): string => {
    if (!currentProject) return '';

    const newMap: Map = {
      id: Date.now().toString(),
      name,
      paths: [],
      markers: [],
      createdAt: Date.now(),
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          maps: [...(p.maps || []), newMap],
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    return newMap.id;
  };

  const deleteMap = (mapId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          maps: (p.maps || []).filter(m => m.id !== mapId),
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const updateMapData = (mapId: string, paths: DrawPath[], markers: MapMarker[]) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          maps: (p.maps || []).map(m =>
            m.id === mapId ? { ...m, paths, markers } : m
          ),
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  // Worldbuilding map functions
  const addWorldbuildingMap = (category: keyof WorldbuildingWithMaps, name: string): string => {
    if (!currentProject) return '';

    const newMap: Map = {
      id: Date.now().toString(),
      name,
      paths: [],
      markers: [],
      createdAt: Date.now(),
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          worldbuilding: {
            ...p.worldbuilding,
            [category]: {
              ...p.worldbuilding[category],
              maps: [...p.worldbuilding[category].maps, newMap]
            },
          },
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
    return newMap.id;
  };

  const deleteWorldbuildingMap = (category: keyof WorldbuildingWithMaps, mapId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          worldbuilding: {
            ...p.worldbuilding,
            [category]: {
              ...p.worldbuilding[category],
              maps: p.worldbuilding[category].maps.filter(m => m.id !== mapId)
            },
          },
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  const getWorldbuildingMap = (category: keyof WorldbuildingWithMaps, mapId: string): Map | undefined => {
    if (!currentProject) return undefined;
    return currentProject.worldbuilding[category].maps.find(m => m.id === mapId);
  };

  const updateWorldbuildingMapData = (category: keyof WorldbuildingWithMaps, mapId: string, paths: DrawPath[], markers: MapMarker[]) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          worldbuilding: {
            ...p.worldbuilding,
            [category]: {
              ...p.worldbuilding[category],
              maps: p.worldbuilding[category].maps.map(m =>
                m.id === mapId ? { ...m, paths, markers } : m
              )
            },
          },
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCurrentProject(updatedProjects.find(p => p.id === currentProject.id) || null);
  };

  // Custom category map functions
  const addCustomCategoryMap = (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, name: string): string => {
    if (!currentProject) return '';

    const newMap: Map = {
      id: Date.now().toString(),
      name,
      paths: [],
      markers: [],
      createdAt: Date.now(),
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const categories = p[section].map((cat: CustomCategory) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              maps: [...cat.maps, newMap],
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
    return newMap.id;
  };

  const deleteCustomCategoryMap = (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, mapId: string) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const categories = p[section].map((cat: CustomCategory) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              maps: cat.maps.filter(m => m.id !== mapId),
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

  const getCustomCategoryMap = (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, mapId: string): Map | undefined => {
    if (!currentProject) return undefined;
    const category = currentProject[section].find((c: CustomCategory) => c.id === categoryId);
    return category?.maps.find(m => m.id === mapId);
  };

  const updateCustomCategoryMapData = (section: 'characters' | 'settings' | 'miscellaneous', categoryId: string, mapId: string, paths: DrawPath[], markers: MapMarker[]) => {
    if (!currentProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        const categories = p[section].map((cat: CustomCategory) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              maps: cat.maps.map(m =>
                m.id === mapId ? { ...m, paths, markers } : m
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
        addChapter,
        deleteChapter,
        updateScene,
        addScene,
        deleteScene,
        searchNotes,
        getMaps,
        getMap,
        addMap,
        deleteMap,
        updateMapData,
        addWorldbuildingMap,
        deleteWorldbuildingMap,
        getWorldbuildingMap,
        updateWorldbuildingMapData,
        addCustomCategoryMap,
        deleteCustomCategoryMap,
        getCustomCategoryMap,
        updateCustomCategoryMapData,
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
