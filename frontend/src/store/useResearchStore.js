import { create } from 'zustand';

const API_BASE = 'http://127.0.0.1:8000/api';
const WS_URL = 'ws://127.0.0.1:8000/api/ws/research';

const initialAgents = {
  search_agent: { id: 'search_agent', name: 'Search Agent', role: 'Retriever', status: 'idle', log: '', avatar: '🔍' },
  reader_agent: { id: 'reader_agent', name: 'Reader Agent', role: 'Scraper', status: 'idle', log: '', avatar: '📖' },
  writer_chain: { id: 'writer_chain', name: 'Writer Agent', role: 'Drafter', status: 'idle', log: '', avatar: '✍️' },
  critic_chain: { id: 'critic_chain', name: 'Critic Agent', role: 'Inspector', status: 'idle', log: '', avatar: '🔬' }
};

export const useResearchStore = create((set, get) => ({
  // UI State
  isSidebarOpen: true,
  isRightPanelOpen: true,
  selectedModel: 'mistral-medium-3-5',
  selectedMode: 'comprehensive',
  activeTab: 'agent-trace', // 'agent-trace' | 'citations' | 'logs'
  
  // Data State
  projects: [],
  activeProjectId: 'proj-1',
  history: [],
  activeSessionId: null,
  messages: [],
  
  // Running State
  isStreaming: false,
  agents: { ...initialAgents },
  logs: [],
  citations: [],
  currentTopic: '',
  ws: null,

  // Setters
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setRightPanelOpen: (isRightPanelOpen) => set({ isRightPanelOpen }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setSelectedMode: (selectedMode) => set({ selectedMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
  
  // Fetch metadata from backend
  fetchMetadata: async () => {
    try {
      const [projRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/projects`),
        fetch(`${API_BASE}/history`)
      ]);
      const projects = await projRes.json();
      const history = await histRes.json();
      set({ projects, history });
      if (history.length > 0 && !get().activeSessionId) {
        set({ activeSessionId: history[0].id });
        // Set mock initial message for the active session
        get().loadSessionMessages(history[0].id, history[0].title);
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  },

  loadSessionMessages: (sessionId, title) => {
    // Generate a beautiful mock research log for existing history
    set({
      activeSessionId: sessionId,
      currentTopic: title,
      messages: [
        { id: '1-u', role: 'user', content: `Please research: ${title}` },
        {
          id: '1-a',
          role: 'assistant',
          content: `Here is the comprehensive report drafted by our multi-agent pipeline on **${title}**.\n\n### Introduction\nThis analysis evaluates the current progress and breakthroughs in the specified domain, synthesizing web-searched indices and clean HTML scrapings.\n\n### Key Findings\n1. **Acceleration of Innovations**: New methodologies developed recently have increased throughput by 35% compared to prior models.\n2. **Commercial Adaptations**: Major players are incorporating this framework directly into their enterprise dashboards.\n3. **Scalability Constraints**: Significant raw resource and training capacity limitations remain open issues.\n\n### Conclusion\nThe findings underscore the rapid evolution of this technology, calling for structured critic checks on data fidelity.\n\n### Sources\n- https://arxiv.org/abs/example\n- https://github.com/trending`,
          criticFeedback: `Score: 8/10\n\nStrengths:\n- Clean structure following recommendations.\n- Identifies key metrics.\n\nAreas to Improve:\n- Include more recent statistical bounds.\n\nOne line verdict:\nA high-quality structured summary of the domain.`,
          score: '8/10'
        }
      ],
      citations: [
        { title: 'Recent Developments in AI', url: 'https://arxiv.org/abs/example', snippet: 'Abstract: This paper describes recent advancements in AI pipelines and multi-agent coordination frameworks.' },
        { title: 'GitHub Trending Repositories', url: 'https://github.com/trending', snippet: 'Trending page showing high activity in agentic tools and workflow automation.' }
      ]
    });
  },

  createNewSession: (title) => {
    const newId = `chat-${Date.now()}`;
    const newSession = {
      id: newId,
      title: title || 'New Research Session',
      project_id: get().activeProjectId,
      date: 'Today'
    };
    
    set((state) => ({
      history: [newSession, ...state.history],
      activeSessionId: newId,
      currentTopic: title || '',
      messages: [],
      citations: [],
      logs: [],
      agents: { ...initialAgents }
    }));
    return newId;
  },

  // WebSocket Streaming trigger
  startResearch: (topic) => {
    if (!topic.trim()) return;
    
    // Close existing socket if open
    const currentWs = get().ws;
    if (currentWs) currentWs.close();

    // Create or select session
    let sessionId = get().activeSessionId;
    if (!sessionId || get().messages.length > 0) {
      sessionId = get().createNewSession(topic);
    } else {
      set({ currentTopic: topic });
    }

    // Append User Message
    const userMsg = { id: `${Date.now()}-user`, role: 'user', content: topic };
    const assistantMsgId = `${Date.now()}-assistant`;
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      criticFeedback: '',
      score: null,
      isStreaming: true
    };

    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsg],
      isStreaming: true,
      logs: [],
      citations: [],
      agents: {
        search_agent: { ...initialAgents.search_agent, status: 'running', log: 'Starting Tavily web search...' },
        reader_agent: { ...initialAgents.reader_agent },
        writer_chain: { ...initialAgents.writer_chain },
        critic_chain: { ...initialAgents.critic_chain }
      }
    }));

    const ws = new WebSocket(WS_URL);
    set({ ws });

    ws.onopen = () => {
      get().addLog('System', 'Connected to Multi-Agent WS server. Launching pipeline...');
      ws.send(JSON.stringify({ topic }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      get().addLog('WS_RECV', JSON.stringify(data));
      get().handleWsEvent(data, assistantMsgId);
    };

    ws.onerror = (err) => {
      get().addLog('ERROR', `WebSocket error encountered: ${err.message || 'Connection failed'}`);
      set({ isStreaming: false });
    };

    ws.onclose = () => {
      get().addLog('System', 'WebSocket connection closed.');
      set({ isStreaming: false, ws: null });
      // Cleanup running agents to idle/completed
      set((state) => {
        const nextAgents = { ...state.agents };
        Object.keys(nextAgents).forEach(k => {
          if (nextAgents[k].status === 'running') {
            nextAgents[k].status = 'completed';
          }
        });
        return { agents: nextAgents };
      });
    };
  },

  handleWsEvent: (data, assistantMsgId) => {
    const { event, agent, status, message, content } = data;

    set((state) => {
      const nextAgents = { ...state.agents };
      const nextMessages = state.messages.map(m => {
        if (m.id !== assistantMsgId) return m;

        const updated = { ...m };
        if (event === 'report_chunk') {
          updated.content += content;
        } else if (event === 'critic_chunk') {
          updated.criticFeedback += content;
          // Dynamically parse score if present
          if (updated.criticFeedback.includes('Score:')) {
            const match = updated.criticFeedback.match(/Score:\s*(\d+\/\d+)/i);
            if (match) updated.score = match[1];
          }
        }
        return updated;
      });

      // Update specific agent statuses
      if (event === 'status' && agent) {
        nextAgents[agent] = {
          ...nextAgents[agent],
          status: status,
          log: message || `${agent} updated to ${status}`
        };
      }

      // Handle search results and parse citations
      let nextCitations = state.citations;
      if (event === 'search_results') {
        nextAgents.search_agent.status = 'completed';
        nextAgents.search_agent.log = 'Web search completed. Identified citations.';
        
        // Parse raw citations from the Tavily string output
        // The output looks like: Title: ... \n URL: ... \n Snippet: ... \n ----
        const searchItems = content.split('----');
        nextCitations = searchItems.map(item => {
          const lines = item.trim().split('\n');
          const titleLine = lines.find(l => l.startsWith('Title:'));
          const urlLine = lines.find(l => l.startsWith('URL:'));
          const snippetLine = lines.find(l => l.startsWith('Snippet:'));

          return {
            title: titleLine ? titleLine.replace('Title:', '').trim() : 'Search Result Source',
            url: urlLine ? urlLine.replace('URL:', '').trim() : '#',
            snippet: snippetLine ? snippetLine.replace('Snippet:', '').trim() : 'View resource details.'
          };
        }).filter(c => c.url !== '#');
      }

      // Scraped content completion
      if (event === 'scraped_content') {
        nextAgents.reader_agent.status = 'completed';
        nextAgents.reader_agent.log = `Scraping content finished. Successfully scraped top source URL.`;
      }

      // Stop streaming visually if system complete
      let nextStreaming = state.isStreaming;
      if (event === 'status' && agent === 'system' && status === 'completed') {
        nextStreaming = false;
        // Turn off streaming for message itself
        const idx = nextMessages.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
          nextMessages[idx].isStreaming = false;
        }
      }

      return {
        agents: nextAgents,
        messages: nextMessages,
        citations: nextCitations,
        isStreaming: nextStreaming
      };
    });
  },

  addLog: (source, content) => {
    const timestamp = new Date().toLocaleTimeString();
    set((state) => ({
      logs: [...state.logs, { id: Math.random(), timestamp, source, content }]
    }));
  },

  regenerateReport: () => {
    const topic = get().currentTopic;
    if (topic) {
      get().startResearch(topic);
    }
  }
}));
