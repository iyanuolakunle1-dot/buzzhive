import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Search, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Messages() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null); // partner user object
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const userId = searchParams.get('to');
    if (userId && userId !== active?.id) {
      openConversationById(userId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!active) return;
    loadThread(active.id);
    pollRef.current = setInterval(() => loadThread(active.id, true), 4000);
    return () => clearInterval(pollRef.current);
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    const res = await api.get('/messages/conversations');
    setConversations(res.data.conversations);
  }

  async function openConversationById(userId) {
    const existing = conversations.find((c) => c.partner.id === userId);
    if (existing) {
      setActive(existing.partner);
      return;
    }
    try {
      const res = await api.get(`/users/id/${userId}`);
      setActive(res.data.user);
    } catch (err) {
      showToast('Could not open that conversation', 'error');
    }
  }

  async function loadThread(partnerId, silent = false) {
    const res = await api.get(`/messages/${partnerId}`);
    setMessages(res.data.messages);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const content = text.trim();
    setText('');
    try {
      await api.post(`/messages/${active.id}`, { content });
      loadThread(active.id);
      loadConversations();
    } catch (err) {
      showToast(err.response?.data?.message || 'Message failed to send', 'error');
      setText(content);
    }
  }

  async function handleSearch(e) {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) return setSearchResults([]);
    const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
    setSearchResults(res.data.users.filter((u) => u.id !== user.id));
  }

  function selectPartner(partner) {
    setActive(partner);
    setQuery('');
    setSearchResults([]);
    setSearchParams({});
  }

  return (
    <div className="max-w-5xl mx-auto flex h-[calc(100vh-128px)] md:h-[calc(100vh-64px)] bg-white dark:bg-hive-panel md:rounded-2xl md:my-4 md:border md:border-gray-200 md:dark:border-hive-border overflow-hidden">
      {/* Conversation list */}
      <div
        className={`${active ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 bg-white dark:bg-hive-panel border-r border-gray-200 dark:border-hive-border`}
      >
        <div className="p-3 border-b border-gray-200 dark:border-hive-border bg-white dark:bg-hive-panel">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input value={query} onChange={handleSearch} placeholder="Search messages..." className="bg-transparent outline-none text-sm w-full text-gray-800 dark:text-gray-100" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin bg-white dark:bg-hive-panel">
          {query && searchResults.map((u) => (
            <button key={u.id} onClick={() => selectPartner(u)} className="flex items-center gap-3 p-3 w-full hover:bg-gray-50 dark:hover:bg-white/5 text-left">
              <div className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : u.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
              </div>
            </button>
          ))}

          {!query && conversations.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-500">No conversations yet. Search for someone to start chatting.</p>
          )}

          {!query && conversations.map((c) => (
            <button
              key={c.partner.id}
              onClick={() => selectPartner(c.partner)}
              className={`flex items-center gap-3 p-3 w-full text-left hover:bg-gray-50 dark:hover:bg-white/5 ${active?.id === c.partner.id ? 'bg-gray-50 dark:bg-white/5' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                {c.partner.avatar ? <img src={c.partner.avatar} className="w-full h-full object-cover" alt="" /> : c.partner.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.partner.name}</p>
                <p className={`text-xs truncate ${c.lastMessage ? 'text-gray-500' : 'text-hive-yellow italic'}`}>
                  {c.lastMessage || 'Say hello 👋'}
                </p>
              </div>
              {c.unread && <span className="w-2 h-2 rounded-full bg-hive-yellow shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className={`${active ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0 bg-white dark:bg-hive-panel`}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm bg-white dark:bg-hive-panel">
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-hive-border bg-white dark:bg-hive-panel shrink-0">
              <button className="md:hidden text-gray-500 dark:text-gray-300 p-1 -ml-1" onClick={() => setActive(null)}>
                <ArrowLeft size={20} />
              </button>
              <div className="w-9 h-9 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                {active.avatar ? <img src={active.avatar} className="w-full h-full object-cover" alt="" /> : active.name[0]}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{active.name}</p>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2 bg-gray-50 dark:bg-hive-dark">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${m.senderId === user.id ? 'bg-hive-yellow text-black' : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-transparent'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-hive-border bg-white dark:bg-hive-panel shrink-0">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100"
              />
              <button type="submit" disabled={!text.trim()} className="p-2.5 rounded-full bg-hive-yellow text-black disabled:opacity-50 shrink-0">
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
