import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, X, ArrowRight, Activity, PieChart, Zap, CreditCard, LayoutDashboard } from 'lucide-react';

// Utilities
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};

const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 1. Navigation
const LandingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);
  const blur = useTransform(scrollY, [0, 100], [0, 8]);
  const { user } = useSelector(state => state.auth);

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between pointer-events-none"
      >
        {/* Background layer */}
        <motion.div 
          className="absolute inset-0 bg-cream pointer-events-auto border-b border-cream-secondary"
          style={{ opacity: bgOpacity, backdropFilter: `blur(${blur}px)` }}
        />
        
        <Link to="/" className="relative z-10 font-serif text-3xl tracking-tighter text-ink pointer-events-auto">Sundae</Link>
        
        <div className="hidden md:flex relative z-10 items-center space-x-10 font-medium text-xs tracking-[0.2em] uppercase pointer-events-auto">
          <a href="#showcase" className="text-ink hover:text-yellow transition-colors">Experience</a>
          <a href="#features" className="text-ink hover:text-yellow transition-colors">Features</a>
          {user ? (
            <Link to="/app" className="bg-ink text-cream px-6 py-3 hover:bg-yellow hover:text-ink transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link to="/register" className="bg-ink text-cream px-6 py-3 hover:bg-yellow hover:text-ink transition-colors">
              Start
            </Link>
          )}
        </div>

        <button 
          className="md:hidden relative z-50 p-2 text-ink pointer-events-auto" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X strokeWidth={1.5} size={32} /> : <Menu strokeWidth={1.5} size={32} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ink flex flex-col justify-center px-12"
          >
            <div className="flex flex-col space-y-6">
              {[
                { name: 'Experience', href: '#showcase' },
                { name: 'Features', href: '#features' },
                user ? { name: 'Dashboard', href: '/app' } : { name: 'Sign up', href: '/register' },
                !user && { name: 'Sign in', href: '/login' }
              ].filter(Boolean).map((link, i) => (
                <motion.div 
                  key={link.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {link.href.startsWith('#') ? (
                    <a href={link.href} onClick={() => setIsOpen(false)} className="font-serif text-5xl sm:text-7xl text-cream hover:text-yellow transition-colors">
                      {link.name}
                    </a>
                  ) : (
                    <Link to={link.href} onClick={() => setIsOpen(false)} className="font-serif text-5xl sm:text-7xl text-cream hover:text-yellow transition-colors">
                      {link.name}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// 2. Hero (Experimental)
const Hero = ({ onInitialize }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  useEffect(() => {
    if (isMobile || reducedMotion) return;
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, reducedMotion]);

  const smoothX = useSpring(mousePos.x, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mousePos.y, { stiffness: 50, damping: 20 });

  return (
    <>
      <section className="relative min-h-screen pt-32 pb-20 px-6 overflow-hidden bg-cream flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center justify-between">
        
        {/* Typographic Core */}
        <div className="w-full lg:w-[60%] relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-xs uppercase tracking-[0.3em] font-medium text-olive mb-12 flex items-center space-x-4"
          >
            <div className="w-8 h-px bg-olive" />
            <span>The clarity engine</span>
          </motion.div>
          
          <h1 className="font-serif text-[14vw] lg:text-[8rem] leading-[0.9] tracking-tighter text-ink m-0">
            <motion.div 
              initial={{ opacity: 0, y: 40, rotateZ: 2 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              MAKE SENSE
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 40, rotateZ: 2 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative inline-block mt-4 lg:mt-0"
            >
              <span className="relative z-10">OF YOUR MONEY.</span>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-[10%] left-0 w-[105%] h-[35%] bg-yellow origin-left -z-0 mix-blend-multiply"
              />
            </motion.div>
          </h1>
          
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 1 }}
             className="mt-16 lg:mt-24"
          >
            <button onClick={onInitialize} className="inline-flex items-center space-x-6 group cursor-pointer border border-ink/10 pl-2 pr-8 py-2 rounded-full hover:border-ink/30 transition-colors bg-white outline-none">
              <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center group-hover:bg-yellow group-hover:scale-95 transition-all duration-300">
                <ArrowRight className="text-cream group-hover:text-ink w-5 h-5 transition-colors" />
              </div>
              <span className="font-medium tracking-[0.2em] uppercase text-xs text-ink">
                Initialize
              </span>
            </button>
          </motion.div>
        </div>

        {/* Abstract Object (Aesthetic / Gen-Z) */}
        <div className="w-full lg:w-[40%] mt-20 lg:mt-0 relative h-[500px] flex items-center justify-center perspective-[2000px]">
          
          <motion.div 
            style={isMobile || reducedMotion ? {} : { rotateX: smoothY, rotateY: smoothX }}
            className="relative w-full h-full max-w-[400px] transform-style-3d flex items-center justify-center"
          >
            {/* Spinning Circular Text */}
            <motion.div 
              animate={reducedMotion ? {} : { rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[350px] h-[350px] opacity-40 pointer-events-none"
              style={{ transform: 'translateZ(-60px)' }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <defs>
                  <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" />
                </defs>
                <text className="text-[9px] font-medium tracking-[0.2em] fill-ink uppercase">
                  <textPath href="#circlePath" startOffset="0%">
                    Personal Capital • Financial Clarity • System Online • 
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* The Receipt / Log (Background Layer) */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotateZ: -5 }}
              animate={{ opacity: 1, y: 0, rotateZ: -5 }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-56 h-80 bg-[#FDFCF8] border border-ink/10 shadow-xl p-5 flex flex-col font-mono text-[10px] text-ink/60"
              style={{ transform: 'translateZ(-20px)' }}
            >
              <div className="flex justify-between border-b border-ink/10 pb-3 mb-3 uppercase tracking-widest text-ink font-bold">
                <span>Receipt</span>
                <span>#4092</span>
              </div>
              <div className="flex justify-between py-1.5"><span>System</span><span>OK</span></div>
              <div className="flex justify-between py-1.5"><span>Sync</span><span>24ms</span></div>
              <div className="flex justify-between py-1.5"><span>Capital</span><span>Verified</span></div>
              <div className="flex justify-between py-1.5"><span>Anomalies</span><span>0</span></div>
              <div className="mt-auto border-t border-ink/10 pt-3 flex justify-between items-end">
                <span>Total</span><span className="text-ink font-bold font-serif text-lg leading-none">₹24,500</span>
              </div>
            </motion.div>

            {/* The Main Dark Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotateZ: 5 }}
              animate={{ opacity: 1, y: 0, rotateZ: 5 }}
              transition={{ duration: 1.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-64 h-40 bg-[#171714]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
              style={{ transform: 'translateZ(40px)' }}
            >
              {/* Noise texture overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGZpbHRlciBpZD0ibm9pc2UiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjgiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2UpIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=')]" />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className="w-10 h-10 rounded-full bg-yellow flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#171714" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>
                </div>
                <div className="text-white/40 text-[10px] tracking-widest uppercase font-mono">Status: Active</div>
              </div>
              <div className="relative z-10 font-serif text-5xl text-cream tracking-tighter leading-none mt-2">
                82% <span className="text-sm font-sans text-white/40 tracking-widest font-medium uppercase ml-2">Growth</span>
              </div>
            </motion.div>

            {/* Floating Badges */}
            <motion.div 
              animate={reducedMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] left-[5%] bg-yellow border border-ink/20 text-ink font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg rotate-[-12deg]"
              style={{ transform: 'translateZ(80px)' }}
            >
              100% Valid
            </motion.div>

            <motion.div 
              animate={reducedMotion ? {} : { y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[20%] right-[5%] bg-coral text-ink font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg border border-ink/10 rotate-[5deg]"
              style={{ transform: 'translateZ(60px)' }}
            >
              Verified +
            </motion.div>

            <motion.div 
              animate={reducedMotion ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/4 -right-4 w-12 h-12 bg-olive/20 backdrop-blur-md rounded-full border border-olive/30 flex items-center justify-center shadow-lg"
              style={{ transform: 'translateZ(100px)' }}
            >
              <Activity className="w-5 h-5 text-olive" />
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
};

// 3. Creative Scroll Intro
const MoneyIntro = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const value = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 10000]);
  const displayValue = useTransform(value, v => `₹ ${Math.floor(v).toLocaleString()}`);
  const textOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const numOpacity = useTransform(scrollYProgress, [0.7, 0.9], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[120vh] bg-[#FDFCF8] flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[30%] bg-ink/10" />
      
      <div className="sticky top-1/2 -translate-y-1/2 text-center">
        <motion.div style={{ opacity: numOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div className="font-serif text-[15vw] tracking-tighter text-ink/20 whitespace-nowrap">
            {displayValue}
          </motion.div>
        </motion.div>
        
        <motion.div style={{ opacity: textOpacity }} className="relative z-10 font-serif text-[10vw] md:text-8xl leading-none tracking-tighter text-ink">
          Every number <br />
          <span className="text-olive">tells a story.</span>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-[30%] bg-ink/10" />
    </section>
  );
};

// 4. Product Showcase (Interactive Editorial)
const ProductShowcase = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const y = useTransform(scrollYProgress, [0, 0.4], [200, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1]);

  return (
    <section id="showcase" ref={containerRef} className="py-40 px-6 bg-[#FDFCF8] overflow-hidden perspective-[2000px]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          style={{ rotateX, y, scale }}
          className="relative rounded-3xl bg-white border border-cream-secondary shadow-2xl overflow-hidden transform-style-3d"
        >
          {/* Header */}
          <div className="h-14 border-b border-cream-secondary flex items-center px-6 space-x-3 bg-cream/30">
            <div className="w-3 h-3 rounded-full bg-coral/80" />
            <div className="w-3 h-3 rounded-full bg-yellow/80" />
            <div className="w-3 h-3 rounded-full bg-olive/80" />
          </div>
          
          <div className="p-8 md:p-12 grid md:grid-cols-12 gap-12 bg-white">
            {/* Sidebar */}
            <div className="hidden md:block col-span-3 space-y-12">
              <div className="space-y-4">
                <div className="h-4 w-20 bg-ink/5 rounded-sm" />
                <div className="h-8 w-full bg-ink/5 rounded-sm" />
                <div className="h-8 w-3/4 bg-ink/5 rounded-sm" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-20 bg-ink/5 rounded-sm" />
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-ink/5" />
                    <div className="h-4 w-24 bg-ink/5 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-12 md:col-span-9 space-y-12">
              <div className="flex justify-between items-end border-b border-cream-secondary pb-6">
                <div>
                  <FadeUp delay={0.2}><div className="text-xs uppercase tracking-widest text-olive mb-2">Total Balance</div></FadeUp>
                  <FadeUp delay={0.3}><div className="font-serif text-5xl">₹24,500.00</div></FadeUp>
                </div>
                <FadeUp delay={0.4}>
                  <div className="h-10 w-32 bg-ink text-cream text-xs uppercase tracking-widest flex items-center justify-center rounded-full">
                    Add Entry
                  </div>
                </FadeUp>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: "Income", value: "₹80,000", bg: "bg-ink", text: "text-cream", highlight: "bg-yellow", icon: <ArrowRight className="w-4 h-4 -rotate-45" /> },
                  { label: "Expenses", value: "₹45,200", bg: "bg-white", text: "text-ink", border: true, highlight: "bg-coral", icon: <ArrowRight className="w-4 h-4 rotate-45" /> },
                  { label: "Transfers", value: "₹10,300", bg: "bg-[#F3F0E6]", text: "text-ink", highlight: "bg-olive", icon: <ArrowRight className="w-4 h-4" /> }
                ].map((card, i) => (
                  <FadeUp key={i} delay={0.4 + (i * 0.1)}>
                    <motion.div 
                      whileHover={{ scale: 1.02, rotateZ: i === 1 ? 1 : -1 }}
                      className={`relative p-6 rounded-2xl ${card.bg} ${card.text} ${card.border ? 'border border-cream-secondary' : ''} h-36 flex flex-col justify-between overflow-hidden group cursor-crosshair`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-[10px] uppercase tracking-widest opacity-60 font-mono">{card.label}</div>
                        <div className={`w-8 h-8 rounded-full ${card.highlight} text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110`}>
                          {card.icon}
                        </div>
                      </div>
                      <div className="font-serif text-3xl z-10">{card.value}</div>
                      
                      {/* Decorative background element */}
                      {i === 0 && <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />}
                    </motion.div>
                  </FadeUp>
                ))}
              </div>

              <div>
                <FadeUp delay={0.7}><div className="text-[10px] uppercase tracking-[0.2em] text-olive mb-6 font-mono border-b border-cream-secondary pb-4">Recent Ledger Activity</div></FadeUp>
                <div className="space-y-3 mt-4">
                  {[
                    { title: "Design Subscription", amount: "-₹1,200", type: "expense", color: "bg-coral", date: "Today, 14:20" },
                    { title: "Client Retainer", amount: "+₹45,000", type: "income", color: "bg-yellow", date: "Yesterday" },
                    { title: "Server Costs", amount: "-₹3,400", type: "expense", color: "bg-olive", date: "Oct 12" }
                  ].map((item, i) => (
                    <FadeUp key={i} delay={0.8 + (i * 0.1)}>
                      <motion.div 
                        whileHover={{ x: 10 }}
                        className="group relative flex items-center justify-between p-4 rounded-xl border border-cream-secondary/50 hover:bg-[#F3F0E6] hover:border-cream-secondary transition-all cursor-pointer overflow-hidden"
                      >
                        {/* Hover indicator strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color} transform -translate-x-full group-hover:translate-x-0 transition-transform`} />
                        
                        <div className="flex items-center space-x-4 relative z-10">
                          <div className={`w-10 h-10 rounded-full ${item.color}/10 flex items-center justify-center`}>
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          </div>
                          <div>
                            <div className="font-medium text-ink mb-1">{item.title}</div>
                            <div className="text-[10px] uppercase tracking-widest text-olive font-mono">{item.date}</div>
                          </div>
                        </div>
                        <div className="font-serif text-xl text-ink relative z-10">{item.amount}</div>
                      </motion.div>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// 5. Feature Journey (Asymmetric, unique layouts)
const FeatureJourney = () => {
  const reducedMotion = useReducedMotion();
  return (
    <section id="features" className="py-40 px-6 bg-ink text-cream overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-40">
        
        {/* Feature 01: One View */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <div className="space-y-8">
              <div className="text-xs uppercase tracking-widest text-yellow">01 / Convergence</div>
              <h3 className="font-serif text-5xl md:text-7xl leading-[0.9] tracking-tighter">Everything,<br/>in one place.</h3>
              <p className="text-olive text-xl font-light">Disparate accounts, random expenses, and hidden transfers converging into a single source of truth.</p>
            </div>
          </FadeUp>
          <div className="relative h-96 bg-[#171714] border border-[#2A2A25] rounded-3xl overflow-hidden flex items-center justify-center group">
            {/* Visual: scattered things merging into center on hover */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full max-w-sm h-full">
                <div className="absolute left-0 top-1/4 w-32 h-12 bg-white/5 rounded-lg border border-white/10 group-hover:translate-x-12 group-hover:opacity-0 transition-all duration-700" />
                <div className="absolute right-0 bottom-1/4 w-40 h-16 bg-white/5 rounded-lg border border-white/10 group-hover:-translate-x-12 group-hover:opacity-0 transition-all duration-700 delay-100" />
                
                <div className="absolute inset-0 flex flex-col justify-center items-center space-y-4 opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-95 group-hover:scale-100">
                  <div className="w-full h-12 bg-cream text-ink rounded-lg flex items-center px-4 font-serif text-lg shadow-xl">Bank Balance</div>
                  <div className="w-full h-12 bg-white/10 border border-white/20 rounded-lg flex items-center px-4 font-serif text-lg">Credit Card</div>
                  <div className="w-full h-12 bg-white/10 border border-white/20 rounded-lg flex items-center px-4 font-serif text-lg">Cash</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 02: Budgets */}
        <div className="grid lg:grid-cols-2 gap-16 items-center flex-col-reverse lg:flex-row-reverse">
          <FadeUp>
            <div className="space-y-8 lg:pl-16">
              <div className="text-xs uppercase tracking-widest text-yellow">02 / Guardrails</div>
              <h3 className="font-serif text-5xl md:text-7xl leading-[0.9] tracking-tighter">Budgets that<br/>make sense.</h3>
              <p className="text-olive text-xl font-light">Set limits. Watch them visually fill up. Know exactly when to pull back and when to spend.</p>
            </div>
          </FadeUp>
          <div className="relative h-96 bg-[#171714] border border-[#2A2A25] rounded-3xl overflow-hidden flex items-center justify-center group">
            <div className="w-full max-w-md px-12">
              <div className="flex justify-between text-xs tracking-widest uppercase mb-4 text-olive">
                <span>Spent</span>
                <span>Limit</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-0 bg-yellow group-hover:w-[75%] transition-all duration-1000 ease-out" />
              </div>
              <div className="flex justify-between mt-4">
                <div className="font-serif text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300">₹15,000</div>
                <div className="font-serif text-3xl text-olive">₹20,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 03: Spending */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <div className="space-y-8">
              <div className="text-xs uppercase tracking-widest text-yellow">03 / Analytics</div>
              <h3 className="font-serif text-5xl md:text-7xl leading-[0.9] tracking-tighter">Understand<br/>your spending.</h3>
              <p className="text-olive text-xl font-light">No spreadsheets. Just clean, interactive visual representations of your capital allocation.</p>
            </div>
          </FadeUp>
          <div className="relative h-96 bg-[#171714] border border-[#2A2A25] rounded-3xl overflow-hidden flex items-center justify-center p-8">
            <div className="w-full flex flex-col space-y-2">
              {[
                { name: 'Food', w: 'w-[40%]', bg: 'bg-yellow' },
                { name: 'Housing', w: 'w-[65%]', bg: 'bg-olive' },
                { name: 'Transport', w: 'w-[20%]', bg: 'bg-coral' }
              ].map((c, i) => (
                <div key={i} className="group/item flex items-center space-x-4 cursor-pointer">
                  <div className="w-24 text-right text-xs uppercase tracking-widest font-medium text-white/40 group-hover/item:text-white transition-colors">{c.name}</div>
                  <div className="flex-1 h-12 bg-white/5 rounded-lg overflow-hidden group-hover/item:bg-white/10 transition-colors">
                    <div className={`h-full ${c.w} ${c.bg} transform -translate-x-full group-hover/item:translate-x-0 transition-transform duration-500`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature 04: AI */}
        <div className="grid lg:grid-cols-2 gap-16 items-center flex-col-reverse lg:flex-row-reverse">
          <FadeUp>
            <div className="space-y-8 lg:pl-16">
              <div className="text-xs uppercase tracking-widest text-yellow">04 / Intelligence</div>
              <h3 className="font-serif text-5xl md:text-7xl leading-[0.9] tracking-tighter">AI that<br/>explains.</h3>
              <p className="text-olive text-xl font-light">Sundae reads your ledger, identifies anomalies, and explains exactly why your numbers look the way they do.</p>
            </div>
          </FadeUp>
          <div className="relative h-[450px] rounded-3xl overflow-hidden flex items-center justify-center group cursor-crosshair bg-ink border border-[#2A2A25]">
            
            {/* The "AI Core" - A massive blurred rotating gradient */}
            <motion.div 
              className="absolute w-96 h-96 bg-[conic-gradient(from_0deg,#F4CF68,#D4D386,#E88268,#F4CF68)] rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Floating Panels */}
            <div className="relative z-10 w-full max-w-sm">
              
              {/* Primary Data Card (Glassmorphic) */}
              <motion.div 
                whileHover={{ y: -5, rotateX: 5, rotateY: -5 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative mb-[-30px] ml-4 mr-12 z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Anomaly Detected</div>
                  <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                </div>
                <div className="font-serif text-3xl text-cream">Dining</div>
                <div className="text-coral font-mono text-xl mt-1">▲ 18.4%</div>
              </motion.div>

              {/* AI Analysis Bubble */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white text-ink p-6 rounded-2xl shadow-2xl border border-cream-secondary relative ml-12 mr-4 z-20"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 rounded bg-yellow flex items-center justify-center">
                    <Zap className="w-3 h-3 text-ink" />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold">Sundae Intelligence</div>
                </div>
                
                {/* Typewriter reveal */}
                <div className="relative overflow-hidden">
                  <motion.div 
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                    className="text-sm font-medium leading-relaxed"
                  >
                    Found 4 unusually large weekend transactions. <br/><br/>
                    <span className="text-ink/60 font-serif italic text-base">"Consider adjusting your weekday limits to balance the ledger."</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// 6. Signature Interaction: Money Flow
const MoneyFlow = () => {
  return (
    <section className="py-40 px-6 bg-cream overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-32">
          <h2 className="font-serif text-6xl md:text-8xl tracking-tighter leading-none text-ink">FOLLOW THE MONEY.</h2>
        </FadeUp>

        <div className="relative w-full max-w-5xl mx-auto aspect-[10/6] mt-20 hidden md:block">
          
          {/* Fluid Curved SVG Path */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M 200,150 C 350,150 350,300 500,300" 
                fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/10" strokeDasharray="8 8" 
              />
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                d="M 500,300 C 650,300 650,150 800,150" 
                fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/10" strokeDasharray="8 8" 
              />
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                d="M 500,300 C 650,300 650,450 800,450" 
                fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/10" strokeDasharray="8 8" 
              />
              
              {/* Moving Orbs along the paths */}
              <circle r="6" fill="#D4D386" className="text-olive">
                <animateMotion dur="4s" repeatCount="indefinite" path="M 200,150 C 350,150 350,300 500,300" />
              </circle>
              <circle r="6" fill="#E88268" className="text-coral">
                <animateMotion dur="4s" repeatCount="indefinite" path="M 500,300 C 650,300 650,150 800,150" />
              </circle>
              <circle r="6" fill="#F4CF68" className="text-yellow">
                <animateMotion dur="4s" repeatCount="indefinite" path="M 500,300 C 650,300 650,450 800,450" />
              </circle>
            </svg>
          </div>

          <div className="absolute inset-0 z-10">
            {/* Source: Income */}
            <div className="absolute left-[20%] top-[25%] -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-40 h-24 bg-white border border-cream-secondary shadow-xl rounded-2xl flex flex-col items-center justify-center cursor-crosshair hover:scale-110 transition-all rotate-[-6deg]">
                <div className="text-[9px] uppercase tracking-widest text-olive mb-1">Source</div>
                <div className="font-serif text-2xl">Income</div>
              </div>
              <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-56 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="text-xs bg-ink text-cream p-4 rounded-xl shadow-2xl">Money enters your ecosystem here.</div>
              </div>
            </div>

            {/* Hub: Account */}
            <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-56 h-56 bg-ink rounded-[2rem] shadow-2xl flex flex-col items-center justify-center cursor-crosshair hover:scale-105 transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(244,207,104,0.15),_transparent_60%)]" />
                <div className="text-[10px] uppercase tracking-widest text-yellow mb-2 z-10">Hub</div>
                <div className="font-serif text-4xl text-cream z-10">Account</div>
              </div>
              <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-64 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="text-xs bg-white text-ink p-4 rounded-xl shadow-2xl border border-cream-secondary">Your central holding. Transfers between accounts do not affect total net worth.</div>
              </div>
            </div>

            {/* Drain: Expense */}
            <div className="absolute left-[80%] top-[25%] -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-40 h-24 bg-white border border-cream-secondary shadow-xl rounded-full flex flex-col items-center justify-center cursor-crosshair hover:scale-110 transition-all rotate-[4deg]">
                <div className="text-[9px] uppercase tracking-widest text-coral mb-1">Drain</div>
                <div className="font-serif text-2xl">Expense</div>
              </div>
              <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-56 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="text-xs bg-coral text-ink font-medium p-4 rounded-xl shadow-2xl">Money leaves your ecosystem. This affects net worth.</div>
              </div>
            </div>

            {/* Credit: Payment */}
            <div className="absolute left-[80%] top-[75%] -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-40 h-24 bg-[#FDFCF8] border border-cream-secondary shadow-xl rounded-xl flex flex-col items-center justify-center cursor-crosshair hover:scale-110 transition-all rotate-[-2deg]">
                <div className="text-[9px] uppercase tracking-widest text-yellow mb-1">Credit</div>
                <div className="font-serif text-2xl">Payment</div>
              </div>
              <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-56 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="text-xs bg-yellow text-ink font-medium p-4 rounded-xl shadow-2xl border border-ink/10">A transfer from Bank to Credit Card. Net impact: ₹0.</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile fallback */}
        <div className="md:hidden flex flex-col space-y-8 mt-12 items-center">
          <div className="w-40 h-24 bg-white border border-cream-secondary shadow-xl rounded-2xl flex flex-col items-center justify-center">
            <div className="text-[9px] uppercase tracking-widest text-olive mb-1">Source</div>
            <div className="font-serif text-2xl">Income</div>
          </div>
          <div className="w-px h-12 bg-ink/20" />
          <div className="w-56 h-56 bg-ink rounded-[2rem] shadow-2xl flex flex-col items-center justify-center">
            <div className="text-[10px] uppercase tracking-widest text-yellow mb-2 z-10">Hub</div>
            <div className="font-serif text-4xl text-cream z-10">Account</div>
          </div>
          <div className="w-px h-12 bg-ink/20" />
          <div className="flex space-x-6">
            <div className="w-32 h-32 bg-white border border-cream-secondary shadow-xl rounded-full flex flex-col items-center justify-center">
              <div className="text-[9px] uppercase tracking-widest text-coral mb-1">Drain</div>
              <div className="font-serif text-xl">Expense</div>
            </div>
            <div className="w-32 h-32 bg-[#FDFCF8] border border-cream-secondary shadow-xl rounded-xl flex flex-col items-center justify-center">
              <div className="text-[9px] uppercase tracking-widest text-yellow mb-1">Credit</div>
              <div className="font-serif text-xl">Payment</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 7. Final CTA (Typographic Lockup)
const FinalCTA = ({ onInitialize }) => {
  return (
    <section className="py-40 px-6 bg-yellow flex flex-col items-center justify-center text-center overflow-hidden">
      <FadeUp>
        <div className="font-serif text-[12vw] md:text-[8rem] leading-[0.85] tracking-tighter text-ink mb-16">
          KNOW YOUR<br/>MONEY.<br/>
          <span className="text-ink/40">NOT JUST YOUR<br/>BALANCE.</span>
        </div>
      </FadeUp>
      
      <FadeUp delay={0.2}>
        <button onClick={onInitialize} className="inline-flex items-center space-x-6 group cursor-pointer border border-ink/20 pl-4 pr-10 py-3 rounded-full hover:bg-ink hover:text-cream transition-colors bg-transparent text-ink">
          <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center group-hover:bg-cream transition-colors">
            <ArrowRight className="text-cream group-hover:text-ink w-5 h-5 transition-colors" />
          </div>
          <span className="font-medium tracking-[0.2em] uppercase text-sm">
            Start
          </span>
        </button>
      </FadeUp>
    </section>
  );
};

// 8. Footer
const Footer = () => (
  <footer className="bg-cream pt-32 pb-12 px-6 border-t border-cream-secondary">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 mb-24">
      <div>
        <div className="font-serif text-5xl mb-6 text-ink tracking-tighter">Sundae</div>
        <div className="text-olive font-light text-lg">Money is everywhere.<br/>Sundae makes it make sense.</div>
      </div>
      <div className="grid grid-cols-2 gap-8 text-xs tracking-widest uppercase font-medium text-olive">
        <div className="flex flex-col space-y-4">
          <div className="text-ink/40 mb-4">Platform</div>
          <Link to="/login" className="hover:text-ink transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-ink transition-colors">Create Account</Link>
          <a href="#features" className="hover:text-ink transition-colors">Features</a>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="text-ink/40 mb-4">Legal</div>
          <span className="hover:text-ink transition-colors cursor-not-allowed">Privacy</span>
          <span className="hover:text-ink transition-colors cursor-not-allowed">Terms</span>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto text-xs text-olive/30 uppercase tracking-widest border-t border-cream-secondary pt-8">
      &copy; {new Date().getFullYear()} Sundae Systems. All rights reserved.
    </div>
  </footer>
);

export default function Landing() {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = () => {
    setIsInitializing(true);
    setTimeout(() => {
      navigate('/register');
    }, 1800);
  };

  return (
    <div className="bg-cream min-h-screen font-sans text-ink selection:bg-yellow selection:text-ink relative">
      <AnimatePresence>
        {isInitializing && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex">
            {/* Staggered Vertical Slices */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.76, 0, 0.24, 1],
                  delay: i * 0.1 
                }}
                className="h-full flex-1 bg-ink"
              />
            ))}
            
            {/* Elegant Typography Reveal */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="overflow-hidden py-8 px-4">
                <motion.div 
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.8 }}
                  className="font-serif text-[18vw] md:text-[15vw] leading-none tracking-tighter text-cream"
                >
                  SUNDAE
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      <LandingNav />
      <Hero onInitialize={handleInitialize} />
      <MoneyIntro />
      <ProductShowcase />
      <FeatureJourney />
      <MoneyFlow />
      <FinalCTA onInitialize={handleInitialize} />
      <Footer />
    </div>
  );
}
