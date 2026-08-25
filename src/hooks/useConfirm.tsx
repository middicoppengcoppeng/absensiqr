import { useState, useCallback } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

export function useConfirm() {
  const [config, setConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger' as 'danger' | 'warning',
    isAlert: false,
    confirmText: 'OK'
  });

  const confirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmText = 'Hapus', 
    type: 'danger' | 'warning' = 'danger'
  ) => {
    setConfig({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm: () => {
        onConfirm();
        setConfig(prev => ({ ...prev, isOpen: false }));
      }, 
      type, 
      isAlert: false, 
      confirmText 
    });
  }, []);

  const showAlert = useCallback((title: string, message: string) => {
    setConfig({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm: () => setConfig(prev => ({ ...prev, isOpen: false })), 
      type: 'danger', 
      isAlert: true, 
      confirmText: 'OK' 
    });
  }, []);

  const close = useCallback(() => {
    setConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmElement = (
    <ConfirmModal
      isOpen={config.isOpen}
      onClose={close}
      onConfirm={config.onConfirm}
      title={config.title}
      message={config.message}
      type={config.type}
      isAlert={config.isAlert}
      confirmText={config.confirmText}
    />
  );

  return { confirm, showAlert, ConfirmElement };
}
