import React, { useState, useEffect } from 'react';
import { Copy, Hash, Key, Settings, RefreshCw, User, Lock, Code } from 'lucide-react'; // Added new icons

const CryptoSignatureGenerator = () => {
  // Common states for MD5 and Base64 features
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('md5'); // 'md5' or 'base64'

  // States for MD5 feature
  const [partnerId, setPartnerId] = useState('');
  const [partnerKey, setPartnerKey] = useState('');
  const [signature, setSignature] = useState('');

  // States for Base64 feature
  const [agentId, setAgentId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [base64Output, setBase64Output] = useState('');

  // Define your backend API URL here
  const API_BASE_URL = 'https://node-encryption.onrender.com';

  // Load default configuration on component mount for MD5 tab
  useEffect(() => {
    if (activeTab === 'md5') {
      fetchDefaultConfig();
    } else {
      // Clear MD5 specific errors if switching to Base64 tab
      setError('');
    }
  }, [activeTab]); // Rerun when activeTab changes

  const fetchDefaultConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const config = await response.json();
      setPartnerId(config.partnerId);
      setPartnerKey(config.partnerKey);
      // Auto-generate signature with default values
      generateSignature(config.partnerId, config.partnerKey);
    } catch (err) {
      console.error('Failed to fetch default config:', err);
      setError('Could not fetch default configuration. Using fallback defaults for MD5 tab.');
      // Fallback to hardcoded defaults
      const defaultPartnerId = "defaultPartnerID";
      const defaultPartnerKey = "defaultPartnerKey";
      setPartnerId(defaultPartnerId);
      setPartnerKey(defaultPartnerKey);
      generateSignature(defaultPartnerId, defaultPartnerKey);
    } finally {
      setLoading(false);
    }
  };

  const generateSignature = async (pId = partnerId, pKey = partnerKey) => {
    if (!pId.trim() || !pKey.trim()) {
      setError('Both Partner ID and Partner Key are required for MD5 signature');
      setSignature('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: pId,
          partnerKey: pKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSignature(data.signature);
      } else {
        setError(data.error || 'Failed to generate signature');
        setSignature('');
      }
    } catch (err) {
      setError(`Network error for MD5 signature: Could not connect to server or request failed: ${err.message}`);
      setSignature('');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBase64 = () => {
    if (!agentId.trim() || !username.trim() || !password.trim()) {
      setError('Agent ID, Username, and Password are all required for Base64 encoding.');
      setBase64Output('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const inputString = `${agentId}*${username}:${password}`;
      // Base64 encode the string
      const encodedString = btoa(inputString);
      setBase64Output(encodedString);
    } catch (err) {
      setError(`Error during Base64 encoding: ${err.message}`);
      setBase64Output('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    // Using execCommand for broader compatibility within iframes
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard (execCommand fallback):', err);
      // Fallback if execCommand also fails (e.g., if not supported in context)
      // This will display a temporary message on the UI
      setError('Failed to copy to clipboard. Please copy manually.');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const resetMd5Defaults = () => {
    fetchDefaultConfig();
  };

  const resetBase64Inputs = () => {
    setAgentId('');
    setUsername('');
    setPassword('');
    setBase64Output('');
    setError(''); // Clear any specific error for this tab
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans antialiased">
      {/* Tailwind CSS for Inter font if not already applied globally */}
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hash className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Signature Tools
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A versatile tool for generating MD5 signatures and Base64 encoded strings.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-3 rounded-t-lg font-semibold text-lg transition-colors duration-200 ${
              activeTab === 'md5'
                ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('md5')}
          >
            MD5 Signature
          </button>
          <button
            className={`ml-2 px-6 py-3 rounded-t-lg font-semibold text-lg transition-colors duration-200 ${
              activeTab === 'base64'
                ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('base64')}
          >
            Base64 Encoder
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'md5' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* MD5 Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">MD5 Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner ID
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter Partner ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={partnerKey}
                      onChange={(e) => setPartnerKey(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="Enter Partner Key"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => generateSignature()}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                    Generate Signature
                  </button>
                  
                  <button
                    onClick={resetMd5Defaults}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 transform active:scale-95"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* MD5 Output Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Hash className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Generated MD5 Signature</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MD5 Signature
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={signature}
                      readOnly
                      className="w-full pr-12 py-2 px-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                      placeholder="Signature will appear here..."
                    />
                    {signature && (
                      <button
                        onClick={() => copyToClipboard(signature)}
                        className="absolute right-2 top-2 p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        title="Copy signature"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {signature && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">Input Details:</h3>
                    <div className="space-y-1 text-sm text-green-700">
                      <p><strong>Partner ID:</strong> {partnerId || 'N/A'}</p>
                      <p><strong>Partner Key:</strong> {partnerKey || 'N/A'}</p>
                      <p><strong>Concatenated:</strong> {(partnerId || '') + (partnerKey || '')}</p>
                    </div>
                  </div>
                )}

                {copied && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-600 text-sm">✓ Copied to clipboard!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'base64' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Base64 Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Code className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Base64 Encoder Inputs</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                      placeholder="Enter Agent ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                      placeholder="Enter Username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="password" // Use type="password" for sensitive input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                      placeholder="Enter Password"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleGenerateBase64}
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Code className="w-4 h-4" />
                    )}
                    Generate Base64
                  </button>
                  
                  <button
                    onClick={resetBase64Inputs}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 transform active:scale-95"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Base64 Output Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Code className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Base64 Encoded Output</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base64 String
                  </label>
                  <div className="relative">
                    <textarea
                      value={base64Output}
                      readOnly
                      rows="5" // Added rows for better multi-line display
                      className="w-full pr-12 py-2 px-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-y" // Added resize-y
                      placeholder="Base64 encoded string will appear here..."
                    ></textarea>
                    {base64Output && (
                      <button
                        onClick={() => copyToClipboard(base64Output)}
                        className="absolute right-2 top-2 p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        title="Copy Base64 string"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {base64Output && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-medium text-purple-800 mb-2">Input String Details:</h3>
                    <div className="space-y-1 text-sm text-purple-700">
                      <p><strong>Agent ID:</strong> {agentId || 'N/A'}</p>
                      <p><strong>Username:</strong> {username || 'N/A'}</p>
                      <p><strong>Password:</strong> {password ? '********' : 'N/A'}</p> {/* Mask password */}
                      <p><strong>Concatenated:</strong> {`${agentId || ''}*${username || ''}:${password || ''}`}</p>
                    </div>
                  </div>
                )}

                {copied && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-600 text-sm">✓ Copied to clipboard!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section - Remains the same, but adjusted text for context */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">How it works</h3>
          {activeTab === 'md5' && (
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Input Values</p>
                  <p>Enter your Partner ID and Partner Key</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Concatenation</p>
                  <p>Values are joined as: `partnerId + partnerKey`</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">MD5 Hash</p>
                  <p>The concatenated string is hashed using MD5 algorithm</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'base64' && (
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-semibold text-xs">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Input Credentials</p>
                  <p>Enter Agent ID, Username, and Password</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-semibold text-xs">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">String Formatting</p>
                  <p>Inputs are combined into: `AgentID*Username:Password`</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-semibold text-xs">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Base64 Encoding</p>
                  <p>The formatted string is encoded using Base64</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoSignatureGenerator;
