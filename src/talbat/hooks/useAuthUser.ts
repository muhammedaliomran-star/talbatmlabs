import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '../types';

const colors = ['bg-[#B08948]', 'bg-[#3F7A5D]', 'bg-[#2C4568]', 'bg-[#B4463A]'];

export function useAuthUser() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (s: Session) => {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', s.user.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', s.user.id),
    ]);

    const fallbackName =
      (s.user.user_metadata?.['name'] as string) ||
      (s.user.user_metadata?.['full_name'] as string) ||
      s.user.email?.split('@')[0] ||
      'مستخدم';

    setUser({
      id: s.user.id,
      name: profile?.name || fallbackName,
      email: s.user.email || '',
      role: ((roles?.[0]?.role as UserRole) || 'owner') as UserRole,
      storeName: profile?.store_name || 'متجري',
      phone: profile?.phone || undefined,
      avatarColor: profile?.avatar_color || colors[0],
      createdAt: profile?.created_at || s.user.created_at,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setUser(null);
        setLoading(false);
      } else {
        setTimeout(() => void loadProfile(s), 0);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
      else void loadProfile(data.session);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (updated: User) => {
      if (!session) return;
      setUser(updated);
      await supabase
        .from('profiles')
        .update({
          name: updated.name,
          store_name: updated.storeName,
          phone: updated.phone ?? null,
          avatar_color: updated.avatarColor ?? colors[0],
        })
        .eq('id', session.user.id);
    },
    [session]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return { user, loading, updateProfile, signOut };
}
