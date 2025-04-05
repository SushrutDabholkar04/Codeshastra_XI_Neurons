'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    setDisplayedResponse('');

    try {
      const res = await axios.post('/api/helpChatbot', {
        prompt: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (res.data.success) {
        setResponse(res.data.helpAnswer);
      } else {
        setResponse('Something went wrong.');
      }
    } catch (error) {
      setResponse('Failed to fetch help. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Typing animation effect
  useEffect(() => {
    if (!response) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedResponse((prev) => prev + response[i]);
      i++;
      if (i >= response.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [response]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">
        What help do you need?
      </h1>

      <Textarea
        className="w-full h-32 mb-4 resize-none shadow-lg"
        placeholder="Ask me anything about the Scanner app..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="flex justify-center mb-4">
        <Button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 bg-gray-100 p-4 rounded-lg shadow animate-pulse"
          >
            <p className="text-gray-500">Typing...</p>
          </motion.div>
        )}

        {displayedResponse && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 bg-white border border-gray-200 p-6 rounded-lg shadow-lg transition-all"
          >
            <h2 className="font-semibold mb-2 text-lg text-gray-800">Response:</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{displayedResponse}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Frequently Asked Questions</h2>
        <ul className="list-disc list-inside space-y-3 text-gray-700 text-base">
          <li>How does the Scan feature work?</li>
          <li>What is the Security section monitoring?</li>
          <li>How can I optimize the storage layout?</li>
          <li>What does Inventory Management show?</li>
          <li>Can I get alerts for object movements?</li>
        </ul>
      </div>
    </div>
  );
}
