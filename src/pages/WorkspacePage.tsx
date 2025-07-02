import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Share, Image, Bold, Italic, List, ListOrdered, Edit2, Plus, ChevronDown, Trash, Download, MoreHorizontal, File, Folder, Search, Tag, Clock, SortAsc as SortAscending, Users, Cloud, Star } from 'lucide-react';

const WorkspacePage: React.FC = () => {
  // State for notes management
  const [notes, setNotes] = useState<string[]>([
    "# Physics Class Notes\n\nToday we covered the principles of electromagnetism and how it relates to everyday applications.\n\n## Key Concepts:\n\n1. Electric fields\n2. Magnetic fields\n3. Electromagnetic induction\n\n> \"Electricity and magnetism are two aspects of the same force.\" - James Clerk Maxwell",
    "# Chemical Bonds\n\nChemical bonds are forces that hold atoms together to form molecules or compounds. The main types of bonds are ionic, covalent, and metallic bonds.\n\n## Types of Chemical Bonds:\n\n- **Ionic Bonds**: Form between metals and non-metals\n- **Covalent Bonds**: Form between non-metals\n- **Metallic Bonds**: Form between metals\n\n![Bond Types](https://example.com/bond-types.jpg)",
    "# Biology Notes: Photosynthesis\n\nPhotosynthesis is the process used by plants, algae and certain bacteria to convert light energy, normally from the Sun, into chemical energy.\n\n```\n6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂\n```\n\n## Stages of Photosynthesis\n\n1. Light-dependent reactions\n2. Calvin cycle (light-independent reactions)"
  ]);
  
  const [activeNote, setActiveNote] = useState<number>(0);
  const [notesTitles, setNotesTitles] = useState<string[]>([
    "Physics Notes",
    "Chemistry Bonds",
    "Biology: Photosynthesis"
  ]);
  const [folders, setFolders] = useState<string[]>([
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics"
  ]);
  const [tags, setTags] = useState<string[]>([
    "Important",
    "Exam",
    "Revision",
    "Concepts",
    "Formulas"
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'modified'>('modified');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(true);
  const [collaborators, setCollaborators] = useState<string[]>(["Jane Doe", "John Smith"]);
  const [isCollaborationActive, setIsCollaborationActive] = useState(false);

  // Rich text editor controls
  const [isEditing, setIsEditing] = useState(true);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!isLoading) {
      const saveTimer = setTimeout(() => {
        if (!isSaved) {
          handleSave();
        }
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [notes, activeNote, isSaved]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = [...notes];
    newNotes[activeNote] = e.target.value;
    setNotes(newNotes);
    setIsSaved(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitles = [...notesTitles];
    newTitles[activeNote] = e.target.value;
    setNotesTitles(newTitles);
    setIsSaved(false);
  };

  const handleSave = () => {
    // Simulate save to database
    console.log('Saving note:', notesTitles[activeNote], notes[activeNote]);
    setIsSaved(true);
  };

  const handleNewNote = () => {
    if (!newNoteTitle.trim()) return;
    
    setNotes([...notes, '# ' + newNoteTitle + '\n\n']);
    setNotesTitles([...notesTitles, newNoteTitle]);
    setActiveNote(notes.length);
    setShowNewNoteDialog(false);
    setNewNoteTitle('');
  };

  const handleDeleteNote = (index: number) => {
    const newNotes = [...notes];
    const newTitles = [...notesTitles];
    
    newNotes.splice(index, 1);
    newTitles.splice(index, 1);
    
    setNotes(newNotes);
    setNotesTitles(newTitles);
    
    if (activeNote >= newNotes.length) {
      setActiveNote(newNotes.length - 1);
    }
  };

  const handleTextFormat = (format: 'bold' | 'italic' | 'list' | 'ordered-list') => {
    const textarea = document.getElementById('note-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = end;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = start + formattedText.length;
        setIsBold(!isBold);
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = start + formattedText.length;
        setIsItalic(!isItalic);
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        newCursorPos = start + formattedText.length;
        break;
      case 'ordered-list':
        formattedText = selectedText.split('\n').map((line, i) => `${i+1}. ${line}`).join('\n');
        newCursorPos = start + formattedText.length;
        break;
    }
    
    const newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    
    const newNotes = [...notes];
    newNotes[activeNote] = newText;
    setNotes(newNotes);
    setIsSaved(false);
    
    // Reset the cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toggleCollaboration = () => {
    setIsCollaborationActive(!isCollaborationActive);
  };

  const paperTextureStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f1c376' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundColor: '#F7E6C4',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0C22] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#E68A49] border-t-[#8494FF] rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 bg-[#8494FF] rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-[#E68A49] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7E6C4]/30" style={paperTextureStyle}>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Toolbar */}
            <div className="border-b border-[#F1C376]/50 bg-[#F7E6C4]/50 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <button 
                  className={`p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300 ${isBold ? 'bg-[#F1C376]/30' : ''}`}
                  onClick={() => handleTextFormat('bold')}
                >
                  <Bold className="w-5 h-5" />
                </button>
                <button 
                  className={`p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300 ${isItalic ? 'bg-[#F1C376]/30' : ''}`}
                  onClick={() => handleTextFormat('italic')}
                >
                  <Italic className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300"
                  onClick={() => handleTextFormat('list')}
                >
                  <List className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300"
                  onClick={() => handleTextFormat('ordered-list')}
                >
                  <ListOrdered className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300"
                >
                  <Image className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`text-xs ${isSaved ? 'text-green-600' : 'text-amber-600'}`}>
                  {isSaved ? 'Saved' : 'Unsaved changes...'}
                </div>
                <motion.button 
                  className="flex items-center px-3 py-1.5 bg-[#F1C376] rounded-lg text-[#424769] font-medium text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>Save</span>
                </motion.button>
                <motion.button 
                  className={`flex items-center px-3 py-1.5 rounded-lg font-medium text-sm ${
                    isCollaborationActive
                      ? 'bg-green-600 text-white'
                      : 'bg-[#424769] text-[#F7E6C4]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleCollaboration}
                >
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{isCollaborationActive ? 'Collaborating' : 'Collaborate'}</span>
                </motion.button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex h-[calc(100vh-7rem)]">
              {/* Sidebar */}
              <div className="w-64 bg-[#F7E6C4]/50 border-r border-[#F1C376]/50 overflow-y-auto flex flex-col">
                {/* Search */}
                <div className="p-4 border-b border-[#F1C376]/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#424769]/50" />
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/50 border border-[#F1C376]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#424769]/30 text-sm text-[#424769]"
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-4 border-b border-[#F1C376]/30">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center px-3 py-2 bg-[#424769] rounded-lg text-[#F7E6C4] font-medium text-sm"
                    onClick={() => setShowNewNoteDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>New Note</span>
                  </motion.button>
                  
                  <div className="flex items-center justify-between mt-4 text-xs text-[#424769]/70">
                    <span>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent border-none focus:outline-none cursor-pointer"
                    >
                      <option value="modified">Last Modified</option>
                      <option value="title">Title</option>
                      <option value="date">Date Created</option>
                    </select>
                  </div>
                </div>
                
                {/* Folders */}
                <div className="p-4 border-b border-[#F1C376]/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[#424769] text-sm">Folders</h3>
                    <Plus className="w-4 h-4 text-[#424769]/70 cursor-pointer hover:text-[#424769]" />
                  </div>
                  {folders.map((folder, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer mb-1 ${
                        selectedFolder === folder ? 'bg-[#F1C376]/40 text-[#424769]' : 'hover:bg-[#F1C376]/20 text-[#424769]/70'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="text-sm">{folder}</span>
                    </div>
                  ))}
                </div>
                
                {/* Tags */}
                <div className="p-4 border-b border-[#F1C376]/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[#424769] text-sm">Tags</h3>
                    <Plus className="w-4 h-4 text-[#424769]/70 cursor-pointer hover:text-[#424769]" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`flex items-center text-xs px-2 py-1 rounded-full cursor-pointer ${
                          selectedTag === tag ? 'bg-[#424769] text-[#F7E6C4]' : 'bg-[#F1C376]/30 text-[#424769] hover:bg-[#F1C376]/50'
                        }`}
                      >
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="font-medium text-[#424769] text-sm mb-2">My Notes</h3>
                  {notesTitles.map((title, index) => (
                    <motion.div 
                      key={index}
                      className={`p-3 mb-2 rounded-lg cursor-pointer flex items-center justify-between ${
                        activeNote === index 
                          ? 'bg-[#F1C376]/40 text-[#424769]' 
                          : 'hover:bg-[#F1C376]/20 text-[#424769]/80'
                      }`}
                      onClick={() => setActiveNote(index)}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center">
                        <File className="w-4 h-4 mr-2 opacity-70" />
                        <span className="font-medium text-sm truncate max-w-[120px]">{title}</span>
                      </div>
                      <button 
                        className="opacity-50 hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(index);
                        }}
                      >
                        <Trash className="w-4 h-4 text-red-600" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Note Editor */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Note Title */}
                <div className="px-8 py-6 border-b border-[#F1C376]/50">
                  <input 
                    type="text"
                    value={notesTitles[activeNote] || ''}
                    onChange={handleTitleChange}
                    className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none text-[#424769] placeholder-[#424769]/50"
                    placeholder="Note Title"
                  />
                  <div className="flex items-center text-xs text-[#424769]/70 mt-2 space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Last edited: Today, 2:45 PM</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      <span>Physics, Exam</span>
                    </div>
                  </div>
                </div>
                
                {/* Collaboration Banner */}
                {isCollaborationActive && (
                  <div className="px-6 py-2 bg-green-100 text-green-800 border-b border-green-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Collaboration Active</span>
                      <span className="ml-2 text-xs bg-white/50 px-2 py-0.5 rounded-full">{collaborators.length + 1} people</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {collaborators.map((name, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                          {name.charAt(0)}
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        Y
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Editor */}
                <motion.div 
                  className="flex-1 overflow-y-auto px-8 py-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  key={activeNote}
                >
                  <textarea
                    id="note-editor"
                    value={notes[activeNote] || ''}
                    onChange={handleNoteChange}
                    className="w-full h-full resize-none bg-transparent border-none focus:outline-none text-[#424769] font-serif leading-relaxed placeholder-[#424769]/40"
                    placeholder="Start writing your notes here..."
                    style={{ 
                      backgroundImage: 'linear-gradient(transparent, transparent 39px, #F1C376 40px)',
                      backgroundSize: '100% 40px',
                      lineHeight: '40px'
                    }}
                  />
                </motion.div>
                
                {/* Footer */}
                <div className="px-8 py-3 border-t border-[#F1C376]/50 bg-[#F7E6C4]/50 flex justify-between items-center text-sm text-[#424769]/70">
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center hover:text-[#424769] transition-colors">
                      <Download className="w-4 h-4 mr-1" />
                      <span>Export</span>
                    </button>
                    <button className="flex items-center hover:text-[#424769] transition-colors">
                      <Cloud className="w-4 h-4 mr-1" />
                      <span>Save to Cloud</span>
                    </button>
                    <button className="flex items-center hover:text-[#424769] transition-colors">
                      <Star className="w-4 h-4 mr-1" />
                      <span>Favorite</span>
                    </button>
                  </div>
                  <div className="text-xs">Markdown supported</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* New Note Dialog */}
      {showNewNoteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-[#424769] mb-4">Create New Note</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter note title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#424769] focus:border-transparent mb-4"
            />
            <div className="flex space-x-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#424769] focus:border-transparent bg-white">
                <option value="">Select folder</option>
                {folders.map((folder, i) => (
                  <option key={i} value={folder}>{folder}</option>
                ))}
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#424769] focus:border-transparent bg-white">
                <option value="">Add tags</option>
                {tags.map((tag, i) => (
                  <option key={i} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewNoteDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNewNote}
                className="px-4 py-2 bg-[#424769] text-white rounded-lg hover:bg-[#35395A]"
                disabled={!newNoteTitle.trim()}
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;