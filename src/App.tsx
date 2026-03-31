import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronRight, 
  Download, 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  Briefcase, 
  Home as HomeIcon,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Heart,
  Cpu,
  Palette,
  Plus,
  Trash2,
  Save,
  Settings,
  LogOut,
  LogIn
} from 'lucide-react';
import { Career, QuizQuestion } from './types';
import { QUIZ_QUESTIONS } from './data';
import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  handleFirestoreError,
  OperationType
} from './firebase';

const LOGO_URL = "https://storage.googleapis.com/maker-artifacts/cyeo2u62hyiadunysrztg5/1713452554625.png";
const ADMIN_CREDENTIALS = {
  username: 'admin_stemvolve',
  password: 'stemvolve123password'
};

// --- Types ---
interface AppData {
  careers: Career[];
  resources: { title: string; desc: string; tag: string }[];
  team: { name: string; role: string; bio: string }[];
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab, isAdmin, onLoginClick, onLogout }: { 
  activeTab: string, 
  setActiveTab: (tab: string) => void, 
  isAdmin: boolean,
  onLoginClick: () => void,
  onLogout: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const tabs = [
    { id: 'home', label: 'HOME' },
    { id: 'careers', label: 'CAREERS' },
    { id: 'quiz', label: 'QUIZ' },
    { id: 'resources', label: 'RESOURCES' },
    { id: 'team', label: 'OUR TEAM' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'ADMIN' });
  }

  return (
    <nav className="bg-cream border-b border-navy/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <img src={LOGO_URL} alt="STEMvolve" className="h-12 w-12 object-contain" referrerPolicy="no-referrer" />
            <span className="text-2xl font-serif font-bold text-navy tracking-tight">STEMvolve</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id as string}
                onClick={() => setActiveTab(tab.id as string)}
                className={`text-xs font-bold tracking-widest transition-colors ${
                  activeTab === tab.id ? 'text-navy border-b-2 border-navy' : 'text-navy/70 hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
            {isAdmin ? (
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-xs font-bold tracking-widest text-navy hover:opacity-60"
              >
                LOGOUT <LogOut size={14} />
              </button>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 text-xs font-bold tracking-widest text-navy hover:opacity-60"
              >
                ADMIN LOGIN <LogIn size={14} />
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-navy">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-yellow border-t border-navy/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id as string}
                  onClick={() => {
                    setActiveTab(tab.id as string);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-4 text-sm font-bold tracking-widest text-navy hover:bg-navy/5"
                >
                  {tab.label}
                </button>
              ))}
              {isAdmin ? (
                <button 
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-4 text-sm font-bold tracking-widest text-navy hover:bg-navy/5"
                >
                  LOGOUT
                </button>
              ) : (
                <button 
                  onClick={() => {
                    onLoginClick();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-4 text-sm font-bold tracking-widest text-navy hover:bg-navy/5"
                >
                  ADMIN LOGIN
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (u: string, p: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      onLogin(username, password);
      onClose();
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-cream w-full max-w-md p-8 rounded-lg shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-navy/40 hover:text-navy">
          <X size={24} />
        </button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Settings className="text-yellow w-12 h-12" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-navy">Admin Login</h2>
          <p className="text-navy/60 text-sm mt-2 tracking-wide">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-navy/40 mb-2">Username</label>
            <input 
              type="text"
              required
              className="w-full p-3 border border-navy/10 bg-white text-navy focus:outline-none focus:border-yellow transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-navy/40 mb-2">Password</label>
            <input 
              type="password"
              required
              className="w-full p-3 border border-navy/10 bg-white text-navy focus:outline-none focus:border-yellow transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-xs font-bold tracking-tight text-center">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-navy text-cream font-bold tracking-[0.2em] hover:bg-navy/90 transition-all"
          >
            LOGIN TO DASHBOARD
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Home = ({ onStartQuiz, onExploreCareers }: { onStartQuiz: () => void, onExploreCareers: () => void }) => (
  <div className="min-h-[calc(100vh-80px)] bg-navy flex flex-col items-center justify-center text-center px-4 py-20 grain">
    <motion.div className="max-w-4xl">
      <h1 className="text-6xl md:text-9xl font-serif text-white leading-tight mb-8 animate-slam opacity-0">
        Find your path.<br />
        <span className="italic text-cream">Own your future.</span>
      </h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-white text-lg md:text-xl font-medium tracking-widest uppercase mb-12 max-w-2xl mx-auto"
      >
        STEMvolve helps middle & high school students aged 11–18 discover their dream career — before it's too late.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col sm:flex-row gap-6 justify-center"
      >
        <button 
          onClick={onStartQuiz}
          className="px-10 py-4 border-2 border-white text-white font-bold tracking-[0.2em] hover:bg-white hover:text-navy transition-all duration-300"
        >
          TAKE QUIZ
        </button>
        <button 
          onClick={onExploreCareers}
          className="px-10 py-4 border-2 border-white text-white font-bold tracking-[0.2em] hover:bg-white hover:text-navy transition-all duration-300"
        >
          EXPLORE CAREERS
        </button>
      </motion.div>
    </motion.div>
  </div>
);

const CareersList = ({ careers, onSelectCareer }: { careers: Career[], onSelectCareer: (c: Career) => void }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'STEM' | 'Non-STEM'>('All');

  const filtered = careers.filter(c => 
    (filter === 'All' || c.category === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.subCategory.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-navy text-cream p-8 md:p-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-8xl font-serif mb-12 text-white">Careers</h2>
        
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/50" />
            <input 
              type="text"
              placeholder="Search careers, skills, or fields..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-2 border-cream/30 rounded-none py-4 pl-12 pr-4 focus:border-white outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'STEM', 'Non-STEM'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-4 border-2 transition-all font-bold tracking-widest text-xs ${
                  filter === f ? 'bg-white text-navy border-white' : 'border-cream/30 text-cream hover:border-cream'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((career, idx) => (
            <motion.div
              layout
              key={career.id}
              onClick={() => onSelectCareer(career)}
              className={`group border border-cream/20 p-8 cursor-pointer hover:bg-cream hover:text-navy transition-all duration-500 ${
                idx % 4 === 0 ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold tracking-[0.3em] opacity-60 uppercase">{career.subCategory}</span>
                {career.category === 'STEM' ? <Cpu size={16} className="text-navy" /> : <Palette size={16} className="text-yellow" />}
              </div>
              <h3 className="text-4xl font-serif mb-4">{career.name}</h3>
              <p className="text-lg opacity-70 line-clamp-2 mb-6">{career.responsibilities[0]}</p>
              <div className="flex items-center gap-2 font-bold text-xs tracking-widest">
                VIEW DETAILS <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ data, onSave }: { data: AppData, onSave: (newData: AppData) => void }) => {
  const [localData, setLocalData] = useState<AppData>(data);
  const [activeSection, setActiveSection] = useState<'careers' | 'resources' | 'team'>('careers');

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const addCareer = () => {
    const newCareer: Career = {
      id: `career-${Date.now()}`,
      name: 'New Career',
      category: 'STEM',
      subCategory: 'General',
      responsibilities: ['Responsibility 1', 'Responsibility 2'],
      skills: ['Skill 1', 'Skill 2'],
      education: 'Bachelor\'s Degree in...',
      environment: 'Office/Lab environment...',
      salary: '$70,000 - $120,000',
      outlook: 'Stable growth (5-10%)',
      pros: ['High demand', 'Good salary'],
      cons: ['High stress', 'Long hours'],
      tips: 'Focus on networking and internships early on.',
      opportunities: Array(10).fill('').map((_, i) => `Opportunity ${i + 1} (Non-Georgia)`),
      organizations: ['Organization 1', 'Organization 2']
    };
    setLocalData({ ...localData, careers: [...localData.careers, newCareer] });
  };

  const updateCareer = (id: string, field: keyof Career, value: any) => {
    const updated = localData.careers.map(c => c.id === id ? { ...c, [field]: value } : c);
    setLocalData({ ...localData, careers: updated });
  };

  const removeCareer = (id: string) => {
    setLocalData({ ...localData, careers: localData.careers.filter(c => c.id !== id) });
  };

  const addResource = () => {
    const newRes = { title: 'New Resource', desc: '', tag: 'GENERAL' };
    setLocalData({ ...localData, resources: [...localData.resources, newRes] });
  };

  const updateResource = (index: number, field: string, value: string) => {
    const updated = [...localData.resources];
    updated[index] = { ...updated[index], [field]: value };
    setLocalData({ ...localData, resources: updated });
  };

  const removeResource = (index: number) => {
    setLocalData({ ...localData, resources: localData.resources.filter((_, i) => i !== index) });
  };

  const addTeamMember = () => {
    const newMember = { name: 'New Member', role: '', bio: '' };
    setLocalData({ ...localData, team: [...localData.team, newMember] });
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...localData.team];
    updated[index] = { ...updated[index], [field]: value };
    setLocalData({ ...localData, team: updated });
  };

  const removeTeamMember = (index: number) => {
    setLocalData({ ...localData, team: localData.team.filter((_, i) => i !== index) });
  };

  const seedData = async () => {
    if (confirm('This will overwrite current data with default values. Continue?')) {
      const initialData = await fetch('/data.json').then(res => res.json()).catch(() => null);
      if (initialData) {
        onSave(initialData);
      } else {
        alert('Could not find initial data file.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream text-navy p-8 md:p-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-5xl font-serif mb-2 text-navy">Admin Dashboard</h2>
            <p className="text-xs font-bold tracking-widest uppercase opacity-40 italic">Manage your weekly content updates</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={seedData}
              className="px-6 py-4 border-2 border-navy/20 text-xs font-bold tracking-widest hover:bg-navy hover:text-cream transition-all"
            >
              SEED INITIAL DATA
            </button>
            <button 
              onClick={() => onSave(localData)}
              className="flex items-center gap-2 bg-navy text-cream px-8 py-4 font-bold tracking-widest hover:bg-yellow transition-all"
            >
              <Save size={18} /> SAVE ALL CHANGES
            </button>
          </div>
        </div>

        <div className="flex gap-8 mb-12 border-b border-navy/10 pb-4 overflow-x-auto">
          {['careers', 'resources', 'team'].map(s => (
            <button 
              key={s}
              onClick={() => setActiveSection(s as any)}
              className={`text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all ${activeSection === s ? 'text-navy border-b-2 border-navy pb-4 -mb-4' : 'opacity-40 hover:opacity-100'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {activeSection === 'careers' && (
          <div className="space-y-8">
            <button onClick={addCareer} className="flex items-center gap-2 border-2 border-navy px-6 py-3 font-bold text-xs tracking-widest hover:bg-navy hover:text-cream transition-all">
              <Plus size={16} /> ADD NEW CAREER
            </button>
            <div className="grid grid-cols-1 gap-6">
              {localData.careers.map(career => (
                <div key={career.id} className="border border-navy/10 p-8 bg-white shadow-sm">
                  <div className="flex justify-between mb-6">
                    <input 
                      className="text-2xl font-serif bg-transparent border-b border-navy/10 outline-none focus:border-navy w-full mr-4"
                      value={career.name}
                      onChange={(e) => updateCareer(career.id, 'name', e.target.value)}
                      placeholder="Career Name"
                    />
                    <button onClick={() => removeCareer(career.id)} className="text-red-500 hover:opacity-60"><Trash2 size={20} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Category</label>
                      <select 
                        className="w-full p-2 border border-navy/10 text-sm"
                        value={career.category}
                        onChange={(e) => updateCareer(career.id, 'category', e.target.value)}
                      >
                        <option value="STEM">STEM</option>
                        <option value="Non-STEM">Non-STEM</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Sub-Category</label>
                      <input 
                        className="w-full p-2 border border-navy/10 text-sm"
                        value={career.subCategory}
                        onChange={(e) => updateCareer(career.id, 'subCategory', e.target.value)}
                        placeholder="e.g. Engineering"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Salary</label>
                      <input 
                        className="w-full p-2 border border-navy/10 text-sm"
                        value={career.salary}
                        onChange={(e) => updateCareer(career.id, 'salary', e.target.value)}
                        placeholder="e.g. $90k - $120k"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Education</label>
                      <input 
                        className="w-full p-2 border border-navy/10 text-sm"
                        value={career.education}
                        onChange={(e) => updateCareer(career.id, 'education', e.target.value)}
                        placeholder="Expected education..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Job Outlook</label>
                      <input 
                        className="w-full p-2 border border-navy/10 text-sm"
                        value={career.outlook}
                        onChange={(e) => updateCareer(career.id, 'outlook', e.target.value)}
                        placeholder="e.g. 10% growth"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Work Environment</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-20"
                        value={career.environment}
                        onChange={(e) => updateCareer(career.id, 'environment', e.target.value)}
                        placeholder="Describe the work environment..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Tips for Aspiring Professionals</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-20"
                        value={career.tips}
                        onChange={(e) => updateCareer(career.id, 'tips', e.target.value)}
                        placeholder="General advice..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Responsibilities (one per line)</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-32 font-mono"
                        value={career.responsibilities.join('\n')}
                        onChange={(e) => updateCareer(career.id, 'responsibilities', e.target.value.split('\n'))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Skills (one per line)</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-32 font-mono"
                        value={career.skills.join('\n')}
                        onChange={(e) => updateCareer(career.id, 'skills', e.target.value.split('\n'))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Opportunities (one per line)</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-32 font-mono"
                        value={career.opportunities.join('\n')}
                        onChange={(e) => updateCareer(career.id, 'opportunities', e.target.value.split('\n'))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Pros (one per line)</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-32 font-mono"
                        value={career.pros.join('\n')}
                        onChange={(e) => updateCareer(career.id, 'pros', e.target.value.split('\n'))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Cons (one per line)</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-32 font-mono"
                        value={career.cons.join('\n')}
                        onChange={(e) => updateCareer(career.id, 'cons', e.target.value.split('\n'))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Organizations (one per line)</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-32 font-mono"
                        value={career.organizations.join('\n')}
                        onChange={(e) => updateCareer(career.id, 'organizations', e.target.value.split('\n'))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'resources' && (
          <div className="space-y-8">
            <button onClick={addResource} className="flex items-center gap-2 border-2 border-navy px-6 py-3 font-bold text-xs tracking-widest hover:bg-navy hover:text-cream transition-all">
              <Plus size={16} /> ADD NEW RESOURCE
            </button>
            <div className="grid grid-cols-1 gap-6">
              {localData.resources.map((res, i) => (
                <div key={i} className="border border-navy/10 p-8 bg-white shadow-sm">
                  <div className="flex justify-between mb-6">
                    <input 
                      className="text-2xl font-serif bg-transparent border-b border-navy/10 outline-none focus:border-navy w-full mr-4"
                      value={res.title}
                      onChange={(e) => updateResource(i, 'title', e.target.value)}
                      placeholder="Resource Title"
                    />
                    <button onClick={() => removeResource(i)} className="text-red-500 hover:opacity-60"><Trash2 size={20} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Tag</label>
                      <input 
                        className="w-full p-2 border border-navy/10 text-sm"
                        value={res.tag}
                        onChange={(e) => updateResource(i, 'tag', e.target.value)}
                        placeholder="e.g. NETWORKING"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Description</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-20"
                        value={res.desc}
                        onChange={(e) => updateResource(i, 'desc', e.target.value)}
                        placeholder="Short description..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'team' && (
          <div className="space-y-8">
            <button onClick={addTeamMember} className="flex items-center gap-2 border-2 border-navy px-6 py-3 font-bold text-xs tracking-widest hover:bg-navy hover:text-cream transition-all">
              <Plus size={16} /> ADD NEW MEMBER
            </button>
            <div className="grid grid-cols-1 gap-6">
              {localData.team.map((member, i) => (
                <div key={i} className="border border-navy/10 p-8 bg-white shadow-sm">
                  <div className="flex justify-between mb-6">
                    <input 
                      className="text-2xl font-serif bg-transparent border-b border-navy/10 outline-none focus:border-navy w-full mr-4"
                      value={member.name}
                      onChange={(e) => updateTeamMember(i, 'name', e.target.value)}
                      placeholder="Member Name"
                    />
                    <button onClick={() => removeTeamMember(i)} className="text-red-500 hover:opacity-60"><Trash2 size={20} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Role</label>
                      <input 
                        className="w-full p-2 border border-navy/10 text-sm"
                        value={member.role}
                        onChange={(e) => updateTeamMember(i, 'role', e.target.value)}
                        placeholder="e.g. Founder"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest uppercase opacity-40 block mb-2">Bio</label>
                      <textarea 
                        className="w-full p-2 border border-navy/10 text-sm h-20"
                        value={member.bio}
                        onChange={(e) => updateTeamMember(i, 'bio', e.target.value)}
                        placeholder="Short bio..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [data, setData] = useState<AppData>({ careers: [], resources: [], team: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const unsubscribeCareers = onSnapshot(collection(db, 'careers'), (snapshot) => {
      const careers = snapshot.docs.map(doc => doc.data() as Career);
      setData(prev => ({ ...prev, careers }));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'careers');
    });

    const unsubscribeResources = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const resources = snapshot.docs.map(doc => doc.data() as any);
      setData(prev => ({ ...prev, resources }));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'resources');
    });

    const unsubscribeTeam = onSnapshot(collection(db, 'team'), (snapshot) => {
      const team = snapshot.docs.map(doc => doc.data() as any);
      setData(prev => ({ ...prev, team }));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'team');
    });

    return () => {
      unsubscribeCareers();
      unsubscribeResources();
      unsubscribeTeam();
    };
  }, []);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('isAdminAuthenticated', 'true');
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
    if (activeTab === 'admin') setActiveTab('home');
  };

  const handleSave = async (newData: AppData) => {
    try {
      // 1. Handle Careers
      // Delete careers that are no longer in the list
      const currentCareerIds = data.careers.map(c => c.id);
      const newCareerIds = newData.careers.map(c => c.id);
      const toDeleteCareers = currentCareerIds.filter(id => !newCareerIds.includes(id));
      for (const id of toDeleteCareers) {
        await deleteDoc(doc(db, 'careers', id));
      }
      // Save/Update careers
      for (const career of newData.careers) {
        await setDoc(doc(db, 'careers', career.id), career);
      }

      // 2. Handle Resources
      // We use title-based IDs for resources
      const currentResIds = data.resources.map(r => r.title.toLowerCase().replace(/\s+/g, '-'));
      const newResIds = newData.resources.map(r => r.title.toLowerCase().replace(/\s+/g, '-'));
      const toDeleteRes = currentResIds.filter(id => !newResIds.includes(id));
      for (const id of toDeleteRes) {
        await deleteDoc(doc(db, 'resources', id));
      }
      for (const res of newData.resources) {
        const resId = res.title.toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(db, 'resources', resId), res);
      }

      // 3. Handle Team
      const currentTeamIds = data.team.map(m => m.name.toLowerCase().replace(/\s+/g, '-'));
      const newTeamIds = newData.team.map(m => m.name.toLowerCase().replace(/\s+/g, '-'));
      const toDeleteTeam = currentTeamIds.filter(id => !newTeamIds.includes(id));
      for (const id of toDeleteTeam) {
        await deleteDoc(doc(db, 'team', id));
      }
      for (const member of newData.team) {
        const memberId = member.name.toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(db, 'team', memberId), member);
      }

      alert('All changes saved successfully to Firestore!');
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save changes. Check console for details.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-cream gap-4">
      <div className="w-12 h-12 border-4 border-yellow border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold tracking-widest">LOADING...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-cream p-8 text-center">
      <h2 className="text-4xl font-serif mb-4 text-yellow">Something went wrong</h2>
      <p className="text-lg opacity-60 mb-8 max-w-md">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-8 py-3 border-2 border-cream text-cream font-bold tracking-widest hover:bg-cream hover:text-navy transition-all"
      >
        RETRY
      </button>
    </div>
  );

  const renderContent = () => {
    if (selectedCareer) {
      return (
        <CareerDetail 
          career={selectedCareer} 
          onBack={() => setSelectedCareer(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'home': return <Home onStartQuiz={() => setActiveTab('quiz')} onExploreCareers={() => setActiveTab('careers')} />;
      case 'careers': return <CareersList careers={data?.careers || []} onSelectCareer={setSelectedCareer} />;
      case 'quiz': return <Quiz />;
      case 'resources': return <Resources resources={data?.resources || []} />;
      case 'team': return <Team members={data?.team || []} />;
      case 'admin': return <AdminDashboard data={data!} onSave={handleSave} />;
      default: return <Home onStartQuiz={() => setActiveTab('quiz')} onExploreCareers={() => setActiveTab('careers')} />;
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-yellow selection:text-cream">
      <Navbar 
        activeTab={activeTab} 
        isAdmin={isAdminAuthenticated} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCareer(null);
        }} 
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleAdminLogout}
      />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleAdminLogin} 
      />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedCareer?.id || '')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <footer className="bg-navy text-cream/40 py-12 px-8 border-t border-cream/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="STEMvolve" className="h-8 w-8 object-contain" referrerPolicy="no-referrer" />
            <span className="text-lg font-serif font-bold text-white tracking-tight">STEMvolve</span>
          </div>
          <p className="text-xs font-bold tracking-widest uppercase">© 2026 STEMvolve Non-Profit. All Rights Reserved.</p>
          <div className="flex gap-6">
            {['Instagram', 'LinkedIn', 'Twitter'].map(s => (
              <a key={s} href="#" className="text-xs font-bold tracking-widest uppercase hover:text-cream transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Sub-components (Simplified for brevity, but fully functional) ---

const CareerDetail = ({ career, onBack }: { career: Career, onBack: () => void }) => (
  <div className="min-h-screen bg-navy text-cream p-8 md:p-20">
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 font-bold text-xs tracking-widest mb-12 hover:opacity-60">
        <ArrowRight size={14} className="rotate-180" /> BACK TO EXPLORE
      </button>
      <span className="text-xs font-bold tracking-[0.4em] text-cream/60 uppercase block mb-4">{career.category} / {career.subCategory}</span>
      <h2 className="text-6xl md:text-9xl font-serif mb-8 text-white">{career.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-cream/10 pt-12">
        <div className="space-y-12">
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic">Key Responsibilities</h4>
            <ul className="space-y-3">
              {career.responsibilities.map((r, i) => (
                <li key={i} className="flex gap-3 text-lg">
                  <span className="opacity-30 font-serif">{i + 1}.</span> {r}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic">Expected Education</h4>
            <p className="text-lg leading-relaxed">{career.education}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic">Work Environment</h4>
            <p className="text-lg leading-relaxed">{career.environment}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic">Job Outlook</h4>
            <p className="text-lg leading-relaxed">{career.outlook}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic text-green-400">Pros</h4>
              <ul className="space-y-2 text-sm">
                {career.pros.map((p, i) => <li key={i} className="flex gap-2"><span>•</span> {p}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic text-red-400">Cons</h4>
              <ul className="space-y-2 text-sm">
                {career.cons.map((c, i) => <li key={i} className="flex gap-2"><span>•</span> {c}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic text-cream">Skills Needed</h4>
            <div className="flex flex-wrap gap-2">
              {career.skills.map(s => (
                <span key={s} className="px-3 py-1 border border-cream/20 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-2 italic">Salary Overview</h4>
            <p className="text-3xl font-serif text-cream">{career.salary}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic">Tips for Aspiring Professionals</h4>
            <p className="text-lg italic opacity-80 leading-relaxed">"{career.tips}"</p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic">Internships & Volunteering</h4>
            <ul className="space-y-3">
              {career.opportunities.map((o, i) => (
                <li key={i} className="text-sm border-l-2 border-yellow pl-4 py-1">{o}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase opacity-40 mb-4 italic">Clubs & Organizations</h4>
            <div className="flex flex-wrap gap-2">
              {career.organizations.map(org => (
                <span key={org} className="text-xs font-bold tracking-widest uppercase bg-cream/10 px-3 py-1">{org}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (weights: Record<string, number>) => {
    const newScores = { ...scores };
    Object.entries(weights).forEach(([key, value]) => {
      newScores[key] = (newScores[key] || 0) + value;
    });
    setScores(newScores);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const getResult = () => {
    let maxScore = -1;
    let result = 'STEM';
    Object.entries(scores).forEach(([key, value]) => {
      const score = value as number;
      if (score > maxScore) {
        maxScore = score;
        result = key;
      }
    });
    return result;
  };

  if (showResult) {
    const result = getResult();
    return (
      <div className="min-h-screen bg-navy text-cream p-8 md:p-20 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <h2 className="text-xs font-bold tracking-[0.4em] text-yellow uppercase mb-4">Your Result</h2>
          <h3 className="text-6xl md:text-8xl font-serif mb-8 text-white">{result}</h3>
          <p className="text-lg opacity-60 mb-12 leading-relaxed">
            Based on your answers, you have a strong affinity for <span className="text-white font-bold">{result}</span>. 
            This field matches your problem-solving style and interests. Explore careers in this category to find your perfect professional path!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 border-2 border-yellow text-yellow font-bold tracking-[0.2em] hover:bg-yellow hover:text-navy transition-all duration-300"
            >
              RETAKE QUIZ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[currentStep];

  return (
    <div className="min-h-screen bg-navy text-cream p-8 md:p-20 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[10px] font-bold tracking-widest opacity-40 uppercase">Question {currentStep + 1} / {QUIZ_QUESTIONS.length}</span>
            <span className="text-[10px] font-bold tracking-widest text-yellow uppercase">{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-cream/10 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-yellow h-full"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl md:text-5xl font-serif mb-12 text-white leading-tight">{question.question}</h2>

            <div className="grid grid-cols-1 gap-4">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(option.weights)}
                  className="group flex items-center justify-between p-6 border border-cream/20 bg-cream/5 hover:bg-yellow hover:text-navy transition-all duration-300 text-left"
                >
                  <span className="text-lg font-medium">{option.text}</span>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 transition-transform" />
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const Resources = ({ resources }: { resources: any[] }) => (
  <div className="min-h-screen bg-navy text-cream p-8 md:p-20">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-5xl md:text-8xl font-serif mb-20 text-white">Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((res, i) => (
          <div key={i} className={`p-10 border border-cream/10 flex flex-col justify-between ${i === 0 ? 'lg:col-span-2 bg-white/5 text-cream' : 'bg-white/5'}`}>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-4 block italic">{res.tag}</span>
              <h3 className="text-4xl font-serif mb-6">{res.title}</h3>
              <p className="text-lg opacity-70 mb-8">{res.desc}</p>
            </div>
            <button className={`flex items-center gap-2 font-bold text-xs tracking-widest hover:opacity-60 text-white`}>
              READ ARTICLE <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Team = ({ members }: { members: any[] }) => (
  <div className="min-h-screen bg-navy text-cream p-8 md:p-20">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-5xl md:text-8xl font-serif mb-20 text-white">Our Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.map((member, i) => (
          <div key={i} className="group">
            <div className="aspect-[3/4] bg-cream/5 mb-6 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
              <img src={`https://picsum.photos/seed/${member.name}/600/800`} alt={member.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
            </div>
            <h3 className="text-2xl font-serif mb-2">{member.name}</h3>
            <p className="text-[10px] font-bold tracking-widest uppercase text-cream/40 mb-4 italic">{member.role}</p>
            <p className="text-sm opacity-60 leading-relaxed">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
