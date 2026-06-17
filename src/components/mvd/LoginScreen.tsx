import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import * as api from '@/lib/api';

const DEFAULT_LOGO = 'https://cdn.poehali.dev/projects/4f49b569-8141-4d0e-a49b-b102488ec312/files/2cea122d-1a4c-496e-a9fa-17cf85b776e2.jpg';

interface Props {
  onLogin: (officer: api.Officer) => void;
}

const LoginScreen = ({ onLogin }: Props) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.auth(login, password);
    setLoading(false);
    if (res.ok && res.officer) {
      localStorage.setItem('mvd_officer', JSON.stringify(res.officer));
      onLogin(res.officer);
    } else {
      setError(res.error || 'Ошибка входа');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-6 text-center">
          <img src={DEFAULT_LOGO} alt="герб" className="mx-auto mb-4 h-20 w-20 rounded-sm object-cover" />
          <h1 className="font-display text-xl font-700 uppercase tracking-wide text-primary-foreground">
            Министерство внутренних дел
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/60">Единая информационная система</p>
        </div>

        <form onSubmit={submit} className="space-y-4 border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center gap-2 text-primary">
            <Icon name="Lock" size={18} />
            <span className="font-display uppercase tracking-wide">Авторизация</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Логин сотрудника</Label>
            <Input value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Пароль</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            <Icon name={loading ? 'Loader' : 'LogIn'} size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Проверка...' : 'Войти в систему'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Учётные записи создаются во вкладке «Сотрудники»
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
