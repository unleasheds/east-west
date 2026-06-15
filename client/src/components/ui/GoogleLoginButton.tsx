import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { authApi } from '../../lib/api';
import { useStore } from '../../store/useStore';

interface Props {
  onSuccess?: () => void;
  compact?: boolean;
}

export default function GoogleLoginButton({ onSuccess, compact = false }: Props) {
  const { login, showToast } = useStore();

  async function handleCredential(response: CredentialResponse) {
    if (!response.credential) {
      showToast('Google sign-in failed', 'error');
      return;
    }
    try {
      const { token, user } = await authApi.googleToken(response.credential);
      login(user, token);
      onSuccess?.();
    } catch {
      showToast('Sign-in failed — please try again', 'error');
    }
  }

  return (
    <GoogleLogin
      onSuccess={handleCredential}
      onError={() => showToast('Google sign-in failed', 'error')}
      useOneTap={false}
      shape="pill"
      size={compact ? 'medium' : 'large'}
      text="signin_with"
      theme="outline"
      logo_alignment="left"
    />
  );
}
