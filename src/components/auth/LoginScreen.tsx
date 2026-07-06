import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { APP } from '@/config/app';
import { cardEntrance } from '@/lib/motion/motionPresets';
import { BrandMark } from '@/components/layout/Brand';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

type Phase = 'idle' | 'sending' | 'sent' | 'error';

export function LoginScreen() {
  const signIn = useAuthStore((s) => s.signInWithEmail);
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setPhase('sending');
    setError(null);
    const res = await signIn(email);
    if (res.ok) {
      setPhase('sent');
    } else {
      setPhase('error');
      setError(res.error ?? 'Etwas ist schiefgelaufen.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <motion.div
        variants={cardEntrance}
        initial="initial"
        animate="animate"
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7 shadow-card edge-light"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size={44} />
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-content">{APP.name}</h1>
          <p className="mt-1 text-[13px] text-content-muted">
            Melde dich an, um deine Aufgaben geräteübergreifend zu synchronisieren.
          </p>
        </div>

        {phase === 'sent' ? (
          <div className="rounded-xl border border-success/25 bg-success/10 px-4 py-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-success/20 text-success">
              <Icon name="check" size={18} strokeWidth={2.4} />
            </div>
            <p className="text-sm font-medium text-content">Check dein Postfach</p>
            <p className="mt-1 text-[12px] text-content-muted">
              Wir haben einen Login-Link an <span className="text-content">{email}</span> geschickt. Öffne ihn auf
              diesem Gerät.
            </p>
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="mt-3 text-[12px] text-content-faint transition-colors hover:text-primary"
            >
              Andere E-Mail verwenden
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              leftIcon={<Icon name="send" size={16} />}
            />
            {phase === 'error' && error && <p className="text-[12px] text-critical">{error}</p>}
            <Button type="submit" variant="primary" block disabled={phase === 'sending' || !email.trim()}>
              {phase === 'sending' ? 'Sende Link …' : 'Magic Link senden'}
            </Button>
            <p className="text-center text-[11px] text-content-faint">
              Passwortlos – du bekommst einen einmaligen Login-Link per E-Mail.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
