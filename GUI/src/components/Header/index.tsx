import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { MdOutlineExpandMore } from 'react-icons/md';

import { Track, Button, Icon, Drawer, Section, SwitchBox } from 'components';
import useUserInfoStore from 'store/store';
import { UserProfileSettings } from 'types/userProfileSettings';
import { useToast } from 'hooks/useToast';
import api from 'services/api';
import { ReactComponent as BykLogo } from 'assets/logo.svg';
import './Header.scss';

const Header: FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfoStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const { data: userProfileSettings } = useQuery<UserProfileSettings>({
    queryKey: ['cs-get-user-profile-settings'],
  });

  const userProfileSettingsMutation = useMutation({
    mutationFn: (data: UserProfileSettings) => api.post('cs-set-user-profile-settings', data),
    onError: async (error: AxiosError) => {
      await queryClient.invalidateQueries(['cs-get-user-profile-settings']);
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleUserProfileSettingsChange = (key: string, checked: boolean) => {
    if (!userProfileSettings) return;
    const newSettings = {
      ...userProfileSettings,
      [key]: checked,
    };
    userProfileSettingsMutation.mutate(newSettings);
  };

  return (
    <>
      <header className='header'>
        <Track justify='between'>
          <BykLogo height={50} />

          {userInfo && (
            <Track gap={32}>
              <Button appearance='text' onClick={() => setUserDrawerOpen(!userDrawerOpen)}>
                {userInfo.displayName}
                <Icon icon={<MdOutlineExpandMore />} />
              </Button>
              <Button appearance='text' style={{ textDecoration: 'underline' }}>{t('global.logout')}</Button>
            </Track>
          )}
        </Track>
      </header>

      {userInfo && userProfileSettings && userDrawerOpen && (
        <Drawer title={userInfo.displayName} onClose={() => setUserDrawerOpen(false)} style={{ width: 400 }}>
          <Section>
            <Track gap={8} direction='vertical' align='left'>
              {[
                { label: t('settings.users.displayName'), value: userInfo.displayName },
                {
                  label: t('settings.users.userRoles'),
                  value: userInfo.authorities.map((r) => t(`roles.${r}`)).join(', '),
                },
                { label: t('settings.users.email'), value: userInfo.email },
              ].map((meta, index) => (
                <Track key={`${meta.label}-${index}`} gap={24} align='left'>
                  <p style={{ flex: '0 0 120px' }}>{meta.label}:</p>
                  <p>{meta.value}</p>
                </Track>
              ))}
            </Track>
          </Section>
          <Section>
            <Track gap={8} direction='vertical' align='left'>
              <p className='h6'>{t('settings.users.autoCorrector')}</p>
              <SwitchBox
                name='useAutocorrect'
                label={t('settings.users.useAutocorrect')}
                checked={userProfileSettings.useAutocorrect}
                onCheckedChange={(checked) => handleUserProfileSettingsChange('useAutocorrect', checked)}
              />
            </Track>
          </Section>
          <Section>
            <Track gap={8} direction='vertical' align='left'>
              <p className='h6'>{t('settings.users.emailNotifications')}</p>
              <SwitchBox
                name='forwardedChatEmailNotifications'
                label={t('settings.users.newForwardedChat')}
                checked={userProfileSettings.forwardedChatEmailNotifications}
                onCheckedChange={(checked) => handleUserProfileSettingsChange('forwardedChatEmailNotifications', checked)}
              />
              <SwitchBox
                name='newChatEmailNotifications'
                label={t('settings.users.newUnansweredChat')}
                checked={userProfileSettings.newChatEmailNotifications}
                onCheckedChange={(checked) => handleUserProfileSettingsChange('newChatEmailNotifications', checked)}
              />
            </Track>
          </Section>
          <Section>
            <Track gap={8} direction='vertical' align='left'>
              <p className='h6'>{t('settings.users.soundNotifications')}</p>
              <SwitchBox
                name='forwardedChatSoundNotifications'
                label={t('settings.users.newForwardedChat')}
                checked={userProfileSettings.forwardedChatSoundNotifications}
                onCheckedChange={(checked) => handleUserProfileSettingsChange('forwardedChatSoundNotifications', checked)}
              />
              <SwitchBox
                name='newChatSoundNotifications'
                label={t('settings.users.newUnansweredChat')}
                checked={userProfileSettings.newChatSoundNotifications}
                onCheckedChange={(checked) => handleUserProfileSettingsChange('newChatSoundNotifications', checked)}
              />
            </Track>
          </Section>
          <Section>
            <Track gap={8} direction='vertical' align='left'>
              <p className='h6'>{t('settings.users.popupNotifications')}</p>
              <SwitchBox
                name='forwardedChatPopupNotifications'
                label={t('settings.users.newForwardedChat')}
                checked={userProfileSettings.forwardedChatPopupNotifications}
                onCheckedChange={(checked) => handleUserProfileSettingsChange('forwardedChatPopupNotifications', checked)}
              />
              <SwitchBox
                name='newChatPopupNotifications'
                label={t('settings.users.newUnansweredChat')}
                checked={userProfileSettings.newChatPopupNotifications}
                onCheckedChange={(checked) => handleUserProfileSettingsChange('newChatPopupNotifications', checked)}
              />
            </Track>
          </Section>
        </Drawer>
      )}
    </>
  );
};

export default Header;
