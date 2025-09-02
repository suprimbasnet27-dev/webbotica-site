"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Save, Trash2, Edit3, MessageSquare, Zap, Smile, User, Heart, Clock, Mail, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';

const MessageCreator = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [outputMessage, setOutputMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState('formal');
  const [selectedPlatform, setSelectedPlatform] = useState('email');
  const [mode, setMode] = useState('transform'); // 'transform' or 'reply'
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load templates from memory on component mount
  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem('messageTemplates') || '[]');
    setTemplates(savedTemplates);
  }, []);

  const tones = [
    { id: 'formal', label: 'Formal', icon: User, description: 'Professional and respectful' },
    { id: 'funny', label: 'Funny', icon: Smile, description: 'Light-hearted and humorous' },
    { id: 'friendly', label: 'Friendly', icon: Heart, description: 'Warm and approachable' },
    { id: 'professional', label: 'Professional', icon: Edit3, description: 'Business-focused and polished' },
    { id: 'casual', label: 'Casual', icon: MessageCircle, description: 'Relaxed and informal' },
    { id: 'enthusiastic', label: 'Enthusiastic', icon: Zap, description: 'Energetic and excited' }
  ];

  const platforms = [
    { id: 'email', label: 'Email', icon: Mail, format: 'email' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, format: 'social' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, format: 'social' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, format: 'professional' },
    { id: 'messenger', label: 'Messenger', icon: MessageCircle, format: 'chat' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, format: 'chat' }
  ];

  const processMessage = async () => {
    if (!inputMessage.trim()) {
      alert('Please enter a message first!');
      return;
    }

    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/ai/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          tone: selectedTone,
          platform: selectedPlatform,
          mode: mode
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const result = data.choices?.[0]?.message?.content?.trim();

      if (!result) {
        console.error('API Response:', data);
        throw new Error('No message returned from API.');
      }

      setOutputMessage(result);
    } catch (error) {
      console.error('Error processing message:', error);
      if (error.message.includes('404')) {
        alert('Backend API not found. Please ensure your backend server is running at /api/ai/groq');
      } else if (error.message.includes('401')) {
        alert('API authentication failed. Check GROQ_API_KEY environment variable on backend.');
      } else if (error.message.includes('429')) {
        alert('Rate limit exceeded. Please wait before trying again.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
    
    setIsProcessing(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Copy failed. Please copy manually.');
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name!');
      return;
    }
    
    const newTemplate = {
      id: Date.now(),
      name: templateName,
      tone: selectedTone,
      platform: selectedPlatform,
      mode: mode,
      createdAt: new Date().toLocaleDateString()
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('messageTemplates', JSON.stringify(updatedTemplates));
    setTemplateName('');
    alert('Template saved successfully!');
  };

  const loadTemplate = (template) => {
    setSelectedTone(template.tone);
    setSelectedPlatform(template.platform);
    setMode(template.mode);
    setShowTemplates(false);
  };

  const deleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('messageTemplates', JSON.stringify(updatedTemplates));
  };

  const getPlatformIcon = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    const Icon = platform?.icon || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  const getToneIcon = (toneId) => {
    const tone = tones.find(t => t.id === toneId);
    const Icon = tone?.icon || User;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Message Creator</h1>
          <p className="text-gray-600">Transform your messages with AI-powered tone and platform optimization</p>
        </div>

        {/* API Status Section */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">⚡ Powered by Groq + Llama 3</h3>
          <p className="text-sm text-green-700">
            This app uses Groq's lightning-fast API with Meta's Llama 3 model for instant, high-quality message transformation.
            API key is securely managed via backend environment variables.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('transform')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              mode === 'transform' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Edit3 className="w-5 h-5 inline mr-2" />
            Rewrite Message
          </button>
          <button
            onClick={() => setMode('reply')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              mode === 'reply' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline mr-2" />
            Generate Reply
          </button>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === 'transform' ? 'Your Message:' : 'Message to Reply To:'}
          </label>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={mode === 'transform' ? 'Paste your message here...' : 'Paste the message you want to reply to...'}
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Tone:</label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map((tone) => {
                const Icon = tone.icon;
                return (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      selectedTone === tone.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tone.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{tone.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Platform:</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedPlatform === platform.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{platform.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={processMessage}
            disabled={isProcessing || !inputMessage.trim()}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <>
                {mode === 'transform' ? <Edit3 className="w-5 h-5 inline mr-2" /> : <MessageSquare className="w-5 h-5 inline mr-2" />}
                {mode === 'transform' ? 'Rewrite Message' : 'Generate Reply'}
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            <Clock className="w-5 h-5 inline mr-2" />
            Templates
          </button>
        </div>

        {/* Template Management */}
        {showTemplates && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Saved Templates</h3>
            
            {/* Save Current Settings */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Current
              </button>
            </div>

            {/* Template List */}
            <div className="space-y-2">
              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No templates saved yet</p>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {getToneIcon(template.tone)}
                        {getPlatformIcon(template.platform)}
                      </div>
                      <div>
                        <span className="font-medium">{template.name}</span>
                        <div className="text-sm text-gray-500">
                          {template.tone} • {template.platform} • {template.mode} • {template.createdAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadTemplate(template)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Output Section */}
        {outputMessage && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                {mode === 'transform' ? 'Rewritten Message:' : 'Generated Reply:'}
              </label>
              <button
                onClick={() => copyToClipboard(outputMessage)}
                className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap">
              {outputMessage}
            </div>
          </div>
        )}

        {/* Current Settings Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Current Settings:</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              {getToneIcon(selectedTone)}
              <span>Tone: <strong>{tones.find(t => t.id === selectedTone)?.label}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              {getPlatformIcon(selectedPlatform)}
              <span>Platform: <strong>{platforms.find(p => p.id === selectedPlatform)?.label}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <span>Mode: <strong>{mode === 'transform' ? 'Rewrite' : 'Reply'}</strong></span>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Save your most-used combinations as templates for one-click access</li>
            <li>• Different platforms have unique formatting - try the same message across platforms!</li>
            <li>• Use Reply Mode to quickly respond to messages with the perfect tone</li>
            <li>• Formal + Email works great for business communication</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MessageCreator;