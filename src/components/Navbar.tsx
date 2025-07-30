import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import TranslateIcon from '@mui/icons-material/Translate';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const navLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'الخدمات', href: '/services' },
  { label: 'من نحن', href: '/about' },
  { label: 'تواصل معنا', href: '/contact' },
];

const Navbar = () => {
  const router = useRouter();
  const t = useTranslations();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [lang, setLang] = useState('ar');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
      else setUser(null);
      setLang(typeof window !== 'undefined' ? localStorage.getItem('lang') || 'ar' : 'ar');
    }
  }, []);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAnchorEl(null);
    window.location.reload();
  };

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', newLang);
    setLang(newLang);
    window.location.reload();
  };

  let dashboardLink = '/';
  if (user?.role === 'admin') dashboardLink = '/admin';
  else if (user?.role === 'talent') dashboardLink = '/talent';
  else if (user?.role === 'company') dashboardLink = '/company';
  else if (user?.role === 'user') dashboardLink = '/user';

  return (
    <AppBar position="sticky" elevation={2} sx={{ background: 'rgba(255,255,255,0.90)', boxShadow: '0 2px 16px 0 rgba(96,165,250,0.10)', borderBottom: '1.5px solid #60a5fa' }}>
      <Toolbar className="!px-2 md:!px-8 flex items-center justify-between h-16">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-orange-400 overflow-hidden">
              <Image 
                alt="شعار طوق" 
                src="/logo.png" 
                width={40}
                height={40}
                className="object-contain w-10 h-10" 
              />
            </div>
            <span className="hidden sm:block text-lg font-extrabold bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-tight">منصة الكاستينج الرقمية</span>
          </Link>
        </div>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 lg:gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-blue-900 font-bold text-base px-3 py-1 rounded-lg hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 hover:text-white transition-all">
              {link.label}
            </Link>
          ))}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <IconButton onClick={toggleLang} sx={{ bgcolor: 'rgba(96,165,250,0.10)', color: '#1e293b', border: '2px solid #60a5fa', mr: 1, '&:hover': { bgcolor: '#60a5fa', color: '#fff' } }}>
            <TranslateIcon />
            <span className="hidden sm:inline text-sm font-bold ml-1">{lang === 'ar' ? 'EN' : 'ع'}</span>
          </IconButton>
          {/* User Auth */}
          {!user ? (
            <>
              <Button component={Link} href="/login" variant="outlined" sx={{ borderRadius: 999, borderColor: '#f59e42', color: '#f59e42', fontWeight: 700, px: 2, ml: 1, background: 'rgba(255,255,255,0.80)', border: '2px solid #f59e42', '&:hover': { background: '#f59e42', color: '#fff' } }}>دخول</Button>
              <Button component={Link} href="/register" variant="contained" sx={{ borderRadius: 999, fontWeight: 700, px: 2, background: 'linear-gradient(90deg,#6366f1 0%,#f472b6 100%)', color: '#fff', ml: 1, '&:hover': { background: 'linear-gradient(90deg,#f472b6 0%,#6366f1 100%)', color: '#fff' } }}>تسجيل</Button>
            </>
          ) : (
            <>
              <IconButton onClick={handleAvatarClick} sx={{ p: 0, ml: 1 }}>
                <Avatar
                  src={
                    user.image
                      ? String(user.image)
                      : user.profileImageData
                        ? `data:image/png;base64,${user.profileImageData}`
                        : undefined
                    }
                    sx={{ width: 40, height: 40, bgcolor: '#FFD600', color: '#222', fontWeight: 900, fontSize: 22 }}
                >
                    {user.name ? user.name[0] : 'م'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose} anchorOrigin={{vertical:'bottom',horizontal:'right'}} transformOrigin={{vertical:'top',horizontal:'right'}}>
                <MenuItem onClick={() => { handleMenuClose(); router.push(dashboardLink); }}>لوحة التحكم</MenuItem>
                <MenuItem onClick={handleLogout}>تسجيل خروج</MenuItem>
              </Menu>
            </>
          )}
          {/* Hamburger for mobile */}
          <IconButton className="md:!hidden" onClick={() => setDrawerOpen(true)} sx={{ color: '#1e293b', ml: 1 }}>
            <MenuIcon fontSize="large" />
          </IconButton>
        </div>
        {/* Drawer for mobile nav */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 260, bgcolor: 'rgba(255,255,255,0.98)', height: '100%', color: '#1e293b', display: 'flex', flexDirection: 'column', borderLeft: '2px solid #60a5fa' }}>
            <Box className="flex items-center gap-2 p-4 border-b border-blue-200">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow border-2 border-orange-400 overflow-hidden">
                <Image alt="شعار طوق" src="/logo.png" className="object-contain w-8 h-8" />
              </div>
              <span className="text-base font-extrabold bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">الكاستينج</span>
            </Box>
            <List>
              {navLinks.map(link => (
                <ListItem key={link.href} disablePadding>
                  <ListItemButton component={Link} href={link.href} onClick={()=>setDrawerOpen(false)} sx={{ '&:hover': { background: 'linear-gradient(90deg,#f59e42 0%,#f472b6 100%)', color: '#fff' } }}>
                    <ListItemText primary={link.label} primaryTypographyProps={{fontWeight:700, fontSize: '1.1rem', color:'#1e293b'}} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ bgcolor: '#60a5fa', my: 1 }} />
            <Box className="flex flex-col gap-2 px-4 pb-4 mt-auto">
              {!user ? (
                <>
                  <Button component={Link} href="/login" variant="outlined" sx={{ borderRadius: 999, borderColor: '#f59e42', color: '#f59e42', fontWeight: 700, px: 2, background: 'rgba(255,255,255,0.80)', border: '2px solid #f59e42', '&:hover': { background: '#f59e42', color: '#fff' } }}>دخول</Button>
                  <Button component={Link} href="/register" variant="contained" sx={{ borderRadius: 999, fontWeight: 700, px: 2, background: 'linear-gradient(90deg,#6366f1 0%,#f472b6 100%)', color: '#fff', '&:hover': { background: 'linear-gradient(90deg,#f472b6 0%,#6366f1 100%)', color: '#fff' } }}>تسجيل</Button>
                </>
              ) : (
                <Button onClick={handleLogout} variant="contained" sx={{ borderRadius: 999, fontWeight: 700, px: 2, background: 'linear-gradient(90deg,#f472b6 0%,#f59e42 100%)', color: '#fff', '&:hover': { background: 'linear-gradient(90deg,#f59e42 0%,#f472b6 100%)', color: '#fff' } }}>تسجيل خروج</Button>
              )}
            </Box>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 