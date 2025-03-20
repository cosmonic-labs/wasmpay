import React from 'react';
import {Navigation} from '@/layout/Navigation';
import {PageContent} from '@/layout/PageContent';
import {Sidebar} from '@/layout/Sidebar';
import {TopNav} from '@/layout/TopNav';
import {Dashboard} from '@/features/dashboard/components/Dashboard';

export interface UserInformation {
  login: string;
  avatar_url: string;
  name: string;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserInformation | null>(null);

  React.useEffect(() => {
    if (window.location.pathname === '/' && user === null) {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.pop()?.split(';').shift();
      };

      const user_info = getCookie('user');
      if (user_info !== undefined && user_info !== null && user_info !== '') {
        const decoded = atob(user_info);
        const parsed = JSON.parse(decoded) as UserInformation;
        setUser(parsed);
      }
    }
  }, [user]);

  return (
    <div>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <Navigation />
      </Sidebar>
      <TopNav setSidebarOpen={setSidebarOpen} user={user}></TopNav>
      <PageContent>
        <Dashboard user={user} />
      </PageContent>
    </div>
  );
}

export default App;
