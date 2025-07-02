import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Share, Image, Bold, Italic, List, ListOrdered, Edit2, Plus, ChevronDown, Trash, Download, MoreHorizontal } from 'lucide-react';

const NotebookInterface: React.FC = () => {
  const [notes, setNotes] = useState<string[]>([
    "# Physics Class Notes\n\nToday we covered the principles of electromagnetism and how it relates to everyday applications.\n\n## Key Concepts:\n\n1. Electric fields\n2. Magnetic fields\n3. Electromagnetic induction\n\n> \"Electricity and magnetism are two aspects of the same force.\" - James Clerk Maxwell",
    "",
    ""
  ]);
  
  const [activeNote, setActiveNote] = useState<number>(0);
  const [notesTitles, setNotesTitles] = useState<string[]>([
    "Physics Notes",
    "Chemistry Formulas",
    "Biology Concepts"
  ]);

  const paperTextureStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f1c376' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundColor: '#F7E6C4',
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = [...notes];
    newNotes[activeNote] = e.target.value;
    setNotes(newNotes);
  };

  return (
    <div className="min-h-screen bg-[#F7E6C4]/30" style={paperTextureStyle}>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Toolbar */}
            <div className="border-b border-[#F1C376]/50 bg-[#F7E6C4]/50 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <button className="p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300">
                  <Bold className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300">
                  <Italic className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300">
                  <List className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300">
                  <ListOrdered className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#F1C376]/20 text-[#424769] transition-colors duration-300">
                  <Image className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button 
                  className="flex items-center px-3 py-1.5 bg-[#F1C376] rounded-lg text-[#424769] font-medium text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>Save</span>
                </motion.button>
                <motion.button 
                  className="flex items-center px-3 py-1.5 bg-[#424769] rounded-lg text-[#F7E6C4] font-medium text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share className="w-4 h-4 mr-1.5" />
                  <span>Share</span>
                </motion.button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex h-[600px]">
              {/* Notes List */}
              <div className="w-64 bg-[#F7E6C4]/50 border-r border-[#F1C376]/50 overflow-y-auto">
                <div className="p-4">
                  <div className="mb-4">
                    <motion.button 
                      className="w-full flex items-center justify-center px-3 py-2 bg-[#424769] rounded-lg text-[#F7E6C4] font-medium text-sm"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      <span>New Note</span>
                    </motion.button>
                  </div>
                  
                  {notesTitles.map((title, index) => (
                    <motion.div 
                      key={index}
                      className={`p-3 mb-2 rounded-lg cursor-pointer flex items-center justify-between ${
                        activeNote === index 
                          ? 'bg-[#F1C376]/40 text-[#424769]' 
                          : 'hover:bg-[#F1C376]/20 text-[#424769]'
                      }`}
                      onClick={() => setActiveNote(index)}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center">
                        <Edit2 className="w-4 h-4 mr-2 opacity-70" />
                        <span className="font-medium">{title}</span>
                      </div>
                      <button className="opacity-50 hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Note Editor */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-[#F1C376]/50">
                  <input 
                    type="text"
                    value={notesTitles[activeNote]}
                    onChange={(e) => {
                      const newTitles = [...notesTitles];
                      newTitles[activeNote] = e.target.value;
                      setNotesTitles(newTitles);
                    }}
                    className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none text-[#424769] placeholder-[#424769]/50"
                    placeholder="Note Title"
                  />
                </div>
                
                <motion.div 
                  className="flex-1 overflow-y-auto px-8 py-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  key={activeNote}
                >
                  <textarea
                    value={notes[activeNote]}
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
                      <Trash className="w-4 h-4 mr-1" />
                      <span>Delete</span>
                    </button>
                  </div>
                  <div>Last edited: Today, 2:45 PM</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotebookInterface;