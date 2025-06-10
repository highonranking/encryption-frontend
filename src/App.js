import React, { useState, useEffect } from 'react';
import { Copy, Hash, Key, Settings, RefreshCw } from 'lucide-react'; // Assuming lucide-react is available

const CryptoSignatureGenerator = () => {
  const [partnerId, setPartnerId] = useState('');
  const [partnerKey, setPartnerKey] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Define your backend API URL here
  const API_BASE_URL = 'https://node-encryption.onrender.com';

  // Load default configuration on component mount
  useEffect(() => {
    fetchDefaultConfig();
  }, []);

  const fetchDefaultConfig = async () => {
    try {
      // Use the absolute URL for the API endpoint
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
      setError('Could not fetch default configuration. Using fallback defaults.');
      // Fallback to hardcoded defaults
      const defaultPartnerId = "defaultPartnerID"; // You might want to set meaningful defaults
      const defaultPartnerKey = "defaultPartnerKey"; // if fetching fails
      setPartnerId(defaultPartnerId);
      setPartnerKey(defaultPartnerKey);
      generateSignature(defaultPartnerId, defaultPartnerKey);
    }
  };

  const generateSignature = async (pId = partnerId, pKey = partnerKey) => {
    if (!pId.trim() || !pKey.trim()) {
      setError('Both Partner ID and Partner Key are required');
      setSignature(''); // Clear previous signature if inputs are invalid
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the absolute URL for the API endpoint
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
      setError(`Network error: Could not connect to server or request failed: ${err.message}`);
      setSignature('');
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
      setError('Failed to copy to clipboard. Please copy manually.');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const resetToDefaults = () => {
    fetchDefaultConfig();
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
              Crypto Signature Generator
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate MD5 signatures from Partner ID and Partner Key combinations. 
            Configure your inputs and get instant cryptographic signatures.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Configuration</h2>
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
                  onClick={resetToDefaults}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 transform active:scale-95"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Hash className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">Generated Signature</h2>
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
                  <p className="text-blue-600 text-sm">✓ Signature copied to clipboard!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">How it works</h3>
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
                <p>Values are joined together as: partnerId + partnerKey</p>
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
        </div>
      </div>
    </div>
  );
};

export default CryptoSignatureGenerator;
