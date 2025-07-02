import React, { useState, useEffect, useRef } from 'react';
import { Users, MessageCircle, Edit3, Share2, Video, Mic, MicOff, VideoOff, Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollaborationUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'annotation' | 'system';
}

interface Annotation {
  id: string;
  userId: string;
  userName: string;
  content: string;
  position: { x: number; y: number };
  timestamp: string;
  resolved: boolean;
}

const RealTimeCollaboration: React.FC<{ paperId: string }> = ({ paperId }) => {
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [selectedTool, setSelectedTool] = useState<'cursor' | 'highlight' | 'annotate'>('cursor');
  
  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simulate real-time collaboration setup
    if (isCollaborating) {
      const mockUsers: CollaborationUser[] = [
        { id: '1', name: 'Alice Chen', avatar: '👩‍🔬', status: 'online' },
        { id: '2', name: 'Bob Kumar', avatar: '👨‍🎓', status: 'online' },
        { id: '3', name: 'Carol Smith', avatar: '👩‍🏫', status: 'away' }
      ];
      
      setConnectedUsers(mockUsers);
      
      // Simulate incoming messages
      const messageTimer = setInterval(() => {
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const messages = [
          "This equation looks complex, can someone explain?",
          "I think there's an error in step 3",
          "Great explanation! That makes sense now.",
          "Should we schedule a video call to discuss this?",
          "I've added some annotations to clarify the mechanism"
        ];
        
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          userId: randomUser.id,
          userName: randomUser.name,
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date().toISOString(),
          type: 'text'
        };
        
        setChatMessages(prev => [...prev, newMsg]);
      }, 5000);

      return () => clearInterval(messageTimer);
    }
  }, [isCollaborating]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const startCollaboration = async () => {
    setIsCollaborating(true);
    // In a real app, this would initialize WebRTC and WebSocket connections
  };

  const stopCollaboration = () => {
    setIsCollaborating(false);
    setConnectedUsers([]);
    setChatMessages([]);
    setIsVideoCall(false);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: 'You',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const startVideoCall = async () => {
    setIsVideoCall(true);
    // In a real app, this would initialize WebRTC video call
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const endVideoCall = () => {
    setIsVideoCall(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const addAnnotation = (x: number, y: number) => {
    const annotation: Annotation = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      content: 'New annotation',
      position: { x, y },
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    setAnnotations(prev => [...prev, annotation]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Real-Time Collaboration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isCollaborating ? `${connectedUsers.length} users connected` : 'Start collaborating with peers'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isCollaborating ? (
              <button
                onClick={startCollaboration}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Start Session</span>
              </button>
            ) : (
              <>
                <button
                  onClick={isVideoCall ? endVideoCall : startVideoCall}
                  className={`p-2 rounded-lg transition-colors ${
                    isVideoCall 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                      : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  }`}
                >
                  {isVideoCall ? <PhoneOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </button>
                <button
                  onClick={stopCollaboration}
                  className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  End Session
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isCollaborating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 h-96">
          {/* Main Collaboration Area */}
          <div className="lg:col-span-2 p-4 relative">
            {/* Collaboration Tools */}
            <div className="flex items-center space-x-2 mb-4">
              {[
                { tool: 'cursor', icon: '👆', label: 'Cursor' },
                { tool: 'highlight', icon: '🖍️', label: 'Highlight' },
                { tool: 'annotate', icon: '📝', label: 'Annotate' }
              ].map(({ tool, icon, label }) => (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(tool as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    selectedTool === tool
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{icon}</span>
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>

            {/* Collaborative Canvas */}
            <div 
              className="bg-gray-50 dark:bg-gray-700 rounded-lg h-64 relative overflow-hidden cursor-crosshair"
              onClick={(e) => {
                if (selectedTool === 'annotate') {
                  const rect = e.currentTarget.getBoundingClientRect();
                  addAnnotation(e.clientX - rect.left, e.clientY - rect.top);
                }
              }}
            >
              {/* User Cursors */}
              {connectedUsers.map((user) => (
                user.cursor && (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute pointer-events-none"
                    style={{ left: user.cursor.x, top: user.cursor.y }}
                  >
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        {user.name}
                      </span>
                    </div>
                  </motion.div>
                )
              ))}

              {/* Annotations */}
              {annotations.map((annotation) => (
                <motion.div
                  key={annotation.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute"
                  style={{ left: annotation.position.x, top: annotation.position.y }}
                >
                  <div className="bg-yellow-400 text-black p-2 rounded-lg shadow-lg max-w-xs">
                    <div className="text-xs font-medium mb-1">{annotation.userName}</div>
                    <div className="text-sm">{annotation.content}</div>
                  </div>
                </motion.div>
              ))}

              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Edit3 className="h-8 w-8 mx-auto mb-2" />
                  <p>Collaborative workspace</p>
                  <p className="text-sm">Click to add annotations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="border-l border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Connected Users */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Connected Users</h4>
              <div className="space-y-2">
                {connectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <span className="text-lg">{user.avatar}</span>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        user.status === 'online' ? 'bg-green-500' :
                        user.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Call Area */}
            {isVideoCall && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-full ${
                        isMuted ? 'bg-red-500' : 'bg-gray-700'
                      } text-white`}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      className={`p-2 rounded-full ${
                        !isVideoEnabled ? 'bg-red-500' : 'bg-gray-700'
                      } text-white`}
                    >
                      {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat */}
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </h4>
              </div>
              
              <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                <AnimatePresence>
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        message.userId === 'current-user' ? 'ml-4' : 'mr-4'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        message.userId === 'current-user'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {message.userName}
                        </div>
                        <div className="text-sm">{message.message}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeCollaboration;