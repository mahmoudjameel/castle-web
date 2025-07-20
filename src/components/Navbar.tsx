import React, { useEffect, useState, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const Navbar = () => {
  const router = useRouter();
  const t = useTranslations();
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [lang, setLang] = useState('ar');

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
  else if (user?.role === 'user') dashboardLink = '/';

  return (
    <AppBar position="static" color="primary">
      <Toolbar className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 relative">
            <img alt="شعار طوق" src="/logo.png" className="object-contain" style={{position:'absolute',height:'100%',width:'100%',left:0,top:0,right:0,bottom:0}} />
          </div>
          <button onClick={toggleLang} className="flex items-center gap-1 px-3 py-1 rounded bg-blue-900/40 border border-blue-400/20 hover:bg-orange-400/80 transition-all text-white text-lg font-bold">
            <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 3v18m9-9H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className="hidden sm:block text-sm text-blue-200">منصة الكاستينج الرقمية</div>
        </div>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={Link} href="/">الرئيسية</Button>
          <Button color="inherit" component={Link} href="/services">الخدمات</Button>
          <Button color="inherit" component={Link} href="/about">من نحن</Button>
          <Button color="inherit" component={Link} href="/contact">تواصل معنا</Button>
          {/* باقي عناصر الدخول/التسجيل/الأفاتار ... */}
          {!user ? (
            <>
              <Button color="inherit" component={Link} href="/login">دخول</Button>
              <Button color="inherit" component={Link} href="/register">تسجيل</Button>
            </>
          ) : (
            <>
              <Avatar
                src={user.image ? user.image : (user.profileImageData ? `data:image/png;base64,${user.profileImageData}` : undefined)}
                alt={user.name || 'user'}
                sx={{ cursor: 'pointer', width: 36, height: 36, bgcolor: '#FFD600', color: '#222' }}
                onClick={handleAvatarClick}
              >
                {user.name ? user.name[0] : 'م'}
              </Avatar>
              <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose} anchorOrigin={{vertical:'bottom',horizontal:'right'}} transformOrigin={{vertical:'top',horizontal:'right'}}>
                <MenuItem component={Link} href={dashboardLink} onClick={handleMenuClose}>لوحة التحكم</MenuItem>
                <MenuItem onClick={handleLogout}>تسجيل خروج</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 