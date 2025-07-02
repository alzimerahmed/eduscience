import React, { useState, useEffect } from 'react';
import { Shield, Award, Link, Coins, Users, Globe, Lock, Unlock, Hash, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';

interface BlockchainData {
  userWallet: string;
  nftCertificates: NFTCertificate[];
  achievements: BlockchainAchievement[];
  annotations: BlockchainAnnotation[];
  reputation: number;
  tokens: number;
}

interface NFTCertificate {
  id: string;
  title: string;
  subject: string;
  score: number;
  date: string;
  tokenId: string;
  ipfsHash: string;
  verified: boolean;
}

interface BlockchainAchievement {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  tokenReward: number;
  unlocked: boolean;
  blockHash: string;
}

interface BlockchainAnnotation {
  id: string;
  paperId: string;
  content: string;
  timestamp: string;
  ipfsHash: string;
  votes: number;
  verified: boolean;
}

const BlockchainIntegration: React.FC = () => {
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'certificates' | 'achievements' | 'annotations' | 'wallet'>('certificates');
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    // Simulate blockchain data loading
    const timer = setTimeout(() => {
      setBlockchainData({
        userWallet: '0x742d35Cc6634C0532925a3b8D4C9db4C4b8b8b8b',
        nftCertificates: [
          {
            id: '1',
            title: 'Organic Chemistry Mastery',
            subject: 'Chemistry',
            score: 95,
            date: '2024-01-15',
            tokenId: 'SCP-001',
            ipfsHash: 'QmX7Y8Z9...',
            verified: true
          },
          {
            id: '2',
            title: 'Quantum Mechanics Expert',
            subject: 'Physics',
            score: 88,
            date: '2024-01-10',
            tokenId: 'SCP-002',
            ipfsHash: 'QmA1B2C3...',
            verified: true
          }
        ],
        achievements: [
          {
            id: '1',
            title: 'First Steps',
            description: 'Complete your first blockchain-verified assessment',
            rarity: 'common',
            tokenReward: 10,
            unlocked: true,
            blockHash: '0x123abc...'
          },
          {
            id: '2',
            title: 'Knowledge Validator',
            description: 'Verify 10 peer annotations',
            rarity: 'rare',
            tokenReward: 50,
            unlocked: true,
            blockHash: '0x456def...'
          },
          {
            id: '3',
            title: 'Quantum Scholar',
            description: 'Master quantum mechanics with 95%+ score',
            rarity: 'epic',
            tokenReward: 100,
            unlocked: false,
            blockHash: ''
          }
        ],
        annotations: [
          {
            id: '1',
            paperId: 'paper-123',
            content: 'This mechanism shows clear SN2 characteristics with backside attack.',
            timestamp: '2024-01-20T10:30:00Z',
            ipfsHash: 'QmD4E5F6...',
            votes: 15,
            verified: true
          }
        ],
        reputation: 847,
        tokens: 250
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Generate QR code for wallet address
    if (blockchainData?.userWallet) {
      QRCode.toDataURL(blockchainData.userWallet)
        .then(url => setQrCode(url))
        .catch(err => console.error(err));
    }
  }, [blockchainData]);

  const connectWallet = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      setWalletConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const mintCertificate = async (paperId: string, score: number) => {
    // Simulate NFT minting
    console.log('Minting certificate for paper:', paperId, 'with score:', score);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'rare': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'epic': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!blockchainData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <Shield className="h-8 w-8 text-purple-600 absolute top-4 left-1/2 transform -translate-x-1/2 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Initializing Blockchain Connection
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connecting to decentralized network...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Blockchain Integration</span>
            </h2>
            <p className="text-purple-100">Decentralized learning credentials and achievements</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{blockchainData.tokens}</div>
              <div className="text-sm text-purple-200">SCP Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{blockchainData.reputation}</div>
              <div className="text-sm text-purple-200">Reputation</div>
            </div>
            <button
              onClick={connectWallet}
              disabled={walletConnected || isConnecting}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                walletConnected
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-purple-600 hover:bg-purple-50'
              }`}
            >
              {isConnecting ? 'Connecting...' : walletConnected ? 'Connected' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'certificates', label: 'NFT Certificates', icon: Award },
          { key: 'achievements', label: 'Achievements', icon: Coins },
          { key: 'annotations', label: 'Annotations', icon: Hash },
          { key: 'wallet', label: 'Wallet', icon: Database }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              selectedTab === key
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'certificates' && (
          <motion.div
            key="certificates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {blockchainData.nftCertificates.map((cert) => (
              <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{cert.title}</h3>
                    {cert.verified && <Shield className="h-5 w-5 text-green-300" />}
                  </div>
                  <p className="text-purple-100">{cert.subject}</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                      <div className="text-2xl font-bold text-green-600">{cert.score}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Token ID</div>
                      <div className="text-sm font-mono text-gray-900 dark:text-white">{cert.tokenId}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">IPFS Hash:</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{cert.ipfsHash}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="text-gray-900 dark:text-white">{cert.date}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                    View on OpenSea
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {selectedTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {blockchainData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity.toUpperCase()}
                  </div>
                  {achievement.unlocked ? (
                    <Unlock className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <h3 className={`font-bold mb-2 ${achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      {achievement.tokenReward} SCP
                    </span>
                  </div>
                  {achievement.unlocked && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {achievement.blockHash.substring(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {selectedTab === 'annotations' && (
          <motion.div
            key="annotations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {blockchainData.annotations.map((annotation) => (
              <div key={annotation.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white mb-2">{annotation.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{new Date(annotation.timestamp).toLocaleDateString()}</span>
                      <span className="flex items-center space-x-1">
                        <Hash className="h-3 w-3" />
                        <span className="font-mono">{annotation.ipfsHash}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {annotation.verified && <Shield className="h-4 w-4 text-green-600" />}
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{annotation.votes}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">votes</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                    Upvote
                  </button>
                  <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {selectedTab === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Wallet Information</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Address</div>
                  <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                    {blockchainData.userWallet}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{blockchainData.tokens}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">SCP Tokens</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{blockchainData.nftCertificates.length}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">NFT Certificates</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wallet QR Code</h3>
              <div className="text-center">
                {qrCode && (
                  <img src={qrCode} alt="Wallet QR Code" className="mx-auto mb-4 rounded-lg" />
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan to send tokens or view on blockchain explorer
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlockchainIntegration;