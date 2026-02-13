'use client';
import {useEffect} from 'react';
import {checkMaintenanceModeApi} from "@/app/api/MaintenanceApi";
import {usePathname, useRouter} from "next/navigation";
import {Maintenance, User} from "@/types";
import {useAppDispatch, useAppSelector} from "@/app/redux/hook";
import {dismissAlert, showProgress} from "@/app/helpers/Alert";
import {getProfile} from "@/app/api/ProfileApi";
import {setUserProfile} from "@/app/redux/slices/UserSlice";
import {isMockAuthEnabled} from "@/lib/mock-auth";
import {setToken} from "@/app/redux/slices/AuthSlice";

const ClientWrapper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const authenticate = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch()

  const authRedirect = () => {
    if (isMockAuthEnabled()) {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr && !authenticate) {
        const user = JSON.parse(userStr);
        dispatch(setToken(token));
        dispatch(setUserProfile(user));
      }
      return;
    }

    if(pathname === '/maintenance_mode') {
      router.push('/maintenance_mode');
    }else if(!authenticate && pathname !== '/login') {
      console.log('No token found, redirecting to login...');
      router.push('/login');
    }
  }

  useEffect(() => {
    if(authenticate){
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    if (isMockAuthEnabled()) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        dispatch(setUserProfile(JSON.parse(userStr)));
      }
      return;
    }

    await getProfile().then((res) => {
      const data = res.data.data || ({} as User);
      dispatch(setUserProfile(data));
    });
  };

  /*async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
  }*/

  useEffect(() => {
    // Skip ClientWrapper logic for work_order routes in offline mode
    const currentPath = window.location.pathname;
    if (!navigator.onLine && currentPath.startsWith('/work_order')) {
      if (isMockAuthEnabled()) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr && !authenticate) {
          const user = JSON.parse(userStr);
          dispatch(setToken(token));
          dispatch(setUserProfile(user));
        }
      }
      return; // Exit early
    }

    if ('serviceWorker' in navigator) {
      // registerServiceWorker()
      navigator.serviceWorker.ready.then(() => {}).catch(() => {});
    }

    if(navigator.onLine) {
      showProgress()
      checkMaintenanceModeApi().then(res => {
        try {
          const data = res.data.data || {} as Maintenance;
          if (res.data.status_code === 200 && data.key === 'maintenance_mode' && data.value == 'true') {
            router.push('/maintenance_mode');
            clearAlert()
            return
          } else {
            authRedirect()
            clearAlert()
          }
        } catch (err) {
          authRedirect()
          clearAlert()
        }
      })
    } else {
      // In offline mode, allow work_order routes to function
      const currentPath = window.location.pathname;

      if (currentPath.startsWith('/work_order')) {
        // Don't call authRedirect in offline mode to prevent redirect loops
        // Just check if we have auth data in localStorage for mock auth
        if (isMockAuthEnabled()) {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          if (token && userStr && !authenticate) {
            const user = JSON.parse(userStr);
            dispatch(setToken(token));
            dispatch(setUserProfile(user));
          }
        }
        clearAlert();
      } else if (currentPath === '/' || currentPath === '/login') {
        // Already on home or login page, don't redirect to prevent loop
        if (isMockAuthEnabled()) {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          if (token && userStr && !authenticate) {
            const user = JSON.parse(userStr);
            dispatch(setToken(token));
            dispatch(setUserProfile(user));
          }
        }
        clearAlert();
      } else {
        router.push('/work_order');
      }
    }
  }, []);

  return null;
}

const clearAlert = () => {
  setTimeout(()=>{
    dismissAlert()
  }, 3000)
}

export default ClientWrapper;
